alter table public.messages
  add column attachment_path text,
  add column attachment_type text,
  add column attachment_name text;

alter table public.messages
  alter column body drop not null;

alter table public.messages
  drop constraint if exists messages_body_check;

alter table public.messages
  add constraint messages_content_check
    check (
      (body is not null and char_length(body) between 1 and 2000)
      or attachment_path is not null
    );

insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

create policy chat_attachments_public_read
  on storage.objects for select
  using (bucket_id = 'chat-attachments');

create policy chat_attachments_participant_insert
  on storage.objects for insert
  with check (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1 from public.conversations c
      where c.id::text = (storage.foldername(name))[1]
        and (c.tenant_id = auth.uid() or c.landlord_id = auth.uid())
    )
  );

create policy chat_attachments_owner_delete
  on storage.objects for delete
  using (
    bucket_id = 'chat-attachments'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
