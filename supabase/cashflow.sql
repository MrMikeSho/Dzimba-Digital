-- =====================================================================
-- Dzimba Digital: Cash Flow (transactions log + read-only sharing)
-- Run in Supabase -> SQL Editor -> New query -> Run. Safe to re-run.
-- =====================================================================

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('income', 'expense')),
  amount numeric not null check (amount >= 0),
  category text,
  note text,
  method text,
  reference text,
  request_id uuid unique references public.requests(id) on delete set null,
  auto boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists transactions_occurred_idx on public.transactions (occurred_at desc);

-- People the broker has shared Cash Flow with (read-only, by email).
create table if not exists public.cashflow_viewers (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);

create or replace function public.is_cashflow_viewer() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.cashflow_viewers
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.transactions enable row level security;
alter table public.cashflow_viewers enable row level security;

drop policy if exists "transactions broker all" on public.transactions;
create policy "transactions broker all" on public.transactions
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

drop policy if exists "transactions viewer read" on public.transactions;
create policy "transactions viewer read" on public.transactions
  for select to authenticated using (public.is_cashflow_viewer());

drop policy if exists "viewers broker all" on public.cashflow_viewers;
create policy "viewers broker all" on public.cashflow_viewers
  for all to authenticated using (public.is_broker()) with check (public.is_broker());

grant select, insert, update, delete on public.transactions, public.cashflow_viewers to authenticated;
grant execute on function public.is_cashflow_viewer() to authenticated;

-- Automatic log: when a request's fee is marked paid, record the income.
create or replace function public.log_fee_income() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.fee_paid_at is not null and new.fee_amount is not null
     and (tg_op = 'INSERT' or old.fee_paid_at is null) then
    insert into public.transactions (kind, amount, category, note, method, reference, request_id, auto, occurred_at)
    values ('income', new.fee_amount, 'Tenant fee',
            coalesce(new.tenant_name, 'Tenant') || ' - ' || coalesce(new.listing_title, 'listing'),
            new.fee_method, new.fee_reference, new.id, true, new.fee_paid_at)
    on conflict (request_id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists log_fee_income_trg on public.requests;
create trigger log_fee_income_trg
  after insert or update on public.requests
  for each row execute function public.log_fee_income();

-- Back-fill fees already marked paid.
insert into public.transactions (kind, amount, category, note, method, reference, request_id, auto, occurred_at)
select 'income', r.fee_amount, 'Tenant fee',
       coalesce(r.tenant_name, 'Tenant') || ' - ' || coalesce(r.listing_title, 'listing'),
       r.fee_method, r.fee_reference, r.id, true, r.fee_paid_at
from public.requests r
where r.fee_paid_at is not null and r.fee_amount is not null
on conflict (request_id) do nothing;
