create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  landlord_id uuid not null references auth.users(id) on delete cascade,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now()
);

create unique index conversations_unique_trio
  on public.conversations (listing_id, tenant_id, landlord_id);
create index conversations_tenant_idx on public.conversations (tenant_id, last_message_at desc nulls last);
create index conversations_landlord_idx on public.conversations (landlord_id, last_message_at desc nulls last);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy conversations_participant_read
  on public.conversations for select
  using (
    tenant_id = auth.uid()
    or landlord_id = auth.uid()
    or private.is_admin(auth.uid())
  );

create policy conversations_participant_insert
  on public.conversations for insert
  with check (
    tenant_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.status = 'approved'
        and l.owner_id = landlord_id
    )
  );

create policy conversations_participant_update
  on public.conversations for update
  using (tenant_id = auth.uid() or landlord_id = auth.uid())
  with check (tenant_id = auth.uid() or landlord_id = auth.uid());

create policy messages_participant_read
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
    or private.is_admin(auth.uid())
  );

create policy messages_participant_insert
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

create policy messages_recipient_update
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.conversations
     set last_message_at = new.created_at,
         last_message_preview = left(new.body, 160)
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
