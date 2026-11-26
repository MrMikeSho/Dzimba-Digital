-- =====================================================================
-- Dzimba Digital: database setup
-- Run this ONCE in Supabase -> SQL Editor -> New query -> Run.
-- It is safe to run again (it drops and recreates policies).
-- =====================================================================

-- ---------- ACCESS (needed on newer Supabase projects) -------------
-- Lets the website's roles reach the tables. Row-level security (below)
-- still decides which rows each person can see or change.
grant usage on schema public to anon, authenticated;

-- ---------- PROFILES ----------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'tenant' check (role in ('tenant', 'landlord', 'broker')),
  created_at timestamptz not null default now()
);

create or replace function public.is_broker() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'broker');
$$;

create or replace function public.my_role() returns text
language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Create a profile automatically when someone signs up.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    case when new.raw_user_meta_data->>'role' = 'landlord' then 'landlord' else 'tenant' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- Users may switch between tenant and landlord, but nobody can make
-- themselves a broker. (The SQL editor has no auth.uid(), so you can.)
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_broker() then
    if new.role not in ('tenant', 'landlord') or old.role = 'broker' then
      new.role := old.role;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_role_update on public.profiles;
create trigger guard_profile_role_update
  before update on public.profiles
  for each row execute function public.guard_profile_role();

alter table public.profiles enable row level security;

drop policy if exists "profiles read own or broker" on public.profiles;
create policy "profiles read own or broker" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_broker());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (id = auth.uid() and role in ('tenant', 'landlord'));

drop policy if exists "profiles update own or broker" on public.profiles;
create policy "profiles update own or broker" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_broker())
  with check (id = auth.uid() or public.is_broker());

-- ---------- LISTINGS (public details) -------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  landlord_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  property_type text,
  town text not null default 'Mutare',
  suburb text,
  rent_monthly numeric not null check (rent_monthly >= 0),
  deposit numeric,
  bedrooms int,
  bathrooms int,
  features text[] not null default '{}',
  images text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'rented')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists listings_status_created_idx on public.listings (status, created_at desc);

-- Non-brokers cannot change a listing's status or owner.
create or replace function public.guard_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_broker() then
    new.status := old.status;
    new.landlord_id := old.landlord_id;
  end if;
  return new;
end $$;

drop trigger if exists guard_listing_update on public.listings;
create trigger guard_listing_update
  before update on public.listings
  for each row execute function public.guard_listing();

alter table public.listings enable row level security;

drop policy if exists "listings public read approved" on public.listings;
create policy "listings public read approved" on public.listings
  for select using (status = 'approved');

drop policy if exists "listings owner read" on public.listings;
create policy "listings owner read" on public.listings
  for select to authenticated using (landlord_id = auth.uid());

drop policy if exists "listings broker all" on public.listings;
create policy "listings broker all" on public.listings
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

drop policy if exists "listings landlord insert" on public.listings;
create policy "listings landlord insert" on public.listings
  for insert to authenticated
  with check (landlord_id = auth.uid() and status = 'pending' and public.my_role() = 'landlord');

drop policy if exists "listings owner update" on public.listings;
create policy "listings owner update" on public.listings
  for update to authenticated
  using (landlord_id = auth.uid()) with check (landlord_id = auth.uid());

drop policy if exists "listings owner delete" on public.listings;
create policy "listings owner delete" on public.listings
  for delete to authenticated using (landlord_id = auth.uid());

-- ---------- LISTING_PRIVATE (address + landlord contact) ------------
-- Never visible to the public. Only the owner and the broker can read it.
create table if not exists public.listing_private (
  listing_id uuid primary key references public.listings(id) on delete cascade,
  address text,
  contact_name text,
  contact_phone text
);

alter table public.listing_private enable row level security;

drop policy if exists "private owner select" on public.listing_private;
create policy "private owner select" on public.listing_private
  for select to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid()));

drop policy if exists "private owner insert" on public.listing_private;
create policy "private owner insert" on public.listing_private
  for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid()));

