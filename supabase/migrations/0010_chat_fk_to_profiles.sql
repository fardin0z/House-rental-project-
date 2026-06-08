alter table public.conversations
  drop constraint conversations_tenant_id_fkey,
  add constraint conversations_tenant_id_fkey
    foreign key (tenant_id) references public.profiles(id) on delete cascade;

alter table public.conversations
  drop constraint conversations_landlord_id_fkey,
  add constraint conversations_landlord_id_fkey
    foreign key (landlord_id) references public.profiles(id) on delete cascade;

alter table public.messages
  drop constraint messages_sender_id_fkey,
  add constraint messages_sender_id_fkey
    foreign key (sender_id) references public.profiles(id) on delete cascade;

notify pgrst, 'reload schema';
