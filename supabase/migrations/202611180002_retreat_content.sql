begin;
create table if not exists public.retreat_page_content (
 id text primary key check (id='mountain-2027'),
 texts jsonb not null default '{}'::jsonb,
 revision integer not null default 0,
 updated_at timestamptz not null default now()
);
alter table public.retreat_page_content enable row level security;
revoke all on public.retreat_page_content from public, anon, authenticated;
grant select,insert,update on public.retreat_page_content to service_role;
insert into public.retreat_page_content(id) values('mountain-2027') on conflict(id) do nothing;
commit;
