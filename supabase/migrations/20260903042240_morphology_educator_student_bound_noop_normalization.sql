create or replace function public.save_morphology_student_state_for_educator(
  p_student_id uuid,
  p_data jsonb,
  p_client_updated_at timestamptz
)
returns table (
  learner_profile_id uuid,
  data jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz,
  write_applied boolean,
  result_code text
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_context record;
  v_profile_id uuid;
  v_profile_created_at timestamptz;
  v_profile_was_deleted boolean := false;
  v_existing_data jsonb;
  v_existing_client_updated_at timestamptz;
  v_existing_updated_at timestamptz;
  v_now timestamptz := pg_catalog.now();
  v_data jsonb;
  v_existing_canonical_data jsonb;
begin
  if auth.uid() is null
     or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) = true then
    raise exception 'Morphology educator student access denied';
  end if;

  if p_data is null
     or pg_catalog.jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'Morphology state must be a JSON object';
  end if;

  if p_client_updated_at is null then
    raise exception 'Morphology client timestamp is required';
  end if;

  if p_client_updated_at < timestamptz '2020-01-01 00:00:00+00'
     or p_client_updated_at > v_now + interval '5 minutes' then
    raise exception 'Morphology client timestamp is outside the accepted range';
  end if;

  -- Serialize all educator-guided writes for this canonical student/product.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      auth.uid()::text || ':' || p_student_id::text ||
      ':first-volo-morphology',
      0
    )
  );

  -- Authorization is resolved again inside every mutation, after waiting for
  -- the student-specific lock. Revoked access cannot rely on an earlier read.
  select * into v_context
  from private.resolve_morphology_educator_student_context(p_student_id);

  if not found then
    raise exception 'Morphology educator student access denied';
  end if;

  select lp.id, lp.created_at
    into v_profile_id, v_profile_created_at
  from public.learner_profiles as lp
  where lp.student_id = v_context.student_id
    and lp.owner_user_id = v_context.educator_user_id
    and lp.product_key = 'first-volo-morphology'
    and lp.deleted_at is null
  for update;

  if v_profile_id is null then
    select lp.id, lp.created_at
      into v_profile_id, v_profile_created_at
    from public.learner_profiles as lp
    where lp.owner_user_id = v_context.educator_user_id
      and lp.product_key = 'first-volo-morphology'
      and lp.deleted_at is not null
      and (
        lp.student_id = v_context.student_id
        or lp.local_profile_id = v_context.student_id::text
      )
    order by
      (lp.student_id = v_context.student_id) desc,
      lp.deleted_at desc,
      lp.id
    limit 1
    for update;

    v_profile_was_deleted := v_profile_id is not null;
  end if;

  if v_profile_id is not null then
    select ls.data, ls.client_updated_at, ls.updated_at
      into v_existing_data, v_existing_client_updated_at,
           v_existing_updated_at
    from public.learning_state as ls
    where ls.learner_profile_id = v_profile_id
      and ls.product_key = 'first-volo-morphology'
      and ls.store_key = 'scored-progress'
    for update;
  end if;

  -- Match the existing student RPC's sanitization and canonical identity
  -- envelope. JSONB equality below is semantic and ignores object-key order.
  v_data := (
    p_data - array[
      'id', 'name', 'studentId', 'owner_user_id', 'ownerUserId',
      'educatorId', 'classId', 'learner_profile_id', 'product_key',
      'store_key', 'auth_user_id', 'deletedAt', 'nameUpdatedAt',
      'createdAt', 'progressClearedAt'
    ]::text[]
  ) || pg_catalog.jsonb_build_object(
    'id', v_context.student_id::text,
    'name', v_context.student_display_name,
    'createdAt', v_profile_created_at
  );

  -- Compare the same canonical envelope on both sides. Historical JSONB may
  -- retain nullable protected fields that the current writer strips; those
  -- legacy representation details are not instructional state changes.
  if v_existing_data is not null then
    v_existing_canonical_data := (
      v_existing_data - array[
        'id', 'name', 'studentId', 'owner_user_id', 'ownerUserId',
        'educatorId', 'classId', 'learner_profile_id', 'product_key',
        'store_key', 'auth_user_id', 'deletedAt', 'nameUpdatedAt',
        'createdAt', 'progressClearedAt'
      ]::text[]
    ) || pg_catalog.jsonb_build_object(
      'id', v_context.student_id::text,
      'name', v_context.student_display_name,
      'createdAt', v_profile_created_at
    );
  end if;

  if pg_catalog.octet_length(v_data::text) > 5242880 then
    raise exception 'Morphology state exceeds the 5 MiB limit';
  end if;

  if not v_profile_was_deleted
     and v_existing_data is not null
     and v_data = v_existing_canonical_data then
    learner_profile_id := v_profile_id;
    data := v_existing_data;
    client_updated_at := v_existing_client_updated_at;
    updated_at := v_existing_updated_at;
    write_applied := false;
    result_code := 'no_change';
    return next;
    return;
  end if;

  if v_existing_data is not null
     and p_client_updated_at <= v_existing_client_updated_at then
    learner_profile_id := v_profile_id;
    data := v_existing_data;
    client_updated_at := v_existing_client_updated_at;
    updated_at := v_existing_updated_at;
    write_applied := false;
    result_code := 'stale_revision';
    return next;
    return;
  end if;

  if v_profile_id is null then
    insert into public.learner_profiles (
      owner_user_id, local_profile_id, display_name, product_key, student_id
    ) values (
      v_context.educator_user_id,
      v_context.student_id::text,
      v_context.student_display_name,
      'first-volo-morphology',
      v_context.student_id
    )
    on conflict (owner_user_id, product_key, local_profile_id)
    do update set
      student_id = excluded.student_id,
      display_name = excluded.display_name,
      deleted_at = null,
      updated_at = v_now
    returning id, created_at
      into v_profile_id, v_profile_created_at;

    -- createdAt is server-authoritative and is known only after profile create.
    v_data := (v_data - 'createdAt') || pg_catalog.jsonb_build_object(
      'createdAt', v_profile_created_at
    );

    if pg_catalog.octet_length(v_data::text) > 5242880 then
      raise exception 'Morphology state exceeds the 5 MiB limit';
    end if;
  elsif v_profile_was_deleted then
    update public.learner_profiles
    set student_id = v_context.student_id,
        display_name = v_context.student_display_name,
        deleted_at = null,
        updated_at = v_now
    where id = v_profile_id;
  else
    update public.learner_profiles
    set display_name = v_context.student_display_name,
        updated_at = v_now
    where id = v_profile_id;
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
    updated_at = v_now;

  learner_profile_id := v_profile_id;
  data := v_data;
  client_updated_at := p_client_updated_at;
  updated_at := v_now;
  write_applied := true;
  result_code := case
    when v_existing_data is null then 'created'
    else 'updated'
  end;
  return next;
end;
$function$;

alter function public.save_morphology_student_state_for_educator(
  uuid, jsonb, timestamptz
) owner to postgres;

revoke all on function public.save_morphology_student_state_for_educator(
  uuid, jsonb, timestamptz
) from public, anon, service_role;

grant execute on function public.save_morphology_student_state_for_educator(
  uuid, jsonb, timestamptz
) to authenticated;
