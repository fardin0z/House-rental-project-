create table if not exists public.phone_otps (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  purpose text not null default 'signup',
  attempts int not null default 0,
  consumed_at timestamptz,
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists phone_otps_phone_idx on public.phone_otps (phone);
create index if not exists phone_otps_expires_at_idx on public.phone_otps (expires_at);

alter table public.phone_otps enable row level security;

revoke all on public.phone_otps from anon, authenticated;

alter table public.profiles
  add column if not exists phone_verified_at timestamptz;
