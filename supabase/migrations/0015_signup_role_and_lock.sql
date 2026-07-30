create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  resolved_role user_role;
begin
  meta_role := new.raw_user_meta_data->>'role';
  if meta_role in ('tenant', 'landlord') then
    resolved_role := meta_role::user_role;
  else
    resolved_role := 'tenant'::user_role;
  end if;

  insert into public.profiles (id, phone, email, name, role)
  values (
    new.id,
    new.phone,
    new.email,
    new.raw_user_meta_data->>'name',
    resolved_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() = new.id
     and not private.is_admin(auth.uid()) then
    raise exception 'role can only be changed by an admin';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change
  before update of role on public.profiles
  for each row execute function public.prevent_self_role_change();
