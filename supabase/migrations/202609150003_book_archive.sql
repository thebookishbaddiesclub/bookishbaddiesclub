begin;
alter table public.books add column if not exists archived boolean not null default false;
alter table public.books add column if not exists rating numeric(2,1) check (rating between 0 and 5);
alter table public.books add column if not exists review text;
commit;
