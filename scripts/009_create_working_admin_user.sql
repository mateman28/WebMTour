-- สร้าง admin user ที่ทำงานได้จริง
-- user: admin, password: admin1234

-- สร้าง auth user ใน auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'parmate@gmail.com',
  crypt('admin1234', gen_salt('bf')), -- เข้ารหัส password
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"ผู้ดูแลระบบ"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- เพิ่มข้อมูลใน admin_users table
INSERT INTO public.admin_users (id, email, full_name, role, is_active)
SELECT 
  id,
  'admin@example.com',
  'ผู้ดูแลระบบ',
  'super_admin',
  true
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- สร้าง identity สำหรับ email login
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) SELECT 
  gen_random_uuid(),
  id,
  format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb,
  'email',
  NOW(),
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (provider, user_id) DO NOTHING;
