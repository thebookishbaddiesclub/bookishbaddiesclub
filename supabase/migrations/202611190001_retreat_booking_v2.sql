begin;
-- Separate inventory: old demonstration bookings keep their original room numbers.
create table if not exists public.retreat_v2_groups (
 token uuid primary key default gen_random_uuid(), request_id uuid not null unique,
 created_at timestamptz not null default now(), expires_at timestamptz not null
);
create table if not exists public.retreat_v2_places (
 id uuid primary key default gen_random_uuid(),
 group_token uuid references public.retreat_v2_groups(token),
 seat text not null,
 occupied text[] not null,
 state text not null check(state in ('held','paid','released','cancelled','blocked')),
 guest jsonb, payment_key uuid unique, cents integer,
 tariff text check(tariff in ('early','classic','private')),
 split boolean, confirmed_at timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.retreat_v2_audit (
 id bigint generated always as identity primary key,
 place_id uuid, action text not null, created_at timestamptz not null default now()
);
alter table public.retreat_v2_groups enable row level security;
alter table public.retreat_v2_places enable row level security;
alter table public.retreat_v2_audit enable row level security;
revoke all on public.retreat_v2_groups, public.retreat_v2_places, public.retreat_v2_audit from public,anon,authenticated;
-- Writes are only available through the serialized function, including administration.
revoke all on public.retreat_v2_groups, public.retreat_v2_places, public.retreat_v2_audit from service_role;
create or replace function public.retreat_v2_action(
 p_action text,p_token uuid default null,p_request uuid default null,p_seats text[] default null,
 p_seat text default null,p_guest jsonb default null,p_cents integer default null,p_split boolean default false
) returns jsonb language plpgsql security definer set search_path=public as $$
declare
 g retreat_v2_groups; r retreat_v2_places; v_now timestamptz; v_price integer; v_tariff text;
 v_early integer; v_occupied text[]; v_selected text[]; v_item text; v_id uuid;
 valid_seats constant text[] := array['2-0-0','2-0-1','2-1-0','3-0-0','3-0-1','4-0-0','4-1-0','4-2-0','4-2-1','5-0-0','5-0-1','5-1-0','3-private'];
begin
 perform pg_advisory_xact_lock(2027111901);
 v_now := clock_timestamp();
 update retreat_v2_places s set state='released',updated_at=v_now from retreat_v2_groups x
 where s.group_token=x.token and s.state='held' and x.expires_at<=v_now;
 select greatest(0,4-count(*))::integer into v_early from retreat_v2_places where tariff='early' and confirmed_at is not null;

 if p_action in ('inventory','admin_list') then
   return jsonb_build_object('now',v_now,'earlyRemaining',v_early,'cents',case when v_early>0 then 19900 else 21500 end,
    'unavailable',coalesce((select jsonb_agg(distinct slot) from retreat_v2_places s cross join lateral unnest(s.occupied) slot where state in ('held','paid','blocked')),'[]'::jsonb),
    'occupants',coalesce((select jsonb_agg(jsonb_build_object('seats',occupied,'name',(guest->>'first')||' '||left(guest->>'last',1)||'.','city',guest->>'city')) from retreat_v2_places where state='paid' and guest->>'visible'='true'),'[]'::jsonb),
    'reservations',case when p_action='admin_list' then coalesce((select jsonb_agg(to_jsonb(s) order by updated_at desc) from retreat_v2_places s),'[]'::jsonb) else null end);
 end if;
 if p_action in ('admin_cancel','admin_release','admin_move') then
   select * into r from retreat_v2_places where id=p_request;
   if not found then raise exception 'NOT_FOUND'; end if;
   if p_action='admin_cancel' then
     if r.state not in ('paid','held') then raise exception 'UNAVAILABLE'; end if;
     update retreat_v2_places set state=case when state='paid' then 'cancelled' else 'released' end,updated_at=v_now where id=r.id;
     -- Cancel pending invitations too; other paid participants keep their places.
     update retreat_v2_places set state='released',updated_at=v_now where group_token=r.group_token and state='held';
   elsif p_action='admin_release' then
     if r.state<>'blocked' then raise exception 'INVALID'; end if;
     update retreat_v2_places set state='released',updated_at=v_now where id=r.id;
   else
     if r.state<>'paid' or p_seat is null or not(p_seat=any(valid_seats)) or (r.tariff='private')<>(p_seat='3-private') then raise exception 'INVALID'; end if;
     v_occupied:=case when p_seat='3-private' then array['3-0-0','3-0-1'] else array[p_seat] end;
     if exists(select 1 from retreat_v2_places where id<>r.id and state in ('paid','held','blocked') and occupied&&v_occupied) then raise exception 'UNAVAILABLE'; end if;
     update retreat_v2_places set seat=p_seat,occupied=v_occupied,updated_at=v_now where id=r.id;
   end if;
   insert into retreat_v2_audit(place_id,action) values(r.id,p_action);
   return jsonb_build_object('ok',true);
 elsif p_action='admin_block' then
   if p_seat is null or not(p_seat=any(valid_seats)) then raise exception 'INVALID'; end if;
   v_occupied:=case when p_seat='3-private' then array['3-0-0','3-0-1'] else array[p_seat] end;
   if exists(select 1 from retreat_v2_places where state in ('paid','held','blocked') and occupied&&v_occupied) then raise exception 'UNAVAILABLE'; end if;
   insert into retreat_v2_places(seat,occupied,state) values(p_seat,v_occupied,'blocked') returning id into v_id;
   insert into retreat_v2_audit(place_id,action) values(v_id,p_action);
   return jsonb_build_object('ok',true);
 end if;

 if p_action in ('start','claim') then
   if p_request is null or p_seat is null or not(p_seat=any(valid_seats)) or p_guest is null
     or coalesce(p_guest->>'first','')='' or coalesce(p_guest->>'last','')='' or coalesce(p_guest->>'email','')='' then raise exception 'INVALID'; end if;
   -- Only a successful confirmation allocates an Early tariff. Held seats do not.
   v_price:=case when p_seat='3-private' then 31500 when v_early>0 then 19900 else 21500 end;
   v_tariff:=case when p_seat='3-private' then 'private' when v_early>0 then 'early' else 'classic' end;
   if p_split and (v_now at time zone 'Europe/Paris')::date > date '2027-01-30' then raise exception 'SPLIT_CLOSED'; end if;
 end if;
 if p_action='start' then
   select * into g from retreat_v2_groups where request_id=p_request;
   if found then
     if exists(select 1 from retreat_v2_places where group_token=g.token and payment_key=p_request and state='cancelled') then raise exception 'CANCELLED'; end if;
     if not exists(select 1 from retreat_v2_places where group_token=g.token and seat=p_seat and payment_key=p_request) then raise exception 'INVALID'; end if;
   else
     if p_seats is null or cardinality(p_seats)<1 or cardinality(p_seats)>12 or not(p_seat=any(p_seats))
       or not(p_seats<@valid_seats) or array_position(p_seats,null) is not null
       or (select count(distinct x) from unnest(p_seats) x)<>cardinality(p_seats)
       or ('3-private'=any(p_seats) and p_seat<>'3-private') then raise exception 'INVALID'; end if;
     select array_agg(x) into v_selected from unnest(p_seats) s cross join lateral unnest(case when s='3-private' then array['3-0-0','3-0-1'] else array[s] end) x;
     if (select count(distinct x) from unnest(v_selected) x)<>cardinality(v_selected) then raise exception 'INVALID'; end if;
     if exists(select 1 from retreat_v2_places where state in ('paid','held','blocked') and occupied&&v_selected) then raise exception 'UNAVAILABLE'; end if;
     if p_cents is distinct from v_price then raise exception 'PRICE_CHANGED'; end if;
     insert into retreat_v2_groups(request_id,created_at,expires_at) values(p_request,v_now,v_now+interval '1 hour') returning * into g;
     foreach v_item in array p_seats loop
       insert into retreat_v2_places(group_token,seat,occupied,state)
       values(g.token,v_item,case when v_item='3-private' then array['3-0-0','3-0-1'] else array[v_item] end,'held');
     end loop;
     update retreat_v2_places set state='paid',guest=p_guest,payment_key=p_request,cents=v_price,tariff=v_tariff,split=p_split,confirmed_at=v_now
     where group_token=g.token and seat=p_seat;
   end if;
 elsif p_action in ('status','claim') then
   select * into g from retreat_v2_groups where token=p_token;
   if not found then raise exception 'NOT_FOUND'; end if;
   if p_action='claim' and exists(select 1 from retreat_v2_places where group_token=g.token and payment_key=p_request and state='cancelled') then raise exception 'CANCELLED'; end if;
   if p_action='claim' and not exists(select 1 from retreat_v2_places where group_token=g.token and seat=p_seat and payment_key=p_request and confirmed_at is not null) then
     if g.expires_at<=v_now then raise exception 'EXPIRED'; end if;
     if p_cents is distinct from v_price then raise exception 'PRICE_CHANGED'; end if;
     update retreat_v2_places set state='paid',guest=p_guest,payment_key=p_request,cents=v_price,tariff=v_tariff,split=p_split,confirmed_at=v_now,updated_at=v_now
       where group_token=g.token and seat=p_seat and state='held';
     if not found then raise exception 'UNAVAILABLE'; end if;
   end if;
 else raise exception 'INVALID'; end if;
 return jsonb_build_object('token',g.token,'now',v_now,'expiresAt',g.expires_at,'places',
  (select jsonb_agg(jsonb_build_object('id',seat,'state',state,'cents',cents,'split',split,'tariff',tariff,'name',case when state='paid' and guest->>'visible'='true' then (guest->>'first')||' '||left(guest->>'last',1)||'.' else null end) order by seat) from retreat_v2_places where group_token=g.token));
end $$;
revoke all on function public.retreat_v2_action(text,uuid,uuid,text[],text,jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.retreat_v2_action(text,uuid,uuid,text[],text,jsonb,integer,boolean) to service_role;
-- Update tariff fields only, preserving all other edited presentation copy.
do $body$
begin
 if to_regclass('public.retreat_page_content') is not null then
  update public.retreat_page_content set texts=texts || '{"text-033": "À partir de 199 €", "text-082": "EARLY BADDIES", "text-083": "199 €", "text-084": "par participante · les 4 premières places confirmées", "text-085": "CLASSIQUE", "text-086": "215 €", "text-087": "par participante · chambre 3 privatisée pour une personne : 315 €, sans tarif Early"}'::jsonb,revision=revision+1,updated_at=now() where id='mountain-2027';
 end if;
end $body$;
commit;
