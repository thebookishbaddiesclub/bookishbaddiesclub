begin;
alter table public.events add column if not exists category text not null default 'bookevents';
alter table public.events drop constraint if exists events_category_check;
alter table public.events add constraint events_category_check check (category in ('bookevents', 'twitch'));
commit;
