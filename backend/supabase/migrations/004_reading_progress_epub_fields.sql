alter table public.reading_progress
  add column if not exists last_location text,
  add column if not exists bookmarks_cfi text[] not null default '{}';
