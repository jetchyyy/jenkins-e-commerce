insert into public.books (title, author, description, price_cents, currency, cover_url, format, is_active)
values
  ('The Pragmatic API', 'K. Caquilala', 'Design stable backend contracts that scale.', 49900, 'PHP', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600', 'pdf', true),
  ('TypeScript at Scale', 'A. Rivera', 'Patterns for resilient TypeScript services.', 59900, 'PHP', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600', 'epub', true),
  ('Ship It Fast', 'D. Santos', 'A practical guide to startup engineering execution.', 39900, 'PHP', 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600', 'pdf', true)
on conflict do nothing;
