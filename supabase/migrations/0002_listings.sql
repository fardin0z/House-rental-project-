create type listing_status as enum ('draft', 'pending', 'approved', 'rejected', 'archived');
create type rental_type as enum ('family_flat', 'bachelor', 'sublet', 'shop', 'office');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default '',
  description text,
  rental_type rental_type not null default 'family_flat',
  rent integer not null default 0,
  beds smallint,
  baths smallint,
  area_sqft integer,
  area_name text not null default '',
  division text,
  district text,
  lat double precision,
  lng double precision,
  status listing_status not null default 'draft',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_owner_id_idx on public.listings (owner_id);
create index listings_status_idx on public.listings (status);
create index listings_area_idx on public.listings (area_name);
create index listings_rent_idx on public.listings (rent);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  path text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index listing_images_listing_id_idx on public.listing_images (listing_id);

alter table public.listings enable row level security;
alter table public.listing_images enable row level security;

create policy listings_public_read
  on public.listings for select
  using (
    status = 'approved'
    or owner_id = auth.uid()
    or private.is_admin(auth.uid())
  );

create policy listings_landlord_insert
  on public.listings for insert
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
        and p.nid_status = 'approved'
    )
  );

create policy listings_owner_update
  on public.listings for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy listings_admin_update
  on public.listings for update
  using (private.is_admin(auth.uid()))
  with check (private.is_admin(auth.uid()));

create policy listings_owner_delete
  on public.listings for delete
  using (owner_id = auth.uid() or private.is_admin(auth.uid()));

create policy listing_images_read
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (
          l.status = 'approved'
          or l.owner_id = auth.uid()
          or private.is_admin(auth.uid())
        )
    )
  );

create policy listing_images_owner_insert
  on public.listing_images for insert
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id = auth.uid()
    )
  );

create policy listing_images_owner_delete
  on public.listing_images for delete
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id = auth.uid()
    )
    or private.is_admin(auth.uid())
  );

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy listing_storage_public_read
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy listing_storage_landlord_insert
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'landlord'
        and p.nid_status = 'approved'
    )
  );

create policy listing_storage_owner_update
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy listing_storage_owner_delete
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