drop policy if exists "private owner update" on public.listing_private;
create policy "private owner update" on public.listing_private
  for update to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid()))
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.landlord_id = auth.uid()));

drop policy if exists "private broker all" on public.listing_private;
create policy "private broker all" on public.listing_private
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

-- ---------- REQUESTS (tenant asks for a listing; fee tracked here) --
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  listing_title text,
  tenant_id uuid not null references auth.users(id) on delete cascade,
  tenant_name text,
  tenant_phone text,
  message text,
  preferred_date text,
  status text not null default 'new' check (status in ('new', 'accepted', 'paid', 'linked', 'declined', 'closed')),
  fee_amount numeric,
  fee_method text,
  fee_reference text,
  fee_paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (listing_id, tenant_id)
);
create index if not exists requests_status_idx on public.requests (status, created_at desc);

alter table public.requests enable row level security;

drop policy if exists "requests tenant read" on public.requests;
create policy "requests tenant read" on public.requests
  for select to authenticated using (tenant_id = auth.uid());

drop policy if exists "requests tenant insert" on public.requests;
create policy "requests tenant insert" on public.requests
  for insert to authenticated
  with check (
    tenant_id = auth.uid()
    and status = 'new'
    and fee_amount is null and fee_method is null and fee_reference is null and fee_paid_at is null
    and exists (select 1 from public.listings l where l.id = listing_id and l.status = 'approved')
  );

drop policy if exists "requests tenant cancel" on public.requests;
create policy "requests tenant cancel" on public.requests
  for delete to authenticated using (tenant_id = auth.uid() and status = 'new');

drop policy if exists "requests broker all" on public.requests;
create policy "requests broker all" on public.requests
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

-- ---------- LINKS (tenant linked to landlord after the fee is paid) --
-- Contact details are copied in at link time, so each side only ever sees
-- the other side's details once the broker has linked them.
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  listing_title text,
  tenant_id uuid references auth.users(id) on delete set null,
  landlord_id uuid references auth.users(id) on delete set null,
  tenant_name text,
  tenant_phone text,
  landlord_name text,
  landlord_phone text,
  address text,
  created_at timestamptz not null default now()
);

alter table public.links enable row level security;

drop policy if exists "links parties read" on public.links;
create policy "links parties read" on public.links
  for select to authenticated
  using (tenant_id = auth.uid() or landlord_id = auth.uid() or public.is_broker());

drop policy if exists "links broker all" on public.links;
create policy "links broker all" on public.links
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

-- ---------- INQUIRIES (general contact form) ------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  message text,
  inquiry_type text,
  preferred_date text,
  property_id text,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

drop policy if exists "inquiries anyone insert" on public.inquiries;
create policy "inquiries anyone insert" on public.inquiries
  for insert to anon, authenticated
  with check (coalesce(length(message), 0) <= 2000 and coalesce(length(full_name), 0) <= 200);

drop policy if exists "inquiries broker all" on public.inquiries;
create policy "inquiries broker all" on public.inquiries
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

-- ---------- STORAGE (listing photos) --------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "listing images public read" on storage.objects;
create policy "listing images public read" on storage.objects
  for select using (bucket_id = 'listing-images');

drop policy if exists "listing images upload own folder" on storage.objects;
create policy "listing images upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "listing images delete own" on storage.objects;
create policy "listing images delete own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_broker()));

-- Table access for the website (run after the tables above exist).
grant select on public.listings to anon;
grant insert on public.inquiries to anon;
grant select, insert, update, delete on
  public.profiles, public.listings, public.listing_private,
  public.requests, public.links, public.inquiries
  to authenticated;
grant execute on function public.is_broker(), public.my_role() to anon, authenticated;

-- =====================================================================
-- AFTER you have created your own account on the website, make it the
-- broker account by running this (replace the email), as a SEPARATE query:
--
--   update public.profiles set role = 'broker'
--   where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
-- =====================================================================

-- Cash Flow tables and automatic fee log: see supabase/cashflow.sql
