begin;
create table if not exists public.retreat_payment_orders(
 id uuid primary key, place_id uuid not null references public.retreat_v2_places(id), group_token uuid not null references public.retreat_v2_groups(token),
 leader boolean not null, cents integer not null check(cents in (19900,21500,31500)), split boolean not null,
 state text not null default 'pending' check(state in ('pending','paid','expired')),
 session_id text unique, customer_id text, payment_method_id text,
 created_at timestamptz not null default now(), expires_at timestamptz not null,
 consent_version text not null, consent_text text not null, consent_at timestamptz not null default now(),
 email_sent boolean not null default false
);
create table if not exists public.retreat_payment_steps(
 order_id uuid not null references public.retreat_payment_orders(id), number integer not null check(number between 1 and 3),
 cents integer not null check(cents>0), due_at timestamptz not null,
 invoice_id text unique, status text not null default 'pending',
 hosted_url text, error text, email_status text,
 primary key(order_id,number)
);
alter table public.retreat_payment_orders enable row level security;
alter table public.retreat_payment_steps enable row level security;
revoke all on public.retreat_payment_orders,public.retreat_payment_steps from public,anon,authenticated;
grant select on public.retreat_v2_places to service_role;
grant select,update on public.retreat_payment_orders,public.retreat_payment_steps to service_role;
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
 where s.group_token=x.token and s.state='held' and x.expires_at<=v_now and not exists(select 1 from retreat_payment_orders o where o.place_id=s.id and o.state='pending');
 select greatest(0,4-count(*))::integer into v_early from retreat_v2_places where tariff='early' and confirmed_at is not null;

 if p_action in ('inventory','admin_list') then
   return jsonb_build_object('now',v_now,'earlyRemaining',v_early,'cents',case when v_early>0 then 19900 else 21500 end,
    'unavailable',coalesce((select jsonb_agg(distinct slot) from retreat_v2_places s cross join lateral unnest(s.occupied) slot where state in ('held','paid','blocked')),'[]'::jsonb),
    'occupants',coalesce((select jsonb_agg(jsonb_build_object('seats',occupied,'name',(guest->>'first')||' '||left(guest->>'last',1)||'.','city',guest->>'city')) from retreat_v2_places where state='paid' and guest->>'visible'='true'),'[]'::jsonb),
    'reservations',case when p_action='admin_list' then coalesce((select jsonb_agg(to_jsonb(s) order by updated_at desc) from retreat_v2_places s),'[]'::jsonb) else null end);
 end if;
 if p_action in ('admin_cancel','admin_release','admin_move') then
   if exists(select 1 from retreat_payment_orders where place_id=p_request and state in ('pending','paid')) then raise exception 'STRIPE_MANAGED'; end if;
   select * into r from retreat_v2_places where id=p_request;
   if not found then raise exception 'NOT_FOUND'; end if;
   if p_action='admin_cancel' then
     if r.state not in ('paid','held') then raise exception 'UNAVAILABLE'; end if;
     update retreat_v2_places set state=case when state='paid' then 'cancelled' else 'released' end,updated_at=v_now where id=r.id;
     -- Cancel pending invitations too; other paid participants keep their places.
     update retreat_v2_places set state='released',updated_at=v_now where group_token=r.group_token and state='held' and not exists(select 1 from retreat_payment_orders o where o.place_id=retreat_v2_places.id and o.state='pending');
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
   if p_seat<>'3-private' and v_early>0 and
     (select count(*) from retreat_payment_orders where state='pending' and cents=19900)>=v_early then raise exception 'EARLY_BUSY'; end if;
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

