drop policy if exists listings_landlord_insert on public.listings;
create policy listings_landlord_insert
  on public.listings for insert
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
    )
  );

drop policy if exists listing_storage_landlord_insert on storage.objects;
create policy listing_storage_landlord_insert
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
    )
  );
