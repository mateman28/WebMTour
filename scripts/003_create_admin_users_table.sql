-- สร้างตาราง admin_users สำหรับระบบหลังบ้าน
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- เปิดใช้งาน RLS
alter table public.admin_users enable row level security;

-- สร้าง policy สำหรับ admin ดูข้อมูลตัวเอง
create policy "admin_users_select_own"
  on public.admin_users for select
  using (auth.uid() = id);

-- สร้าง policy สำหรับ super_admin จัดการ admin อื่นๆ
create policy "admin_users_super_admin_all"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'super_admin' and is_active = true
    )
  );

-- สร้าง index
create index if not exists admin_users_email_idx on public.admin_users(email);
create index if not exists admin_users_role_idx on public.admin_users(role);