create or replace function public.retreat_payment_prepare(p_id uuid,p_token uuid,p_seats text[],p_seat text,p_guest jsonb,p_cents integer,p_split boolean,p_steps jsonb,p_consent text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o retreat_payment_orders; v_result jsonb; v_group uuid; v_place retreat_v2_places; v_step jsonb;
begin
 perform pg_advisory_xact_lock(2027111901);
 select * into o from retreat_payment_orders where id=p_id;
 if found then
   select * into v_place from retreat_v2_places where id=o.place_id;
   if v_place.seat<>p_seat or o.cents<>p_cents or o.split<>p_split or v_place.guest is distinct from p_guest or p_consent is distinct from o.consent_text or (p_token is null)<>o.leader or (not o.leader and p_token is distinct from o.group_token) then raise exception 'REQUEST_CHANGED'; end if;
   if o.leader and (
     (select array_agg(x order by x) from unnest(p_seats) x) is distinct from
     (select array_agg(seat order by seat) from retreat_v2_places where group_token=o.group_token)
   ) then raise exception 'REQUEST_CHANGED'; end if;
   return to_jsonb(o);
 end if;
 if p_steps is null or jsonb_array_length(p_steps)<>(case when p_split then 3 else 1 end)
 or (select sum((s->>'cents')::integer) from jsonb_array_elements(p_steps) s)<>p_cents then raise exception 'INVALID_PLAN'; end if;
 v_result:=retreat_v2_action(case when p_token is null then 'start' else 'claim' end,p_token,p_id,p_seats,p_seat,p_guest,p_cents,p_split);
 v_group:=(v_result->>'token')::uuid;
 select * into v_place from retreat_v2_places where group_token=v_group and seat=p_seat;
 -- Reserve, but do not confirm or consume Early until Stripe's verified payment.
 update retreat_v2_places set state='held',confirmed_at=null where id=v_place.id;
 if p_token is null then update retreat_v2_groups set expires_at='infinity' where token=v_group; end if;
 insert into retreat_payment_orders(id,place_id,group_token,leader,cents,split,expires_at,consent_version,consent_text)
 values(p_id,v_place.id,v_group,p_token is null,p_cents,p_split,now()+interval '35 minutes','automatic-card-v1',p_consent) returning * into o;
 for v_step in select * from jsonb_array_elements(p_steps) loop
  insert into retreat_payment_steps(order_id,number,cents,due_at) values(p_id,(v_step->>'number')::integer,(v_step->>'cents')::integer,(v_step->>'dueAt')::timestamptz);
 end loop;
 return to_jsonb(o);
end $$;
create or replace function public.retreat_payment_finish(p_id uuid,p_session text,p_paid boolean,p_amount integer,p_currency text,p_customer text,p_method text,p_paid_at timestamptz)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o retreat_payment_orders; v_first integer;
begin
 perform pg_advisory_xact_lock(2027111901);
 select * into o from retreat_payment_orders where id=p_id for update;
 if not found or o.session_id is distinct from p_session then raise exception 'NOT_FOUND'; end if;
 if p_paid then
   select cents into v_first from retreat_payment_steps where order_id=o.id and number=1;
   if p_amount is distinct from v_first or p_currency is distinct from 'eur' or p_customer is distinct from o.customer_id
   or (o.split and p_method is null) then raise exception 'PAYMENT_MISMATCH'; end if;
   if o.state='expired' then raise exception 'REVIEW_REQUIRED'; end if;
   if o.state='pending' then
     update retreat_payment_orders set state='paid',payment_method_id=p_method where id=o.id;
     update retreat_v2_places set state='paid',confirmed_at=p_paid_at,updated_at=now() where id=o.place_id;
     update retreat_payment_steps set status='paid' where order_id=o.id and number=1;
     if o.leader then update retreat_v2_groups set expires_at=p_paid_at+interval '1 hour' where token=o.group_token; end if;
   end if;
 elsif o.state='pending' then
   update retreat_payment_orders set state='expired' where id=o.id;
   update retreat_payment_steps set status='cancelled' where order_id=o.id and status<>'paid';
   update retreat_v2_places set state='released',updated_at=now() where id=o.place_id;
   if o.leader then
     update retreat_v2_groups set expires_at=now() where token=o.group_token;
     update retreat_v2_places set state='released',updated_at=now() where group_token=o.group_token and state='held';
   end if;
 end if;
 select * into o from retreat_payment_orders where id=p_id;
 return to_jsonb(o);
end $$;
revoke all on function public.retreat_payment_prepare(uuid,uuid,text[],text,jsonb,integer,boolean,jsonb,text) from public,anon,authenticated;
revoke all on function public.retreat_payment_finish(uuid,text,boolean,integer,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.retreat_payment_prepare(uuid,uuid,text[],text,jsonb,integer,boolean,jsonb,text) to service_role;
grant execute on function public.retreat_payment_finish(uuid,text,boolean,integer,text,text,text,timestamptz) to service_role;
commit;
