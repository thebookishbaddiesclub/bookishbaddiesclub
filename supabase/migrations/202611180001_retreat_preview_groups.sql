begin;
-- Isolated demonstration data. Never used for live payments or live inventory.
create table if not exists public.retreat_preview_groups (
 token uuid primary key default gen_random_uuid(), request_id uuid not null unique,
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '1 hour')
);
create table if not exists public.retreat_preview_places (
 group_token uuid not null references public.retreat_preview_groups(token) on delete cascade,
 seat text not null, state text not null check(state in ('held','paid','released')),
 guest jsonb, payment_key uuid, cents integer, split boolean,
 primary key(group_token,seat), unique(payment_key)
);
alter table public.retreat_preview_groups enable row level security;
alter table public.retreat_preview_places enable row level security;
revoke all on public.retreat_preview_groups,public.retreat_preview_places from public,anon,authenticated;
grant all on public.retreat_preview_groups,public.retreat_preview_places to service_role;
create or replace function public.retreat_preview_action(p_action text,p_token uuid default null,p_request uuid default null,p_seats text[] default null,p_seat text default null,p_guest jsonb default null,p_cents integer default null,p_split boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare g public.retreat_preview_groups; v_now timestamptz; v_token uuid;
begin
 -- All operations touching this small demo inventory serialize, including expiry.
 perform pg_advisory_xact_lock(2027111801);
 v_now:=clock_timestamp();
 update retreat_preview_places s set state='released' from retreat_preview_groups x
 where s.group_token=x.token and s.state='held' and x.expires_at<=v_now;
 if p_action='inventory' then
   return jsonb_build_object('now',v_now,'unavailable',coalesce((select jsonb_agg(seat) from retreat_preview_places where state in ('paid','held')),'[]'::jsonb));
 end if;
 if p_action='start' then
   select * into g from retreat_preview_groups where request_id=p_request;
   if not found then
     if p_request is null or p_seats is null or cardinality(p_seats)<1 or cardinality(p_seats)>12 or not(p_seat=any(p_seats))
       or (select count(distinct x) from unnest(p_seats) x)<>cardinality(p_seats) then raise exception 'INVALID'; end if;
     if exists(select 1 from retreat_preview_places where seat=any(p_seats) and state in ('paid','held')) then raise exception 'UNAVAILABLE'; end if;
     insert into retreat_preview_groups(request_id,created_at,expires_at) values(p_request,v_now,v_now+interval '1 hour') returning * into g;
     insert into retreat_preview_places(group_token,seat,state) select g.token,x,'held' from unnest(p_seats) x;
     update retreat_preview_places set state='paid',guest=p_guest,payment_key=p_request,cents=p_cents,split=p_split where group_token=g.token and seat=p_seat;
   end if;
 elsif p_action in ('status','claim') then
   select * into g from retreat_preview_groups where token=p_token;
   if not found then raise exception 'NOT_FOUND'; end if;
   if p_action='claim' then
     -- A retry of a confirmed payment never starts a new countdown or pays twice.
     if not exists(select 1 from retreat_preview_places where group_token=g.token and seat=p_seat and state='paid' and payment_key=p_request) then
       if g.expires_at<=v_now then raise exception 'EXPIRED'; end if;
       update retreat_preview_places set state='paid',guest=p_guest,payment_key=p_request,cents=p_cents,split=p_split
         where group_token=g.token and seat=p_seat and state='held';
       if not found then raise exception 'UNAVAILABLE'; end if;
     end if;
   end if;
 else raise exception 'INVALID'; end if;
 return jsonb_build_object('token',g.token,'now',v_now,'expiresAt',g.expires_at,'places',
   (select jsonb_agg(jsonb_build_object('id',seat,'state',state,'name',case when state='paid' and guest->>'visible'='true' then (guest->>'first')||' '||left(guest->>'last',1)||'.' else null end) order by seat) from retreat_preview_places where group_token=g.token));
end $$;
revoke all on function public.retreat_preview_action(text,uuid,uuid,text[],text,jsonb,integer,boolean) from public,anon,authenticated;
grant execute on function public.retreat_preview_action(text,uuid,uuid,text[],text,jsonb,integer,boolean) to service_role;
commit;
