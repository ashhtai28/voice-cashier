-- Voice Cashier – Supabase schema
-- Run this in Supabase SQL Editor to create tables.

-- Order tickets (what baristas see and update)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  payload jsonb not null default '{"items":[]}'::jsonb
);

-- Index for barista queue (pending / in_progress, by created_at)
create index if not exists orders_status_created_at on orders (status, created_at);

-- Index for owner dashboard (today's orders)
create index if not exists orders_created_at on orders (created_at);

-- Auto-update updated_at on change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

comment on table orders is 'Order tickets; payload matches OrderState (items array with name, size, temperature, milk, sweetness, extraShots).';
