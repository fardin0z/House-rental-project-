create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  app_metadata jsonb;
  user_role text;
begin
  select role::text into user_role
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  app_metadata := coalesce(claims->'app_metadata', '{}'::jsonb);

  if user_role is not null then
    app_metadata := jsonb_set(app_metadata, '{role}', to_jsonb(user_role));
  end if;

  claims := jsonb_set(claims, '{app_metadata}', app_metadata);
  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

drop table if exists public.phone_otps;

alter table public.profiles
  drop column if exists phone_verified_at;

update auth.users
   set phone_confirmed_at = coalesce(phone_confirmed_at, now())
 where phone is not null
   and phone_confirmed_at is null;
