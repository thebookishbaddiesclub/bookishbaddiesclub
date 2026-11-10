begin;
create table if not exists public.event_passes (
 id uuid primary key default gen_random_uuid(),
 first_id uuid not null references public.events(id) on delete cascade,
 second_id uuid not null references public.events(id) on delete cascade,
 cents integer not null check(cents >= 50),
 check(first_id < second_id), unique(first_id,second_id)
);
alter table public.event_passes enable row level security;
revoke all on public.event_passes from public,anon,authenticated;
grant select on public.event_passes to anon,authenticated;
grant all on public.event_passes to service_role;
drop policy if exists event_pass_read on public.event_passes;
create policy event_pass_read on public.event_passes for select using(true);
alter table public.event_bookings add column if not exists second_event_id uuid references public.events(id) on delete restrict;
create index if not exists event_bookings_second_idx on public.event_bookings(second_event_id);
create or replace function public.reserve_event_ticket(p_session text, p_event uuid, p_config jsonb, p_offer int, p_phone text, p_guests jsonb)
returns void language plpgsql set search_path = public as $$
declare e public.events; o jsonb; used int;
begin
 select * into e from events where id=p_event for update;
 if not found or e.starts_at <= now() or e.ticketing is null or e.ticketing <> p_config then raise exception 'EVENT_CHANGED'; end if;
 o := e.ticketing->'offers'->p_offer;
 select coalesce(sum(seats),0) into used from event_bookings where event_id=p_event or second_event_id=p_event;
 if used + (o->>'seats')::int > (e.ticketing->>'capacity')::int then raise exception 'SOLD_OUT'; end if;
 insert into event_bookings(session_id,event_id,seats,cents,offer,title,phone,guests,questions)
 values(p_session,p_event,(o->>'seats')::int,(o->>'cents')::int,o->>'name',e.title,p_phone,p_guests,e.ticketing->'questions');
end $$;
revoke all on function public.reserve_event_ticket(text,uuid,jsonb,int,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_event_ticket(text,uuid,jsonb,int,text,jsonb) to service_role;

create or replace function public.reserve_event_pass(
 p_session text,p_pass uuid,p_first_config jsonb,p_second_config jsonb,p_cents int,
 p_questions jsonb,p_phone text,p_guests jsonb
) returns void language plpgsql set search_path = public as $$
declare deal event_passes; ev events; used int; count_events int:=0; titles text[]:='{}';
begin
 select * into deal from event_passes where id=p_pass for share;
 if not found or deal.cents<>p_cents then raise exception 'PASS_CHANGED'; end if;
 -- Singles and passes take the same event locks, in a stable order.
 for ev in select * from events where id in (deal.first_id,deal.second_id) order by id for update loop
   if ev.starts_at<=now() or ev.ticketing is null or ev.ticketing is distinct from
      (case when ev.id=deal.first_id then p_first_config else p_second_config end)
   then raise exception 'EVENT_CHANGED'; end if;
   select coalesce(sum(seats),0) into used from event_bookings where event_id=ev.id or second_event_id=ev.id;
   if used+1 > (ev.ticketing->>'capacity')::int then raise exception 'SOLD_OUT'; end if;
   titles:=array_append(titles,ev.title);count_events:=count_events+1;
 end loop;
 if count_events<>2 then raise exception 'EVENT_CHANGED'; end if;
 insert into event_bookings(session_id,event_id,second_event_id,seats,cents,offer,title,phone,guests,questions)
 values(p_session,deal.first_id,deal.second_id,1,deal.cents,'Pass 2 événements',array_to_string(titles,' + '),p_phone,p_guests,p_questions);
end $$;
revoke all on function public.reserve_event_pass(text,uuid,jsonb,jsonb,int,jsonb,text,jsonb) from public,anon,authenticated;
grant execute on function public.reserve_event_pass(text,uuid,jsonb,jsonb,int,jsonb,text,jsonb) to service_role;
commit;
