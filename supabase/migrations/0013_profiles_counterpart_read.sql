create policy profiles_conversation_counterpart_read
  on public.profiles for select
  using (
    exists (
      select 1 from public.conversations c
      where (c.tenant_id = auth.uid() and c.landlord_id = profiles.id)
         or (c.landlord_id = auth.uid() and c.tenant_id = profiles.id)
    )
  );

notify pgrst, 'reload schema';
