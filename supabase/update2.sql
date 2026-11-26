-- =====================================================================
-- Dzimba Digital: update 2 (terms + viewing time, Pending status,
-- renter requests). Run in Supabase -> SQL Editor. Safe to re-run.
-- =====================================================================

-- 1. Viewing time and terms agreement on requests
alter table public.requests add column if not exists preferred_time text;
alter table public.requests add column if not exists terms_accepted_at timestamptz;

drop policy if exists "requests tenant insert" on public.requests;
create policy "requests tenant insert" on public.requests
  for insert to authenticated
  with check (
    tenant_id = auth.uid()
    and status = 'new'
    and terms_accepted_at is not null
    and fee_amount is null and fee_method is null and fee_reference is null and fee_paid_at is null
    and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'approved')
  );

-- 2. "Pending" (under offer) listing status: still visible, not requestable
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
  check (status in ('pending', 'approved', 'rejected', 'rented', 'reserved'));

drop policy if exists "listings public read approved" on public.listings;
create policy "listings public read approved" on public.listings
  for select using (status in ('approved', 'reserved'));

-- 3. Renter requests ("I'm looking for...")
create table if not exists public.renter_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references auth.users(id) on delete cascade,
  tenant_name text,
  tenant_phone text,
  area text,
  budget numeric,
  bedrooms int,
  property_type text,
  move_in text,
  notes text,
  status text not null default 'new' check (status in ('new', 'accepted', 'closed', 'declined')),
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.renter_requests enable row level security;

drop policy if exists "renter tenant read" on public.renter_requests;
create policy "renter tenant read" on public.renter_requests
  for select to authenticated using (tenant_id = auth.uid());

drop policy if exists "renter tenant insert" on public.renter_requests;
create policy "renter tenant insert" on public.renter_requests
  for insert to authenticated
  with check (tenant_id = auth.uid() and status = 'new');

drop policy if exists "renter tenant delete" on public.renter_requests;
create policy "renter tenant delete" on public.renter_requests
  for delete to authenticated using (tenant_id = auth.uid() and status = 'new');

drop policy if exists "renter broker all" on public.renter_requests;
create policy "renter broker all" on public.renter_requests
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

grant select, insert, update, delete on public.renter_requests to authenticated;
