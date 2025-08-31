-- สร้าง admin user ตัวอย่าง
-- หมายเหตุ: ต้องสร้าง user ใน auth.users ก่อน จากนั้นจึงเพิ่มข้อมูลใน admin_users

-- เพิ่มข้อมูล admin user (ใช้ UUID ที่จะได้จากการสร้าง user ใน Supabase Auth)
-- ตัวอย่าง: หลังจากสร้าง user แล้ว ให้ใช้ UUID ที่ได้มาแทนที่ในคำสั่งด้านล่าง

-- INSERT INTO public.admin_users (id, email, full_name, role, is_active)
-- VALUES (
--   'USER_UUID_FROM_AUTH', -- แทนที่ด้วย UUID จริงจาก auth.users
--   'admin@example.com',
--   'ผู้ดูแลระบบ',
--   'super_admin',
--   true
-- );

-- สำหรับการทดสอบ สามารถสร้าง admin user ผ่าน Supabase Dashboard:
-- 1. ไปที่ Authentication > Users
-- 2. สร้าง user ใหม่ด้วย email: admin@example.com, password: admin123
-- 3. คัดลอก UUID ของ user ที่สร้าง
-- 4. รันคำสั่ง INSERT ด้านบนโดยแทนที่ UUID

-- หรือใช้ function นี้เพื่อเพิ่ม admin user อัตโนมัติ
CREATE OR REPLACE FUNCTION add_admin_user(user_email TEXT, user_password TEXT, full_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- สร้าง auth user (ต้องมีสิทธิ์ service_role)
  -- ในการใช้งานจริง ควรสร้างผ่าน Supabase Dashboard หรือ API
  
  -- เพิ่มข้อมูลใน admin_users table
  -- (สมมติว่า user ถูกสร้างแล้วใน auth.users)
  
  RETURN 'กรุณาสร้าง admin user ผ่าน Supabase Dashboard แล้วเพิ่มข้อมูลใน admin_users table';
END;
$$;
