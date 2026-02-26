alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.library enable row level security;
alter table public.book_views enable row level security;
alter table public.system_bootstrap enable row level security;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
on public.profiles for select
using (auth.uid() = id or public.is_superadmin(auth.uid()));

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
on public.profiles for update
using (auth.uid() = id or public.is_superadmin(auth.uid()))
with check (auth.uid() = id or public.is_superadmin(auth.uid()));

-- books
drop policy if exists "books public read active" on public.books;
create policy "books public read active"
on public.books for select
using (is_active = true or public.is_superadmin(auth.uid()));

drop policy if exists "books admin write" on public.books;
create policy "books admin write"
on public.books for all
using (public.is_superadmin(auth.uid()))
with check (public.is_superadmin(auth.uid()));

-- orders
drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read"
on public.orders for select
using (auth.uid() = user_id or public.is_superadmin(auth.uid()));

drop policy if exists "orders owner insert" on public.orders;
create policy "orders owner insert"
on public.orders for insert
with check (auth.uid() = user_id or public.is_superadmin(auth.uid()));

-- order items
drop policy if exists "order items owner read" on public.order_items;
create policy "order items owner read"
on public.order_items for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_superadmin(auth.uid()))
  )
);

-- library
drop policy if exists "library owner read" on public.library;
create policy "library owner read"
on public.library for select
using (auth.uid() = user_id or public.is_superadmin(auth.uid()));

drop policy if exists "library owner insert" on public.library;
create policy "library owner insert"
on public.library for insert
with check (auth.uid() = user_id or public.is_superadmin(auth.uid()));

-- book views
drop policy if exists "book views insert" on public.book_views;
create policy "book views insert"
on public.book_views for insert
with check (true);

drop policy if exists "book views admin read" on public.book_views;
create policy "book views admin read"
on public.book_views for select
using (public.is_superadmin(auth.uid()));

-- system bootstrap only superadmin
drop policy if exists "system bootstrap admin read" on public.system_bootstrap;
create policy "system bootstrap admin read"
on public.system_bootstrap for select
using (public.is_superadmin(auth.uid()));
