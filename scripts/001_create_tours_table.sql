-- สร้างตาราง tours สำหรับเก็บข้อมูลแพ็คเกจทัวร์
create table if not exists public.tours (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price decimal(10,2) not null,
  duration_days integer not null,
  max_participants integer not null,
  image_url text,
  location text not null,
  highlights text[], -- array ของจุดเด่นของทัวร์
  included_services text[], -- array ของบริการที่รวมอยู่
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- เปิดใช้งาน RLS
alter table public.tours enable row level security;

-- สร้าง policy สำหรับอ่านข้อมูล tours (ทุกคนสามารถดูได้)
create policy "tours_select_all"
  on public.tours for select
  using (is_active = true);

-- สร้าง policy สำหรับ admin เท่านั้นที่สามารถจัดการ tours ได้
-- (จะปรับปรุงเมื่อมีระบบ admin)
create policy "tours_admin_all"
  on public.tours for all
  using (false); -- ปิดไว้ก่อน จะเปิดเมื่อมีระบบ admin

-- สร้าง index สำหรับการค้นหา
create index if not exists tours_location_idx on public.tours(location);
create index if not exists tours_price_idx on public.tours(price);
create index if not exists tours_active_idx on public.tours(is_active);
