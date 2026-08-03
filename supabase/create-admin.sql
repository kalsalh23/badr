-- ============================================================
-- إنشاء حساب المدير في Supabase Auth
-- قم بتنفيذ هذا الملف في SQL Editor بعد تنفيذ schema.sql الرئيسي
-- ============================================================

-- 1. إنشاء مستخدم المصادقة (Auth User)
-- كلمة المرور: badr@2026
-- سيتم تشفيرها بواسطة pgcrypto
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_token,
  confirmation_token,
  confirmation_sent_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@badr.com',
  crypt('badr@2026', gen_salt('bf')),
  now(),
  '',
  '',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"مدير النظام","role":"admin"}',
  false,
  now()
)
on conflict (email) do nothing;

-- 2. إنشاء هوية المستخدم
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(),
  now(),
  now()
from auth.users
where email = 'admin@badr.com'
on conflict do nothing;

-- 3. إنشاء الجلسة
insert into auth.sessions (
  id,
  user_id,
  created_at,
  factor_id,
  aal,
  not_after
)
select
  gen_random_uuid(),
  id,
  now(),
  null,
  'aal1',
  now() + interval '7 days'
from auth.users
where email = 'admin@badr.com'
on conflict do nothing;

-- 4. إضافة المدير إلى جدول AdminUsers
insert into public."AdminUsers" (user_id, name, email, role, is_active)
select id, 'مدير النظام', 'admin@badr.com', 'admin', true
from auth.users
where email = 'admin@badr.com'
on conflict (email) do nothing;

-- 5. التحقق من النتيجة
select
  au.id as user_id,
  au.email,
  au.raw_user_meta_data->>'name' as name,
  au.raw_user_meta_data->>'role' as role,
  admin.is_active
from auth.users au
left join public."AdminUsers" admin on admin.user_id = au.id
where au.email = 'admin@badr.com';
