-- สร้าง admin user อย่างง่าย
-- ใช้ Supabase auth.users table และ admin_users table

-- เพิ่มข้อมูลใน admin_users table โดยตรง
-- ใช้ UUID ที่กำหนดเองสำหรับ admin user
INSERT INTO public.admin_users (id, email, is_active, is_super_admin, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@example.com',
  true,
  true,
  now()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  is_super_admin = EXCLUDED.is_super_admin;

-- แสดงข้อมูลที่สร้างแล้ว
SELECT * FROM public.admin_users WHERE email = 'admin@example.com';
