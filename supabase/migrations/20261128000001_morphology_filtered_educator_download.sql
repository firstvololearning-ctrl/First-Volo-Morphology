begin;

-- The earlier progress-scope migration installs the roster predicate and
-- preserves the existing download implementation for other products.
create or replace function public.export_my_product_records(p_product text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor uuid := auth.uid();
  result jsonb;
begin
  if p_product is distinct from 'first-volo-morphology' then
    return private.export_my_product_records_before_morphology_scope(p_product);
  end if;

  if actor is null
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, true)
    or not private.morphology_plan_session_valid()
    or not exists (
      select 1 from auth.users u
      where u.id = actor and u.is_anonymous is false and u.email_confirmed_at is not null
    ) then
    raise exception 'Current educator session required' using errcode = '42501';
  end if;

  with owned_profiles as materialized (
    select lp, lp.id,
      lp.deleted_at is null and private.morphology_educator_progress_allowed(lp.student_id) as eligible
    from public.learner_profiles lp
    where lp.owner_user_id = actor and lp.product_key = p_product
  ), eligible_profiles as (
    select lp, id from owned_profiles where eligible
  )
  select jsonb_build_object(
    'version', 1,
    'product', p_product,
    'preparedAt', clock_timestamp(),
    'recordsOmitted', exists (select 1 from owned_profiles where not eligible),
    'profiles', coalesce((
      select jsonb_agg(to_jsonb(p.lp) - 'owner_user_id' - 'local_profile_id' order by p.id)
      from eligible_profiles p
    ), '[]'::jsonb),
    'learningRecords', coalesce((
      select jsonb_agg(to_jsonb(ls) order by ls.id)
      from public.learning_state ls join eligible_profiles p on p.id = ls.learner_profile_id
      where ls.product_key = p_product
    ), '[]'::jsonb),
    'stories', '[]'::jsonb,
    'storyCycles', '[]'::jsonb,
    'storyDrafts', '[]'::jsonb,
    'storySupports', '[]'::jsonb
  ) into result;
  return result;
end;
$function$;

commit;
