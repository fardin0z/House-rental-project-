alter table public.profiles alter column phone drop not null;
alter table public.profiles add column if not exists email text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email, name)
  values (
    new.id,
    new.phone,
    new.email,
    new.raw_user_meta_data->>'name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
