create type subscription_tier as enum ('free', 'premium');
create type subscription_status as enum ('active', 'expired', 'cancelled');
create type transaction_status as enum ('pending', 'completed', 'failed', 'cancelled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier subscription_tier not null default 'premium',
  status subscription_status not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_active_idx
  on public.subscriptions (user_id, status, expires_at desc);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'BDT',
  aamarpay_transaction_id text unique,
  provider_transaction_id text,
  status transaction_status not null default 'pending',
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_idx on public.transactions (user_id, created_at desc);
create index transactions_status_idx on public.transactions (status);

create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;
alter table public.transactions enable row level security;

create policy subscriptions_owner_read
  on public.subscriptions for select
  using (user_id = auth.uid() or private.is_admin(auth.uid()));

create policy subscriptions_admin_write
  on public.subscriptions for all
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

create policy transactions_owner_read
  on public.transactions for select
  using (user_id = auth.uid() or private.is_admin(auth.uid()));

create policy transactions_admin_write
  on public.transactions for all
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

create or replace function public.has_active_premium(uid uuid)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1 from public.subscriptions
     where user_id = uid
       and tier = 'premium'
       and status = 'active'
       and expires_at > now()
  );
$$;

revoke all on function public.has_active_premium(uuid) from public;
grant execute on function public.has_active_premium(uuid) to anon, authenticated;
