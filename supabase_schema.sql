-- Tables for AIC Digital Cataloging

-- 1. Profiles (extending auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'staff',
  updated_at timestamp with time zone
);

-- 2. Packages (Cataloging system)
create table packages (
  id uuid default uuid_generate_v4() primary key,
  tracking_code text unique not null,
  client_name text,
  status text check (status in ('recebido', 'entregue', 'devolvido')) default 'recebido',
  shelf_location text,
  scanned_by uuid references auth.users,
  arrival_date timestamp with time zone default now(),
  delivery_date timestamp with time zone,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table packages enable row level security;

-- Policies
create policy "Profiles viewable by auth users" on profiles for select using (auth.role() = 'authenticated');
create policy "Packages viewable by auth users" on packages for select using (auth.role() = 'authenticated');
create policy "Staff can manage packages" on packages for all using (auth.role() = 'authenticated');
