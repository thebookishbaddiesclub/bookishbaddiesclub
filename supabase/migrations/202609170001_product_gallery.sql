begin;
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists coming_soon boolean not null default false;
commit;
