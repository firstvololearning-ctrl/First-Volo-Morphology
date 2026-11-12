-- Allow the Route 1 base-word patterns for assigned application practice.
create or replace function public.save_morphology_practice_plan(p_student_id uuid,p_plan jsonb,p_expected_revision bigint)
returns table(student_id uuid,plan jsonb,revision bigint,updated_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare a record;r private.morphology_practice_plans%rowtype;v_revision bigint;
begin
 select * into strict a from private.morphology_plan_actor(p_student_id,true);
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Plan revision required' using errcode='22023';end if;
 if p_plan is not null then
  if jsonb_typeof(p_plan)<>'object' then raise exception 'Invalid practice choices' using errcode='22023';end if;
  if p_plan ? 'reviewSet' and (
   jsonb_typeof(p_plan->'reviewSet') is distinct from 'string'
   or not (case
    when p_plan->>'reviewSet' in (
     'foundation-core-word-parts', 'foundation-common-meaning-changes',
     'foundation-expanding-system', 'foundation-grade3-bridge'
    ) then coalesce(p_plan->>'flight','') in ('2-3','4-5','6-8')
    when p_plan->>'reviewSet' in (
     'expansion-prefixes-1', 'expansion-prefixes-2', 'expansion-roots-1', 'expansion-roots-2',
     'expansion-roots-3', 'expansion-suffixes-1', 'expansion-suffixes-2'
    ) then coalesce(p_plan->>'flight','') in ('4-5','6-8')
    when p_plan->>'reviewSet' in (
     'advanced-prefixes', 'advanced-roots-1', 'advanced-roots-2', 'advanced-roots-3', 'advanced-suffixes'
    ) then coalesce(p_plan->>'flight','') = '6-8'
    else false end)
  ) then raise exception 'Invalid review set' using errcode='22023';end if;
  if p_plan ? 'reviewSet' and not (p_plan ? 'activity') then
   if (p_plan-array['flight','reviewSet'])<>'{}'::jsonb
    then raise exception 'Invalid practice choices' using errcode='22023';end if;
  elsif (p_plan-array['flight','study','activity','challenge','lesson','reviewSet'])<>'{}'::jsonb
   or not(p_plan ?& array['flight','study','activity','challenge'])
   or coalesce(p_plan->>'flight','') not in ('2-3','4-5','6-8')
   or coalesce(p_plan->>'study','') not in ('prefixes','roots','suffixes','prefix-root','root-suffix','prefix-root-suffix')
   or coalesce(p_plan->>'activity','') not in ('learn','find','hunt','meaning','morpheme','break','infer','build','use','change')
   or jsonb_typeof(p_plan->'challenge') is distinct from 'boolean'
   or (p_plan->>'flight'='2-3'
    and p_plan->>'study' not in ('prefixes','suffixes')
    and not (
     p_plan->>'study' in ('prefix-root','root-suffix')
     and p_plan->>'activity' in ('build','use','change')
    ))
   or (p_plan->>'activity' in ('build','use','change') and p_plan->>'study' not in ('prefix-root','root-suffix','prefix-root-suffix'))
   or (p_plan->>'activity'='change' and p_plan->>'study'='prefix-root')
   or (p_plan ? 'lesson' and (
    jsonb_typeof(p_plan->'lesson') is distinct from 'string'
    or p_plan->>'activity' <> 'learn'
    or not (case
    when p_plan->>'flight'='2-3' and p_plan->>'study'='prefixes' then (p_plan->>'lesson') in (
      'un-negation', 'un-reversative', 're', 'dis', 'en-em', 'non', 'over', 'mis', 'sub', 'pre', 'fore', 'mid', 'under'
    )
    when p_plan->>'flight'='2-3' and p_plan->>'study'='suffixes' then (p_plan->>'lesson') in (
      'ness', 'able-ible', 'ed', 'er-or', 'er-more', 'est', 'ful', 'ing', 'ion', 'less', 'ly-adverb', 'ly-adjective', 'ment', 's-es'
    )
    when p_plan->>'flight'='4-5' and p_plan->>'study'='prefixes' then (p_plan->>'lesson') in (
      'negative-in-family', 'location-in-family', 'inter', 'de', 'trans', 'super', 'semi', 'anti', 'con-com', 'e-ex', 'pro', 'circum'
    )
    when p_plan->>'flight'='4-5' and p_plan->>'study'='roots' then (p_plan->>'lesson') in (
      'bio', 'port', 'rupt', 'scrib', 'spect', 'struct', 'act', 'dict', 'form', 'graph', 'mot', 'vis', 'micro', 'tele', 'auto', 'phon', 'scop', 'metr', 'therm', 'geo'
    )
    when p_plan->>'flight'='4-5' and p_plan->>'study'='suffixes' then (p_plan->>'lesson') in (
      'al', 'ic', 'ity', 'ive', 'ist', 'ize', 'ify', 'ology', 'ous'
    )
    when p_plan->>'flight'='6-8' and p_plan->>'study'='prefixes' then (p_plan->>'lesson') in (
      'ab', 'a-ad', 'retro'
    )
    when p_plan->>'flight'='6-8' and p_plan->>'study'='roots' then (p_plan->>'lesson') in (
      'chron', 'duct', 'fer', 'ject', 'mit', 'pel', 'pend', 'pos', 'put', 'sequ', 'ten', 'tract', 'val', 'ven', 'vert', 'voc', 'aud', 'cred', 'biblio', 'derm', 'terr'
    )
    when p_plan->>'flight'='6-8' and p_plan->>'study'='suffixes' then (p_plan->>'lesson') in (
      'ance', 'ence', 'ant-ent-agent', 'ant-ent-adjective'
    )
    else false end)
   ))
  then raise exception 'Invalid practice choices' using errcode='22023';end if;
 end if;
 select * into r from private.morphology_practice_plans p where p.student_id=a.learner_id for update;
 v_revision:=coalesce(r.revision,0);
 if v_revision<>p_expected_revision then raise exception 'Practice plan changed; reload before saving' using errcode='40001';end if;
 if v_revision=0 then
  if p_plan is null then return query select a.learner_id,null::jsonb,0::bigint,null::timestamptz;return;end if;
  insert into private.morphology_practice_plans(student_id,owner_user_id,plan) values(a.learner_id,a.owner_id,p_plan)
   on conflict do nothing returning * into r;
  if not found then raise exception 'Practice plan changed; reload before saving' using errcode='40001';end if;
 else
  update private.morphology_practice_plans p set plan=coalesce(p_plan,p.plan),active=(p_plan is not null),revision=p.revision+1,updated_at=clock_timestamp()
  where p.student_id=a.learner_id and p.owner_user_id=a.owner_id returning * into r;
 end if;
 return query select r.student_id,case when r.active then r.plan else null end,r.revision,r.updated_at;
end $$;
