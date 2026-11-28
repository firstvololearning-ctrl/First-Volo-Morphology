-- Require current roster access and permission for ordinary Morphology cloud progress.
-- Keep stored records intact for separately authorized recovery and records requests.
begin;

create or replace function private.resolve_morphology_educator_student_context(
  p_student_id uuid
)
returns table (
  educator_user_id uuid,
  student_id uuid,
  student_display_name text
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    s.owner_user_id,
    s.id,
    s.display_name
  from public.students as s
  where p_student_id is not null
    and auth.uid() is not null
    and coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = false
    and s.id = p_student_id
    and s.owner_user_id = auth.uid()
    and s.archived_at is null
    and private.morphology_plan_session_valid()
    and private.parent_permission_allows(s.owner_user_id, s.id, 'first-volo-morphology')
    and exists (
      select 1
      from public.class_memberships as cm
      join public.classes as c
        on c.id = cm.class_id
       and c.owner_user_id = cm.owner_user_id
       and c.archived_at is null
      join public.class_product_access as cpa
        on cpa.class_id = c.id
       and cpa.owner_user_id = c.owner_user_id
       and cpa.product_key = 'first-volo-morphology'
      where cm.student_id = s.id
        and cm.owner_user_id = s.owner_user_id
    )
    and exists (
      select 1
      from public.product_entitlements as pe
      where pe.owner_user_id = auth.uid()
        and pe.product_key = 'first-volo-morphology'
        and pe.status = 'active'
        and pe.starts_at <= pg_catalog.now()
        and pe.expires_at > pg_catalog.now()
    )
  -- Class identity is intentionally not returned. Membership in any currently
  -- active Morphology-enabled class owned by this educator is sufficient.
  limit 1;
$function$;

create function private.morphology_educator_progress_allowed(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from private.resolve_morphology_educator_student_context(p_student_id)
  );
$function$;

revoke all on function private.morphology_educator_progress_allowed(uuid)
  from public, anon, authenticated;
grant execute on function private.morphology_educator_progress_allowed(uuid)
  to authenticated;

create policy morphology_educator_roster_scope on public.learner_profiles
  as restrictive for all to authenticated
  using (
    product_key is distinct from 'first-volo-morphology'
    or private.morphology_educator_progress_allowed(student_id)
  )
  with check (
    product_key is distinct from 'first-volo-morphology'
    or private.morphology_educator_progress_allowed(student_id)
  );

create policy morphology_educator_roster_scope on public.learning_state
  as restrictive for all to authenticated
  using (
    product_key is distinct from 'first-volo-morphology'
    or exists (
      select 1
      from public.learner_profiles lp
      where lp.id = learning_state.learner_profile_id
        and lp.product_key = 'first-volo-morphology'
        and lp.owner_user_id = auth.uid()
        and private.morphology_educator_progress_allowed(lp.student_id)
    )
  )
  with check (
    product_key is distinct from 'first-volo-morphology'
    or exists (
      select 1
      from public.learner_profiles lp
      where lp.id = learning_state.learner_profile_id
        and lp.product_key = 'first-volo-morphology'
        and lp.owner_user_id = auth.uid()
        and private.morphology_educator_progress_allowed(lp.student_id)
    )
  );

-- Keep both deployments' existing export checks and leave the operator path alone.
-- This public export returns the whole product, so refuse a mixed-scope download.
alter function public.export_my_product_records(text) set schema private;
alter function private.export_my_product_records(text)
  rename to export_my_product_records_before_morphology_scope;
revoke all on function private.export_my_product_records_before_morphology_scope(text)
  from public, anon, authenticated;

create function public.export_my_product_records(p_product text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_product = 'first-volo-morphology' and exists (
    select 1
    from public.learner_profiles lp
    where lp.owner_user_id = auth.uid()
      and lp.product_key = p_product
      and not private.morphology_educator_progress_allowed(lp.student_id)
  ) then
    raise exception 'Morphology records require an authorized records request' using errcode = '42501';
  end if;

  return private.export_my_product_records_before_morphology_scope(p_product);
end;
$function$;

revoke all on function public.export_my_product_records(text)
  from public, anon, authenticated;
grant execute on function public.export_my_product_records(text) to authenticated;

commit;
