-- สร้างตาราง bookings สำหรับเก็บข้อมูลการจอง
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  user_phone text not null,
  booking_date date not null, -- วันที่ต้องการเดินทาง
  participants_count integer not null check (participants_count > 0),
  total_price decimal(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- เปิดใช้งาน RLS
alter table public.bookings enable row level security;

-- สร้าง policy สำหรับผู้ใช้ดูการจองของตัวเอง (ใช้ email เป็นตัวระบุ)
create policy "bookings_select_own"
  on public.bookings for select
  using (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- สร้าง policy สำหรับการสร้างการจองใหม่
create policy "bookings_insert_own"
  on public.bookings for insert
  with check (true); -- อนุญาตให้ทุกคนสร้างการจองได้

-- สร้าง policy สำหรับ admin จัดการการจองทั้งหมด
create policy "bookings_admin_all"
  on public.bookings for all
  using (false); -- ปิดไว้ก่อน จะเปิดเมื่อมีระบบ admin

-- สร้าง index สำหรับการค้นหา
create index if not exists bookings_tour_id_idx on public.bookings(tour_id);
create index if not exists bookings_user_email_idx on public.bookings(user_email);
create index if not exists bookings_booking_date_idx on public.bookings(booking_date);
create index if not exists bookings_status_idx on public.bookings(status);
