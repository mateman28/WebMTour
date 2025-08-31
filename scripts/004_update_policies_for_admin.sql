-- อัปเดต policies สำหรับให้ admin สามารถจัดการข้อมูลได้

-- อัปเดต policy สำหรับ tours
drop policy if exists "tours_admin_all" on public.tours;
create policy "tours_admin_all"
  on public.tours for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and is_active = true
    )
  );

-- อัปเดต policy สำหรับ bookings
drop policy if exists "bookings_admin_all" on public.bookings;
create policy "bookings_admin_all"
  on public.bookings for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and is_active = true
    )
  );
