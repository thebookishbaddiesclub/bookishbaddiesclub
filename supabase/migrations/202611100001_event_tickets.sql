begin;
alter table public.events add column if not exists ticketing jsonb;
create table if not exists public.event_bookings (
 session_id text primary key, event_id uuid not null references public.events(id) on delete restrict,
 seats integer not null check (seats > 0), cents integer not null, offer text not null, title text not null,
 phone text not null, guests jsonb not null, questions jsonb not null,
 state text not null default 'pending' check (state in ('pending','paid')),
 email text, emailed boolean not null default false
);
alter table public.event_bookings enable row level security;
revoke all on public.event_bookings from public, anon, authenticated;
grant select,insert,update,delete on public.event_bookings to service_role;
create index if not exists event_bookings_event_idx on public.event_bookings(event_id);
create or replace function public.reserve_event_ticket(p_session text, p_event uuid, p_config jsonb, p_offer int, p_phone text, p_guests jsonb)
returns void language plpgsql set search_path = public as $$
declare e public.events; o jsonb; used int;
begin
 select * into e from events where id=p_event for update;
 if not found or e.starts_at <= now() or e.ticketing is null or e.ticketing <> p_config then raise exception 'EVENT_CHANGED'; end if;
 o := e.ticketing->'offers'->p_offer;
 select coalesce(sum(seats),0) into used from event_bookings where event_id=p_event;
 if used + (o->>'seats')::int > (e.ticketing->>'capacity')::int then raise exception 'SOLD_OUT'; end if;
 insert into event_bookings(session_id,event_id,seats,cents,offer,title,phone,guests,questions)
 values(p_session,p_event,(o->>'seats')::int,(o->>'cents')::int,o->>'name',e.title,p_phone,p_guests,e.ticketing->'questions');
end $$;
revoke all on function public.reserve_event_ticket(text,uuid,jsonb,int,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_event_ticket(text,uuid,jsonb,int,text,jsonb) to service_role;
commit;
