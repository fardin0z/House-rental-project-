-- Store the phone number tenants should use for this specific listing.
alter table public.listings
  add column if not exists contact_phone text;
