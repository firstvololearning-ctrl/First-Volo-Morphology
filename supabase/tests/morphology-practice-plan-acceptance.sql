begin;
insert into auth.users(id,is_anonymous) values ('81111111-1111-4111-8111-111111111111',false),('89999999-9999-4999-8999-999999999999',false),('85555555-5555-4555-8555-555555555555',true);
insert into auth.sessions(id,user_id,created_at) values('86666666-6666-4666-8666-666666666666','81111111-1111-4111-8111-111111111111',now()),('87777777-7777-4777-8777-777777777777','85555555-5555-4555-8555-555555555555',now()),('88888888-8888-4888-8888-888888888888','89999999-9999-4999-8999-999999999999',now());
insert into public.students(id,owner_user_id,display_name) values('82222222-2222-4222-8222-222222222222','81111111-1111-4111-8111-111111111111','FICTIONAL PLAN QA');
insert into public.classes(id,owner_user_id,name,class_code) values('83333333-3333-4333-8333-333333333333','81111111-1111-4111-8111-111111111111','FICTIONAL PLAN QA','PLANQA811');
insert into public.class_memberships(class_id,student_id,owner_user_id) values('83333333-3333-4333-8333-333333333333','82222222-2222-4222-8222-222222222222','81111111-1111-4111-8111-111111111111');
insert into public.class_product_access(class_id,owner_user_id,product_key) values('83333333-3333-4333-8333-333333333333','81111111-1111-4111-8111-111111111111','first-volo-morphology');
insert into public.product_entitlements(owner_user_id,product_key,access_type,expires_at) values('81111111-1111-4111-8111-111111111111','first-volo-morphology','manual',now()+interval '1 day');
select set_config('request.jwt.claim.sub','81111111-1111-4111-8111-111111111111',true),set_config('request.jwt.claims','{"sub":"81111111-1111-4111-8111-111111111111","session_id":"86666666-6666-4666-8666-666666666666","is_anonymous":false,"role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.list_morphology_practice_plan_learners()) then raise exception 'Unpermitted learner listed';end if;
 begin perform public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222','{"flight":"2-3","study":"prefixes","activity":"meaning","challenge":false}',0);raise exception 'Unpermitted save accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
insert into private.parent_consent_releases(product_key,enabled,notice_version,verification_method) values('first-volo-morphology',true,'FICTIONAL PLAN QA','signed_form') on conflict(product_key) do update set enabled=true,notice_version=excluded.notice_version,verification_method=excluded.verification_method;
insert into private.parent_consent_cases(owner_user_id,learner_reference,product_key,notice_version,notice_text,token_hash,invitation_expires_at,contact_delete_at,state,verification_method,verification_evidence_reference,verified_by,verified_at,is_setup_test) values('81111111-1111-4111-8111-111111111111','82222222-2222-4222-8222-222222222222','first-volo-morphology','FICTIONAL PLAN QA','FICTIONAL ONLY',repeat('9',64),now()+interval '1 day',now()+interval '2 days','verified','signed_form','FICTIONAL ONLY','81111111-1111-4111-8111-111111111111',now(),false);
insert into private.student_signup_tickets(token_hash,owner_id,learner_id,class_id,product_key,expires_at,consumed_at,consumed_by) values(repeat('a',64),'81111111-1111-4111-8111-111111111111','82222222-2222-4222-8222-222222222222','83333333-3333-4333-8333-333333333333','first-volo-morphology',now()+interval '1 minute',now(),'85555555-5555-4555-8555-555555555555');
insert into public.student_auth_links(auth_user_id,student_id,class_id,owner_user_id,last_verified_at) values('85555555-5555-4555-8555-555555555555','82222222-2222-4222-8222-222222222222','83333333-3333-4333-8333-333333333333','81111111-1111-4111-8111-111111111111',now());
set local role authenticated;
do $$ declare r record;x jsonb; begin
 if (select count(*) from public.list_morphology_practice_plan_learners())<>1 then raise exception 'Eligible learner missing';end if;
 select * into r from public.get_morphology_practice_plan('82222222-2222-4222-8222-222222222222');if r.revision<>0 or r.plan is not null then raise exception 'Empty plan incorrect';end if;
 select * into r from public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222','{"flight":"2-3","study":"prefixes","activity":"meaning","challenge":false}',0);if r.revision<>1 or r.plan->>'activity'<>'meaning' then raise exception 'Plan save failed';end if;
 begin perform public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222',r.plan,0);raise exception 'Stale save accepted';exception when serialization_failure then null;end;
 for x in select value from jsonb_array_elements('[{"flight":"2-3","study":"roots","activity":"meaning","challenge":false},{"flight":"4-5","study":"roots","activity":"build","challenge":false},{"flight":"4-5","study":"root-suffix","activity":"use","challenge":false,"note":"must not collect"},{"flight":"4-5","study":"root-suffix","activity":"use","challenge":"false"}]') loop
  begin perform public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222',x,1);raise exception 'Invalid choice accepted';exception when invalid_parameter_value then null;end;
 end loop;
 begin perform 1 from private.morphology_practice_plans;raise exception 'Direct table read accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','85555555-5555-4555-8555-555555555555',true),set_config('request.jwt.claims','{"sub":"85555555-5555-4555-8555-555555555555","session_id":"87777777-7777-4777-8777-777777777777","is_anonymous":true,"role":"authenticated"}',true);
