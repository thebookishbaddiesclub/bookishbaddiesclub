begin;
create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(), title text not null, author text not null,
  cover_url text, city text not null, month text not null, rating numeric(2,1) check (rating between 0 and 5), review text,
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(), title text not null, image_url text, starts_at timestamptz not null,
  city text not null, summary text, action_label text not null default 'En savoir plus', action_url text,
  created_at timestamptz not null default now()
);
alter table public.reading_history enable row level security;
alter table public.events enable row level security;
drop policy if exists reading_history_public on public.reading_history;
drop policy if exists events_public on public.events;
create policy reading_history_public on public.reading_history for select to anon, authenticated using (true);
create policy events_public on public.events for select to anon, authenticated using (true);
commit;
