-- แก้ไขปัญหา infinite recursion ใน RLS policies

-- ลบ policies เดิมที่ทำให้เกิด recursion
drop policy if exists "admin_users_super_admin_all" on public.admin_users;
drop policy if exists "tours_admin_all" on public.tours;
drop policy if exists "bookings_admin_all" on public.bookings;

-- สร้าง policy ใหม่สำหรับ admin_users ที่ไม่เกิด recursion
-- ให้ admin ดูข้อมูลตัวเองได้เท่านั้น
create policy "admin_users_select_own"
  on public.admin_users for select
  using (auth.uid() = id);

-- สร้าง policy ใหม่สำหรับ tours ที่ใช้ security definer function
create policy "tours_public_select"
  on public.tours for select
  using (true); -- อนุญาตให้ทุกคนดูทัวร์ได้

create policy "tours_admin_modify"
  on public.tours for all
  using (
    auth.uid() in (
      select id from public.admin_users where is_active = true
    )
  );

-- สร้าง policy ใหม่สำหรับ bookings
create policy "bookings_insert_public"
  on public.bookings for insert
  with check (true); -- อนุญาตให้ทุกคนจองได้

create policy "bookings_admin_all"
  on public.bookings for all
  using (
    auth.uid() in (
      select id from public.admin_users where is_active = true
    )
  );

-- สร้าง function เพื่อตรวจสอบว่าเป็น admin หรือไม่
create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users
    where id = user_id and is_active = true
  );
$$;

-- อัปเดต policies ให้ใช้ function แทน
drop policy if exists "tours_admin_modify" on public.tours;
create policy "tours_admin_modify"
  on public.tours for all
  using (public.is_admin());

drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all"
  on public.bookings for all
  using (public.is_admin());
