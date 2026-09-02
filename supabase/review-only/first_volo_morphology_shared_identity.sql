-- REVIEW ONLY. DO NOT APPLY FROM THE APPLICATION OR AS PART OF THIS PASS.
-- Extends the existing Morphology learner/profile architecture with shared
-- public.students identity and narrow student-only state RPCs.

begin;

alter table public.learner_profiles
  add column student_id uuid null;

alter table public.learner_profiles
  add constraint learner_profiles_student_owner_fkey
  foreign key (student_id, owner_user_id)
  references public.students (id, owner_user_id)
  on delete set null (student_id);

create index learner_profiles_student_owner_idx
  on public.learner_profiles (student_id, owner_user_id)
  where student_id is not null;

create unique index learner_profiles_student_product_active_unique
  on public.learner_profiles (student_id, product_key)
  where student_id is not null and deleted_at is null;

-- Anonymous users currently inherit the authenticated role. Preserve the
-- educator policies but prevent anonymous users from using the broad table API.
create policy learner_profiles_permanent_users_only
  on public.learner_profiles
  as restrictive
  for all
  to authenticated
  using (
    coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false
  )
  with check (
    coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false
  );

create policy learning_state_permanent_users_only
  on public.learning_state
  as restrictive
  for all
  to authenticated
  using (
    coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false
  )
  with check (
    coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false) = false
  );

create or replace function public.get_morphology_access_context()
returns table (
  access_mode text,
  student_id uuid,
  display_name text,
  class_id uuid,
  class_name text,
  educator_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_uid uuid := auth.uid();
  v_is_anonymous boolean :=
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false);
begin
  if v_uid is null then
    return;
  end if;

  if not v_is_anonymous then
    return query
    select
      'educator'::text, null::uuid, null::text, null::uuid, null::text, v_uid
    where exists (
      select 1
      from public.product_entitlements pe
      where pe.owner_user_id = v_uid
        and pe.product_key = 'first-volo-morphology'
        and pe.status = 'active'
        and pe.starts_at <= now()
        and pe.expires_at > now()
    );
    return;
  end if;

  return query
  select
    'student'::text,
    s.id,
    s.display_name,
    c.id,
    c.name,
    sal.owner_user_id
  from public.student_auth_links sal
  join public.students s
    on s.id = sal.student_id
   and s.owner_user_id = sal.owner_user_id
   and s.archived_at is null
  join public.classes c
    on c.id = sal.class_id
   and c.owner_user_id = sal.owner_user_id
   and c.archived_at is null
  join public.class_memberships cm
    on cm.class_id = sal.class_id
   and cm.student_id = sal.student_id
   and cm.owner_user_id = sal.owner_user_id
  join public.class_product_access cpa
    on cpa.class_id = sal.class_id
   and cpa.owner_user_id = sal.owner_user_id
   and cpa.product_key = 'first-volo-morphology'
  where sal.auth_user_id = v_uid
    and sal.revoked_at is null
    and sal.class_id is not null
    and exists (
      select 1
      from public.product_entitlements pe
      where pe.owner_user_id = sal.owner_user_id
        and pe.product_key = 'first-volo-morphology'
        and pe.status = 'active'
        and pe.starts_at <= now()
        and pe.expires_at > now()
    )
  limit 1;
end;
$function$;

