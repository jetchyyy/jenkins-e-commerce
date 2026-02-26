-- Extensions
create extension if not exists pgcrypto;

-- Enums
create type public.user_role as enum ('superadmin', 'customer');
create type public.book_format as enum ('pdf', 'epub');
create type public.order_status as enum ('pending', 'paid', 'failed', 'refunded');

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  description text not null,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'PHP',
  cover_url text not null,
  file_path text,
  format public.book_format not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  payment_provider text not null default 'stripe',
  payment_intent_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_orders_payment_intent_id on public.orders (payment_intent_id) where payment_intent_id is not null;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  price_cents integer not null check (price_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  order_id uuid not null references public.orders(id) on delete cascade,
  granted_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.book_views (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.system_bootstrap (
  id bigserial primary key,
  email text not null,
  generated_password text not null,
  created_at timestamptz not null default now()
);

-- Helpers
create or replace function public.is_superadmin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role = 'superadmin'
  );
$$;

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
before update on public.books
for each row
execute function public.set_timestamp();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    coalesce(new.email, ''),
    case
      when (new.raw_user_meta_data->>'role')::text = 'superadmin' then 'superadmin'::public.user_role
      else 'customer'::public.user_role
    end
  )
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Analytics RPCs
create or replace function public.admin_totals()
returns table(total_revenue bigint, total_orders bigint)
language sql
stable
as $$
  select
    coalesce(sum(total_cents), 0)::bigint as total_revenue,
    count(*)::bigint as total_orders
  from public.orders
  where status = 'paid';
$$;

create or replace function public.admin_best_selling_books()
returns table(book_id uuid, title text, sold_count bigint, revenue bigint)
language sql
stable
as $$
  select
    b.id as book_id,
    b.title,
    count(oi.id)::bigint as sold_count,
    coalesce(sum(oi.price_cents), 0)::bigint as revenue
  from public.order_items oi
  join public.orders o on o.id = oi.order_id and o.status = 'paid'
  join public.books b on b.id = oi.book_id
  group by b.id, b.title
  order by sold_count desc, revenue desc
  limit 10;
$$;

create or replace function public.admin_revenue_daily()
returns table(day date, revenue bigint, orders bigint)
language sql
stable
as $$
  select
    date(o.created_at) as day,
    coalesce(sum(o.total_cents), 0)::bigint as revenue,
    count(*)::bigint as orders
  from public.orders o
  where o.status = 'paid'
  group by date(o.created_at)
  order by day desc
  limit 60;
$$;

create or replace function public.admin_revenue_weekly()
returns table(week_start date, revenue bigint, orders bigint)
language sql
stable
as $$
  select
    date_trunc('week', o.created_at)::date as week_start,
    coalesce(sum(o.total_cents), 0)::bigint as revenue,
    count(*)::bigint as orders
  from public.orders o
  where o.status = 'paid'
  group by date_trunc('week', o.created_at)
  order by week_start desc
  limit 26;
$$;

create or replace function public.admin_revenue_monthly()
returns table(month_start date, revenue bigint, orders bigint)
language sql
stable
as $$
  select
    date_trunc('month', o.created_at)::date as month_start,
    coalesce(sum(o.total_cents), 0)::bigint as revenue,
    count(*)::bigint as orders
  from public.orders o
  where o.status = 'paid'
  group by date_trunc('month', o.created_at)
  order by month_start desc
  limit 24;
$$;
