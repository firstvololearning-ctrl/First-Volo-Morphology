begin;

create function pg_temp.assert_true(ok boolean, message text)
returns void language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'assertion failed: %', message; end if;
end $$;

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select set_config('request.jwt.claims', '{"is_anonymous":false}', false);

insert into public.students(id,owner_user_id,display_name,archived_at) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111','Student One',null),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2','22222222-2222-2222-2222-222222222222','Other Student',null),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3','11111111-1111-1111-1111-111111111111','Archived Student',now()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','11111111-1111-1111-1111-111111111111','No State Student',null);
insert into public.classes(id,owner_user_id,name,archived_at,created_at) values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','11111111-1111-1111-1111-111111111111','Old Eligible',null,'2025-01-01'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2','22222222-2222-2222-2222-222222222222','Other Class',null,'2025-01-01'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3','11111111-1111-1111-1111-111111111111','Archived Class',now(),'2025-01-01'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4','11111111-1111-1111-1111-111111111111','New Eligible',null,'2026-01-01');
insert into public.class_memberships values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','11111111-1111-1111-1111-111111111111',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3','11111111-1111-1111-1111-111111111111',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','11111111-1111-1111-1111-111111111111',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2','22222222-2222-2222-2222-222222222222',now());
insert into public.class_product_access values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','11111111-1111-1111-1111-111111111111','first-volo-morphology',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4','11111111-1111-1111-1111-111111111111','first-volo-morphology',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2','22222222-2222-2222-2222-222222222222','first-volo-morphology',now());
insert into public.product_entitlements values
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1','11111111-1111-1111-1111-111111111111','first-volo-morphology','active',now()-interval '1 day',now()+interval '1 day'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2','22222222-2222-2222-2222-222222222222','first-volo-morphology','active',now()-interval '1 day',now()+interval '1 day');
insert into public.learner_profiles(id,owner_user_id,local_profile_id,display_name,created_at,updated_at,product_key,student_id)
values('cccccccc-cccc-cccc-cccc-ccccccccccc1','11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','Student One','2026-01-01','2026-01-01','first-volo-morphology','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1');
insert into public.learning_state(id,learner_profile_id,product_key,store_key,data,client_updated_at,updated_at)
select 'dddddddd-dddd-dddd-dddd-ddddddddddd1','cccccccc-cccc-cccc-cccc-ccccccccccc1','first-volo-morphology','scored-progress',
  jsonb_build_object('id','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','name','Student One','createdAt',lp.created_at,'sessions','[]'::jsonb),
  '2026-08-01','2026-08-01'
from public.learner_profiles lp where lp.id='cccccccc-cccc-cccc-cccc-ccccccccccc1';

