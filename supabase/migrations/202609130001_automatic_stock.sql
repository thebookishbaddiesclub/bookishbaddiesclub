-- Apply to an isolated Supabase TEST project first. Never resets existing stock.
-- Product IDs are compared as text to support existing UUID or numeric IDs.
begin;

alter table public.products add constraint products_stock_nonnegative_integer
  check (stock is not null and stock >= 0 and stock = trunc(stock));

create table public.stock_orders (
  session_id text primary key,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  amount_total bigint not null check (amount_total >= 0),
  currency text not null default 'eur' check (currency = 'eur'),
  status text not null default 'reserved' check (status in ('reserved', 'paid', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  event_id text
);
alter table public.stock_orders enable row level security;
revoke all on public.stock_orders from public, anon, authenticated;
grant select, insert, update on public.stock_orders to service_role;
create index stock_orders_reserved on public.stock_orders (expires_at) where status = 'reserved';

create function public.stock_reserved(p_product_id text) returns bigint
language sql stable security definer set search_path = '' as $$
  select coalesce(sum((item->>'quantity')::bigint), 0)::bigint
  from public.stock_orders o cross join lateral jsonb_array_elements(o.items) item
  where o.status = 'reserved' and item->>'id' = p_product_id;
$$;

-- Called only by the server. A single snapshot provides catalog + availability.
create function public.stock_catalog() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(p) || jsonb_build_object(
    'stock', greatest(0, p.stock - public.stock_reserved(p.id::text))) order by p.created_at), '[]'::jsonb)
  from public.products p;
$$;

create function public.reserve_stock(p_session_id text, p_items jsonb, p_expires_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare
  item jsonb;
  product public.products%rowtype;
  total bigint := 0;
begin
  if p_session_id is null or p_session_id = '' or p_expires_at <= now()
    or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'INVALID_CART';
  end if;
  if jsonb_array_length(p_items) not between 1 and 100 then raise exception 'INVALID_CART'; end if;
  if (select count(distinct value->>'id') from jsonb_array_elements(p_items)) <> jsonb_array_length(p_items)
    then raise exception 'INVALID_CART'; end if;

  -- Stable lock order prevents deadlocks for carts containing several products.
  for item in select value from jsonb_array_elements(p_items) order by value->>'id' loop
    if item->>'id' is null or (item->>'quantity') !~ '^[1-9][0-9]*$'
      or (item->>'quantity') is null or (item->>'quantity')::numeric > 999
      or (item->>'unit_amount') is null or (item->>'unit_amount') !~ '^[0-9]+$' then
      raise exception 'INVALID_CART';
    end if;
    select * into product from public.products where id::text = item->>'id' for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
    if product.price is null or product.price < 0 or round(product.price::numeric * 100) <> (item->>'unit_amount')::bigint
      then raise exception 'PRICE_CHANGED'; end if;
    if product.stock - public.stock_reserved(product.id::text) < (item->>'quantity')::integer
      then raise exception 'INSUFFICIENT_STOCK'; end if;
    total := total + (item->>'unit_amount')::bigint * (item->>'quantity')::integer;
  end loop;
  insert into public.stock_orders(session_id, items, amount_total, expires_at)
    values (p_session_id, p_items, total, p_expires_at);
end;
$$;

create function public.settle_stock(p_session_id text, p_event_id text, p_amount_total bigint, p_currency text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  purchase public.stock_orders%rowtype;
  item jsonb;
begin
  select * into purchase from public.stock_orders where session_id = p_session_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if p_amount_total is distinct from purchase.amount_total or p_currency is distinct from purchase.currency
    then raise exception 'PAYMENT_MISMATCH'; end if;
  if purchase.status = 'paid' then return 'already_paid'; end if;
  if purchase.status <> 'reserved' then raise exception 'ORDER_NOT_RESERVED'; end if;
  -- All changes below roll back together on any error, including the paid marker.
  update public.stock_orders set status = 'paid', paid_at = now(), event_id = p_event_id
    where session_id = p_session_id;
  for item in select value from jsonb_array_elements(purchase.items) order by value->>'id' loop
    update public.products set stock = stock - (item->>'quantity')::integer
      where id::text = item->>'id' and stock >= (item->>'quantity')::integer;
    if not found then raise exception 'STOCK_CONFLICT'; end if;
  end loop;
  return 'paid';
end;
$$;

-- Only call after Stripe definitively reports expiration. Never release by clock alone:
-- a paid session may be awaiting delivery of its success webhook.
create function public.expire_stock(p_session_id text) returns void
language sql security definer set search_path = '' as $$
  update public.stock_orders set status = 'expired' where session_id = p_session_id and status = 'reserved';
$$;

create function public.guard_reserved_stock() returns trigger
language plpgsql security definer set search_path = '' as $$
declare reserved bigint;
begin
  reserved := public.stock_reserved(old.id::text);
  if tg_op = 'DELETE' then
    if reserved > 0 then raise exception 'PRODUCT_RESERVED'; end if;
    return old;
  end if;
  if new.id is distinct from old.id then raise exception 'PRODUCT_ID_IMMUTABLE'; end if;
  if new.stock < reserved then raise exception 'PRODUCT_RESERVED'; end if;
  return new;
end;
$$;
create trigger products_guard_reservations before update or delete on public.products
  for each row execute function public.guard_reserved_stock();

revoke all on function public.stock_reserved(text), public.stock_catalog(),
  public.reserve_stock(text, jsonb, timestamptz), public.settle_stock(text, text, bigint, text),
  public.expire_stock(text), public.guard_reserved_stock() from public, anon, authenticated;
grant execute on function public.stock_catalog(), public.reserve_stock(text, jsonb, timestamptz),
  public.settle_stock(text, text, bigint, text), public.expire_stock(text) to service_role;
commit;