set local role authenticated;
do $$ declare r record;begin
 select * into r from public.get_morphology_practice_plan();if r.student_id<>'82222222-2222-4222-8222-222222222222' or r.plan->>'activity'<>'meaning' then raise exception 'Own plan read failed';end if;
 begin perform public.save_morphology_practice_plan(r.student_id,r.plan,1);raise exception 'Student edited plan';exception when insufficient_privilege then null;end;
 begin perform public.list_morphology_practice_plan_learners();raise exception 'Student listed educator learners';exception when insufficient_privilege then null;end;
 begin perform public.get_morphology_practice_plan('89999999-9999-4999-8999-999999999999');raise exception 'Other learner read accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','89999999-9999-4999-8999-999999999999',true),set_config('request.jwt.claims','{"sub":"89999999-9999-4999-8999-999999999999","session_id":"88888888-8888-4888-8888-888888888888","is_anonymous":false,"role":"authenticated"}',true);
set local role authenticated;
do $$ begin
 begin perform public.get_morphology_practice_plan('82222222-2222-4222-8222-222222222222');raise exception 'Cross-owner read accepted';exception when insufficient_privilege then null;end;
 begin perform public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222',null,1);raise exception 'Cross-owner clear accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','81111111-1111-4111-8111-111111111111',true),set_config('request.jwt.claims','{"sub":"81111111-1111-4111-8111-111111111111","session_id":"86666666-6666-4666-8666-666666666666","is_anonymous":false,"role":"authenticated"}',true);
set local role authenticated;
do $$ declare r record;begin
 select * into r from public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222',null,1);if r.revision<>2 or r.plan is not null then raise exception 'Clear failed';end if;
 select * into r from public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222','{"flight":"4-5","study":"root-suffix","activity":"use","challenge":false}',2);if r.revision<>3 then raise exception 'Replan revision failed';end if;
end $$;
reset role;
update private.parent_consent_cases set state='withdrawn',withdrawn_at=now() where token_hash=repeat('9',64) and owner_user_id='81111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$ begin
 begin perform public.get_morphology_practice_plan('82222222-2222-4222-8222-222222222222');raise exception 'Withdrawn read accepted';exception when insufficient_privilege then null;end;
 begin perform public.save_morphology_practice_plan('82222222-2222-4222-8222-222222222222',null,3);raise exception 'Withdrawn write accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
update auth.sessions set not_after=now()-interval '1 second' where id='86666666-6666-4666-8666-666666666666';
set local role authenticated;
do $$ begin
 begin perform public.list_morphology_practice_plan_learners();raise exception 'Expired session listed learners';exception when insufficient_privilege then null;end;
end $$;
reset role;
do $$ begin
 if has_table_privilege('authenticated','private.morphology_practice_plans','select') or has_function_privilege('anon','public.get_morphology_practice_plan(uuid)','execute') then raise exception 'Direct or anonymous grant exposed';end if;
end $$;
rollback;
select 'PASS: plan authorization, validation, revisions, student read-only, isolation, withdrawal, expired-session and grant checks; fixtures rolled back' as result;