-- 1 + multiple-class resolution returns one canonical student, not a class.
select pg_temp.assert_true((select count(*)=1 and (array_agg(student_id))[1]='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid
  from public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1')), 'valid educator without class coupling');

-- 2 anonymous JWT rejected.
select set_config('request.jwt.claims', '{"is_anonymous":true}', false);
do $$ begin
  perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1');
  raise exception 'anonymous call unexpectedly succeeded';
exception when others then
  if sqlerrm='anonymous call unexpectedly succeeded' then raise; end if;
end $$;
select set_config('request.jwt.claims', '{"is_anonymous":false}', false);

-- 3 malformed typed UUID fails before function execution.
do $$ begin
  perform public.get_morphology_student_state_for_educator('not-a-uuid'::uuid);
  raise exception 'malformed UUID unexpectedly succeeded';
exception when invalid_text_representation then null; end $$;

-- 4 unknown, 5 other owner, 6 archived student all reject identically.
do $$ declare target uuid; begin
  foreach target in array array[
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'::uuid
  ] loop
    begin
      perform public.get_morphology_student_state_for_educator(target);
      raise exception 'unauthorized target unexpectedly succeeded';
    exception when others then
      if sqlerrm='unauthorized target unexpectedly succeeded' then raise; end if;
    end;
  end loop;
end $$;

-- 7 archived class, 8 absent membership, 9 access row absent.
update public.classes set archived_at=now() where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
update public.classes set archived_at=now() where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'); raise exception 'archived class accepted'; exception when others then if sqlerrm='archived class accepted' then raise; end if; end $$;
update public.classes set archived_at=null where id in ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4');
delete from public.class_memberships where student_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'); raise exception 'missing membership accepted'; exception when others then if sqlerrm='missing membership accepted' then raise; end if; end $$;
insert into public.class_memberships values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','11111111-1111-1111-1111-111111111111',now());
delete from public.class_product_access where owner_user_id='11111111-1111-1111-1111-111111111111';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'); raise exception 'disabled access accepted'; exception when others then if sqlerrm='disabled access accepted' then raise; end if; end $$;
insert into public.class_product_access values
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','11111111-1111-1111-1111-111111111111','first-volo-morphology',now()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4','11111111-1111-1111-1111-111111111111','first-volo-morphology',now());

-- 10 inactive and 11 expired entitlement.
update public.product_entitlements set status='revoked' where owner_user_id='11111111-1111-1111-1111-111111111111';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'); raise exception 'revoked entitlement accepted'; exception when others then if sqlerrm='revoked entitlement accepted' then raise; end if; end $$;
update public.product_entitlements set status='active',starts_at=now()-interval '2 days',expires_at=now()-interval '1 day' where owner_user_id='11111111-1111-1111-1111-111111111111';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'); raise exception 'expired entitlement accepted'; exception when others then if sqlerrm='expired entitlement accepted' then raise; end if; end $$;
update public.product_entitlements set starts_at=now()+interval '1 day',expires_at=now()+interval '2 days' where owner_user_id='11111111-1111-1111-1111-111111111111';
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'); raise exception 'future entitlement accepted'; exception when others then if sqlerrm='future entitlement accepted' then raise; end if; end $$;
update public.product_entitlements set starts_at=now()-interval '1 day' where owner_user_id='11111111-1111-1111-1111-111111111111';

-- 12 authorized no-state read is a true no-op; 13 existing state is canonical.
select pg_temp.assert_true((select not has_state and data='{}'::jsonb from public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4')), 'authorized no-state response');
select pg_temp.assert_true((select count(*)=1 from public.learner_profiles), 'read created no profile');
select pg_temp.assert_true((select has_state and data->>'name'='Student One' from public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1')), 'existing state returned');

-- Valid profile/no-state is distinct and read-only; corrupt non-object state fails closed.
insert into public.learner_profiles(id,owner_user_id,local_profile_id,display_name,created_at,updated_at,product_key,student_id)
values('cccccccc-cccc-cccc-cccc-ccccccccccc4','11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','No State Student','2026-01-01','2026-01-01','first-volo-morphology','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4');
select pg_temp.assert_true((select learner_profile_id='cccccccc-cccc-cccc-cccc-ccccccccccc4'::uuid and not has_state
  from public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4')), 'profile without state remains no-state');
insert into public.learning_state(id,learner_profile_id,product_key,store_key,data,client_updated_at,updated_at)
values('dddddddd-dddd-dddd-dddd-ddddddddddd4','cccccccc-cccc-cccc-cccc-ccccccccccc4','first-volo-morphology','scored-progress','[]','2026-08-15','2026-08-15');
do $$ begin perform public.get_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'); raise exception 'corrupt state unexpectedly returned'; exception when others then if sqlerrm='corrupt state unexpectedly returned' then raise; end if; end $$;
delete from public.learning_state where id='dddddddd-dddd-dddd-dddd-ddddddddddd4';
delete from public.learner_profiles where id='cccccccc-cccc-cccc-cccc-ccccccccccc4';

-- 14 stale changed save is rejected.
select pg_temp.assert_true((select result_code='stale_revision' and not write_applied
  from public.save_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','{"sessions":[{"id":"stale"}]}','2026-07-01')), 'stale save rejected');

-- A deleted profile's retained newer state participates in conflict checks.
insert into public.learner_profiles(id,owner_user_id,local_profile_id,display_name,created_at,updated_at,product_key,deleted_at,student_id)
values('cccccccc-cccc-cccc-cccc-ccccccccccc4','11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','No State Student','2026-01-01','2026-08-15','first-volo-morphology','2026-08-15','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4');
insert into public.learning_state(id,learner_profile_id,product_key,store_key,data,client_updated_at,updated_at)
values('dddddddd-dddd-dddd-dddd-ddddddddddd4','cccccccc-cccc-cccc-cccc-ccccccccccc4','first-volo-morphology','scored-progress','{"deletedAt":"2026-08-15T00:00:00Z"}','2026-08-15','2026-08-15');
select pg_temp.assert_true((select result_code='stale_revision' and not write_applied
  from public.save_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4','{"sessions":[{"id":"stale-resurrection"}]}','2026-08-01')), 'deleted-profile stale save rejected');
select pg_temp.assert_true((select lp.deleted_at is not null and ls.data ? 'deletedAt'
  from public.learner_profiles lp join public.learning_state ls on ls.learner_profile_id=lp.id
  where lp.id='cccccccc-cccc-cccc-cccc-ccccccccccc4'), 'stale save did not reactivate or overwrite deleted state');

-- 15 semantically identical save with a newer timestamp changes no timestamps.
create temp table before_noop as select lp.updated_at profile_updated_at,ls.updated_at state_updated_at,ls.client_updated_at
from public.learner_profiles lp join public.learning_state ls on ls.learner_profile_id=lp.id
where lp.id='cccccccc-cccc-cccc-cccc-ccccccccccc1';
select pg_temp.assert_true((select result_code='no_change' and not write_applied
  from public.save_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','{"sessions":[],"createdAt":"ignored","name":"ignored","id":"ignored"}',now())), 'semantic no-op rejected');
select pg_temp.assert_true((select b.profile_updated_at=lp.updated_at and b.state_updated_at=ls.updated_at and b.client_updated_at=ls.client_updated_at
  from before_noop b cross join public.learner_profiles lp join public.learning_state ls on ls.learner_profile_id=lp.id
  where lp.id='cccccccc-cccc-cccc-cccc-ccccccccccc1'), 'no-op timestamps unchanged');

-- 16 genuine newer change persists once.
select pg_temp.assert_true((select result_code='updated' and write_applied and data->'sessions' @> '[{"id":"new"}]'
  from public.save_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','{"sessions":[{"id":"new"}]}',now())), 'genuine change saved');

-- 17 authorization revoked between read and save rejects the save.
delete from public.class_product_access where owner_user_id='11111111-1111-1111-1111-111111111111';
do $$ begin perform public.save_morphology_student_state_for_educator('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','{"sessions":[{"id":"must-not-save"}]}',now()); raise exception 'revoked save accepted'; exception when others then if sqlerrm='revoked save accepted' then raise; end if; end $$;
select pg_temp.assert_true(not exists(select 1 from public.learning_state where data @> '{"sessions":[{"id":"must-not-save"}]}'::jsonb), 'revoked save made no write');

-- 18 a manually supplied UUID has no authority apart from resolver success.
-- Covered by unknown, cross-owner, archived, membership, access, and entitlement cases.

-- ACL: only authenticated may call public RPCs; no browser role calls resolver.
select pg_temp.assert_true(not exists(
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace,
    lateral aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) a
  where n.nspname='private' and p.proname='resolve_morphology_educator_student_context'
    and a.grantee=0 and a.privilege_type='EXECUTE'
), 'PUBLIC resolver execute revoked');
select pg_temp.assert_true(not has_function_privilege('anon','private.resolve_morphology_educator_student_context(uuid)','EXECUTE'), 'anon resolver execute revoked');
select pg_temp.assert_true(not has_function_privilege('authenticated','private.resolve_morphology_educator_student_context(uuid)','EXECUTE'), 'authenticated resolver execute revoked');
select pg_temp.assert_true(has_function_privilege('authenticated','public.get_morphology_student_state_for_educator(uuid)','EXECUTE'), 'authenticated read execute');
select pg_temp.assert_true(has_function_privilege('authenticated','public.save_morphology_student_state_for_educator(uuid,jsonb,timestamp with time zone)','EXECUTE'), 'authenticated save execute');
select pg_temp.assert_true(not exists(
  select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace,
    lateral aclexplode(coalesce(p.proacl, acldefault('f',p.proowner))) a
  where n.nspname='public' and p.proname in ('get_morphology_student_state_for_educator','save_morphology_student_state_for_educator')
    and a.grantee=0 and a.privilege_type='EXECUTE'
), 'PUBLIC RPC execute revoked');
select pg_temp.assert_true(not has_function_privilege('anon','public.get_morphology_student_state_for_educator(uuid)','EXECUTE'), 'anon read revoked');
select pg_temp.assert_true(not has_function_privilege('anon','public.save_morphology_student_state_for_educator(uuid,jsonb,timestamp with time zone)','EXECUTE'), 'anon save revoked');
select pg_temp.assert_true(not has_function_privilege('service_role','public.get_morphology_student_state_for_educator(uuid)','EXECUTE'), 'service read revoked');
select pg_temp.assert_true(not has_function_privilege('service_role','public.save_morphology_student_state_for_educator(uuid,jsonb,timestamp with time zone)','EXECUTE'), 'service save revoked');

rollback;
