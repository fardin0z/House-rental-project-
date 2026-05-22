create schema if not exists private;

create type user_role as enum ('tenant', 'landlord', 'admin');
create type nid_status as enum ('pending', 'approved', 'rejected');
create type moving_request_status as enum ('pending', 'confirmed', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  name text,
  role user_role not null default 'tenant',
  nid_status nid_status not null default 'pending',
  welcome_seen_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nid_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  front_path text not null,
  back_path text not null,
  selfie_path text not null,
  status nid_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index nid_documents_user_id_idx on public.nid_documents (user_id);
create index nid_documents_status_idx on public.nid_documents (status);

create table public.moving_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  phone text not null,
  from_area text not null,
  to_area text not null,
  flat_details text,
  requested_date date,
  status moving_request_status not null default 'pending',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index moving_requests_status_idx on public.moving_requests (status);
create index moving_requests_user_id_idx on public.moving_requests (user_id);

create or replace function private.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (select 1 from public.profiles where id = uid and role = 'admin');
$$;

revoke all on function private.is_admin(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger moving_requests_set_updated_at
  before update on public.moving_requests
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.nid_documents enable row level security;
alter table public.moving_requests enable row level security;

create policy profiles_self_select
  on public.profiles for select
  using (id = auth.uid() or private.is_admin(auth.uid()));

create policy profiles_self_update
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_update
  on public.profiles for update
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

create policy nid_self_select
  on public.nid_documents for select
  using (user_id = auth.uid() or private.is_admin(auth.uid()));

create policy nid_self_insert
  on public.nid_documents for insert
  with check (user_id = auth.uid());

create policy nid_admin_update
  on public.nid_documents for update
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

create policy moving_anyone_insert
  on public.moving_requests for insert
  with check (true);

create policy moving_self_select
  on public.moving_requests for select
  using (user_id = auth.uid() or private.is_admin(auth.uid()));

create policy moving_admin_update
  on public.moving_requests for update
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

insert into storage.buckets (id, name, public)
values ('nid-documents', 'nid-documents', false)
on conflict (id) do nothing;

create policy nid_storage_self_insert
  on storage.objects for insert
  with check (
    bucket_id = 'nid-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy nid_storage_self_select
  on storage.objects for select
  using (
    bucket_id = 'nid-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or private.is_admin(auth.uid())
    )
  );

create policy nid_storage_self_update
  on storage.objects for update
  using (
    bucket_id = 'nid-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'nid-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy nid_storage_self_delete
  on storage.objects for delete
  using (
    bucket_id = 'nid-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
