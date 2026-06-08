update public.profiles p
   set name = u.raw_user_meta_data->>'name'
  from auth.users u
 where p.id = u.id
   and p.name is null
   and u.raw_user_meta_data ? 'name'
   and length(u.raw_user_meta_data->>'name') > 0;

create or replace function public.sync_profile_name_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.raw_user_meta_data ? 'name' then
    update public.profiles
       set name = new.raw_user_meta_data->>'name'
     where id = new.id
       and (name is null or name = '');
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_name_from_auth on auth.users;
create trigger profiles_sync_name_from_auth
  after insert or update of raw_user_meta_data on auth.users
  for each row execute function public.sync_profile_name_from_auth();