create or replace function public.get_morphology_student_state()
returns table (
  learner_profile_id uuid,
  student_id uuid,
  display_name text,
  data jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  with access as (
    select *
    from public.get_morphology_access_context()
    where access_mode = 'student'
      and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true
  )
  select
    lp.id,
    a.student_id,
    a.display_name,
    coalesce(ls.data, '{}'::jsonb),
    ls.client_updated_at,
    ls.updated_at
  from access a
  left join public.learner_profiles lp
    on lp.student_id = a.student_id
   and lp.owner_user_id = a.educator_id
   and lp.product_key = 'first-volo-morphology'
   and lp.deleted_at is null
  left join public.learning_state ls
    on ls.learner_profile_id = lp.id
   and ls.product_key = 'first-volo-morphology'
   and ls.store_key = 'scored-progress';
$function$;

create or replace function public.save_morphology_student_state(
  p_data jsonb,
  p_client_updated_at timestamptz
)
returns table (
  learner_profile_id uuid,
  data jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz,
  write_applied boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_access record;
  v_profile_id uuid;
  v_profile_created_at timestamptz;
  v_now timestamptz := now();
  v_data jsonb;
  v_write_applied boolean := false;
begin
  if auth.uid() is null
     or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false then
    raise exception 'Morphology student access denied';
  end if;

  if p_data is null
     or jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'Morphology state must be a JSON object';
  end if;

  if p_client_updated_at is null then
    raise exception 'Morphology client timestamp is required';
  end if;

  -- Accept historical/offline revisions, but reject nonsensical legacy dates
  -- and clocks more than five minutes ahead of the database server.
  if p_client_updated_at < timestamptz '2020-01-01 00:00:00+00'
     or p_client_updated_at > v_now + interval '5 minutes' then
    raise exception 'Morphology client timestamp is outside the accepted range';
  end if;

  select * into v_access
  from public.get_morphology_access_context()
  where access_mode = 'student';

  if not found then
    raise exception 'Morphology student access denied';
  end if;

  -- Serialize profile creation/reactivation for this educator/student/product.
  -- The database uniqueness constraints remain the final integrity backstop.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_access.educator_id::text || ':' ||
      v_access.student_id::text || ':first-volo-morphology',
      0
    )
  );

  select lp.id, lp.created_at
    into v_profile_id, v_profile_created_at
  from public.learner_profiles lp
  where lp.student_id = v_access.student_id
    and lp.owner_user_id = v_access.educator_id
    and lp.product_key = 'first-volo-morphology'
    and lp.deleted_at is null
  for update;

  if not found then
    select lp.id, lp.created_at
      into v_profile_id, v_profile_created_at
    from public.learner_profiles lp
    where lp.owner_user_id = v_access.educator_id
      and lp.product_key = 'first-volo-morphology'
      and lp.deleted_at is not null
      and (
        lp.student_id = v_access.student_id
        or lp.local_profile_id = v_access.student_id::text
      )
    order by
      (lp.student_id = v_access.student_id) desc,
      lp.deleted_at desc,
      lp.id
    limit 1
    for update;

    if found then
      update public.learner_profiles
      set student_id = v_access.student_id,
          display_name = v_access.display_name,
          deleted_at = null,
          updated_at = v_now
      where id = v_profile_id;
    else
      insert into public.learner_profiles (
        owner_user_id, local_profile_id, display_name, product_key, student_id
      ) values (
        v_access.educator_id,
        v_access.student_id::text,
        v_access.display_name,
        'first-volo-morphology',
        v_access.student_id
      )
      on conflict (owner_user_id, product_key, local_profile_id)
      do update set
        student_id = excluded.student_id,
        display_name = excluded.display_name,
        deleted_at = null,
        updated_at = v_now
      returning id, created_at
        into v_profile_id, v_profile_created_at;
    end if;
  else
    update public.learner_profiles
    set display_name = v_access.display_name,
        updated_at = v_now
    where id = v_profile_id;
  end if;

  -- Keep activity/session content opaque. Remove identity and destructive
  -- envelope controls, then restore only server-authoritative identity fields.
  v_data := (
    p_data - array[
      'id',
      'name',
      'studentId',
      'owner_user_id',
      'ownerUserId',
      'educatorId',
      'classId',
      'learner_profile_id',
      'product_key',
      'store_key',
      'auth_user_id',
      'deletedAt',
      'nameUpdatedAt',
      'createdAt',
      'progressClearedAt'
    ]::text[]
  ) || pg_catalog.jsonb_build_object(
    'id', v_access.student_id::text,
    'name', v_access.display_name,
    'createdAt', v_profile_created_at
  );

  -- Enforce the stored-state limit after removing browser-controlled fields
  -- and adding the server-authoritative identity envelope.
  if octet_length(v_data::text) > 5242880 then
    raise exception 'Morphology state exceeds the 5 MiB limit';
  end if;

  insert into public.learning_state (
    learner_profile_id, product_key, store_key, data,
    client_updated_at, updated_at
  ) values (
    v_profile_id, 'first-volo-morphology', 'scored-progress', v_data,
    p_client_updated_at, v_now
  )
  on conflict on constraint learning_state_learner_product_store_unique
  do update set
    data = excluded.data,
    client_updated_at = excluded.client_updated_at,
    updated_at = v_now
  where excluded.client_updated_at > learning_state.client_updated_at
  returning learning_state.data,
            learning_state.client_updated_at,
            learning_state.updated_at
    into data, client_updated_at, updated_at;

  v_write_applied := found;

  if not v_write_applied then
    select ls.data, ls.client_updated_at, ls.updated_at
      into data, client_updated_at, updated_at
    from public.learning_state ls
    where ls.learner_profile_id = v_profile_id
      and ls.product_key = 'first-volo-morphology'
      and ls.store_key = 'scored-progress';
  end if;

  learner_profile_id := v_profile_id;
  write_applied := v_write_applied;
  return next;
end;
$function$;

alter function public.get_morphology_access_context() owner to postgres;
alter function public.get_morphology_student_state() owner to postgres;
alter function public.save_morphology_student_state(jsonb, timestamptz)
  owner to postgres;

revoke all on function public.get_morphology_access_context() from public, anon;
revoke all on function public.get_morphology_student_state() from public, anon;
revoke all on function public.save_morphology_student_state(jsonb, timestamptz) from public, anon;

grant execute on function public.get_morphology_access_context() to authenticated;
grant execute on function public.get_morphology_student_state() to authenticated;
grant execute on function public.save_morphology_student_state(jsonb, timestamptz) to authenticated;

commit;
