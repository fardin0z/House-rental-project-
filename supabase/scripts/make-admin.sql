-- Promote a user to admin. Run in Supabase SQL Editor.
-- Replace the email or phone below with the target user.

update public.profiles
set role = 'admin'
where email = 'code@gmail.com';

-- Alternative: promote by phone (BD format, e.g. +8801712345678)
-- update public.profiles
-- set role = 'admin'
-- where phone = '+8801712345678';

select id, name, email, phone, role from public.profiles where role = 'admin';
