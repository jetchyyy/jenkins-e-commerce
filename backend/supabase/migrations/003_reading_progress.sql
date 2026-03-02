create table if not exists public.reading_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  last_page integer not null default 1 check (last_page >= 1),
  total_pages integer not null default 1 check (total_pages >= 1),
  bookmarks integer[] not null default '{}',
  zoom numeric(4,2) not null default 1.00 check (zoom >= 0.5 and zoom <= 4.0),
  theme text not null default 'paper' check (theme in ('paper', 'sepia', 'night')),
  renderer text not null default 'canvas' check (renderer in ('canvas', 'native')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

create index if not exists idx_reading_progress_user_updated_at
  on public.reading_progress (user_id, updated_at desc);

create index if not exists idx_reading_progress_book
  on public.reading_progress (book_id);

drop trigger if exists trg_reading_progress_updated_at on public.reading_progress;
create trigger trg_reading_progress_updated_at
before update on public.reading_progress
for each row
execute function public.set_timestamp();
