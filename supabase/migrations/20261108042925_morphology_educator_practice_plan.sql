begin;
create table private.morphology_practice_plans (
 student_id uuid primary key, owner_user_id uuid not null,
 plan jsonb not null check(jsonb_typeof(plan)='object'), active boolean not null default true,
 revision bigint not null default 1, updated_at timestamptz not null default now(),
 foreign key(student_id,owner_user_id) references public.students(id,owner_user_id) on delete cascade
);
alter table private.morphology_practice_plans enable row level security;
revoke all on private.morphology_practice_plans from public,anon,authenticated;

create function private.morphology_plan_session_valid() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.sessions s join auth.users u on u.id=s.user_id
 where s.user_id=auth.uid() and s.id::text=auth.jwt()->>'session_id'
 and (s.not_after is null or s.not_after>clock_timestamp())
 and u.is_anonymous=coalesce((auth.jwt()->>'is_anonymous')::boolean,false));
$$;
revoke all on function private.morphology_plan_session_valid() from public,anon,authenticated;

create function private.morphology_plan_actor(p_student_id uuid,p_write boolean)
returns table(owner_id uuid,learner_id uuid)
language plpgsql stable security definer set search_path='' as $$
declare o uuid;s uuid;
begin
 if not private.morphology_plan_session_valid() then raise exception 'Current session required' using errcode='42501';end if;
 if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  if p_write then raise exception 'Educator required' using errcode='42501';end if;
  select educator_id,student_id into o,s from public.get_morphology_access_context() where access_mode='student';
  if p_student_id is not null and p_student_id is distinct from s then raise exception 'Learner access denied' using errcode='42501';end if;
 else
  select educator_user_id,student_id into o,s from private.resolve_morphology_educator_student_context(p_student_id);
 end if;
 if s is null or not private.parent_permission_allows(o,s,'first-volo-morphology') then raise exception 'Learner access denied' using errcode='42501';end if;
 return query select o,s;
end $$;
revoke all on function private.morphology_plan_actor(uuid,boolean) from public,anon,authenticated;

create function public.list_morphology_practice_plan_learners()
returns table(student_id uuid,display_name text)
language plpgsql stable security definer set search_path='' as $$
begin
 if not private.morphology_plan_session_valid() or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Educator required' using errcode='42501';end if;
 return query select s.id,s.display_name from public.students s
 where s.owner_user_id=auth.uid() and s.archived_at is null
 and private.parent_permission_allows(s.owner_user_id,s.id,'first-volo-morphology')
 and exists(select 1 from private.resolve_morphology_educator_student_context(s.id))
 order by s.created_at desc,s.id limit 500;
end $$;

create function public.get_morphology_practice_plan(p_student_id uuid default null)
returns table(student_id uuid,plan jsonb,revision bigint,updated_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
declare a record;
begin
 select * into strict a from private.morphology_plan_actor(p_student_id,false);
 return query select a.learner_id,case when p.active then p.plan else null end,coalesce(p.revision,0),p.updated_at
 from (select 1) authorized left join private.morphology_practice_plans p on p.student_id=a.learner_id and p.owner_user_id=a.owner_id;
end $$;

create function public.save_morphology_practice_plan(p_student_id uuid,p_plan jsonb,p_expected_revision bigint)
returns table(student_id uuid,plan jsonb,revision bigint,updated_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare a record;r private.morphology_practice_plans%rowtype;v_revision bigint;
begin
 select * into strict a from private.morphology_plan_actor(p_student_id,true);
 if p_expected_revision is null or p_expected_revision<0 then raise exception 'Plan revision required' using errcode='22023';end if;
 if p_plan is not null then
  if jsonb_typeof(p_plan)<>'object' then raise exception 'Invalid practice choices' using errcode='22023';end if;
  if (p_plan-array['flight','study','activity','challenge'])<>'{}'::jsonb
   or not(p_plan ?& array['flight','study','activity','challenge'])
   or coalesce(p_plan->>'flight','') not in ('2-3','4-5','6-8')
   or coalesce(p_plan->>'study','') not in ('prefixes','roots','suffixes','prefix-root','root-suffix','prefix-root-suffix')
   or coalesce(p_plan->>'activity','') not in ('learn','find','hunt','meaning','morpheme','break','infer','build','use','change')
   or jsonb_typeof(p_plan->'challenge') is distinct from 'boolean'
   or (p_plan->>'flight'='2-3' and p_plan->>'study' not in ('prefixes','suffixes'))
   or (p_plan->>'activity' in ('build','use','change') and p_plan->>'study' not in ('prefix-root','root-suffix','prefix-root-suffix'))
   or (p_plan->>'activity'='change' and p_plan->>'study'='prefix-root')
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
revoke all on function public.list_morphology_practice_plan_learners() from public,anon,authenticated;
revoke all on function public.get_morphology_practice_plan(uuid) from public,anon,authenticated;
revoke all on function public.save_morphology_practice_plan(uuid,jsonb,bigint) from public,anon,authenticated;
grant execute on function public.list_morphology_practice_plan_learners() to authenticated;
grant execute on function public.get_morphology_practice_plan(uuid) to authenticated;
grant execute on function public.save_morphology_practice_plan(uuid,jsonb,bigint) to authenticated;
commit;
