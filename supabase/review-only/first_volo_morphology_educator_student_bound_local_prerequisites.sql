-- Disposable PostgreSQL 17 fixture for the review-only contract tests.
create schema auth;
create schema private;
create role postgres superuser nologin;
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;

create function auth.uid() returns uuid language sql stable set search_path = '' as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create function auth.jwt() returns jsonb language sql stable set search_path = '' as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;

create table public.students (
  id uuid primary key, owner_user_id uuid not null, display_name text not null,
  archived_at timestamptz, created_at timestamptz not null default now()
);
create unique index students_id_owner_unique on public.students(id, owner_user_id);
create table public.classes (
  id uuid primary key, owner_user_id uuid not null, name text not null,
  archived_at timestamptz, created_at timestamptz not null default now()
);
create unique index classes_id_owner_unique on public.classes(id, owner_user_id);
create table public.class_memberships (
  class_id uuid not null, student_id uuid not null, owner_user_id uuid not null,
  created_at timestamptz not null default now(), primary key(class_id, student_id)
);
create table public.class_product_access (
  class_id uuid not null, owner_user_id uuid not null, product_key text not null,
  created_at timestamptz not null default now(), primary key(class_id, product_key)
);
create table public.product_entitlements (
  id uuid primary key, owner_user_id uuid not null, product_key text not null,
  status text not null, starts_at timestamptz not null, expires_at timestamptz not null
);
create table public.learner_profiles (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null,
  local_profile_id text not null, display_name text not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  product_key text not null, deleted_at timestamptz, student_id uuid
);
alter table public.learner_profiles add constraint learner_profiles_owner_product_local_unique
  unique(owner_user_id, product_key, local_profile_id);
create unique index learner_profiles_student_product_active_unique
  on public.learner_profiles(student_id, product_key)
  where student_id is not null and deleted_at is null;
create table public.learning_state (
  id uuid primary key default gen_random_uuid(), learner_profile_id uuid not null,
  product_key text not null, store_key text not null, data jsonb not null default '{}',
  client_updated_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint learning_state_learner_product_store_unique
    unique(learner_profile_id, product_key, store_key)
);
