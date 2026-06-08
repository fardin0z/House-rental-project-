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

grant execute on function public.custom_access_token_hook(jsonb)
  to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb)
  from authenticated, anon, public;

grant select on table public.profiles to supabase_auth_admin;

create policy "auth_admin_read_profiles_for_hook"
  on public.profiles
  as permissive
  for select
  to supabase_auth_admin
  using (true);
