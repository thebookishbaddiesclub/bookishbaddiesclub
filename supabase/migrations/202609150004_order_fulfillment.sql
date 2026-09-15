begin;
alter table public.stock_orders add column if not exists customer_email text;
alter table public.stock_orders add column if not exists customer_name text;
alter table public.stock_orders add column if not exists fulfillment_status text not null default 'received' check (fulfillment_status in ('received','ready_for_pickup','handed_over','cancelled'));
alter table public.stock_orders add column if not exists fulfillment_note text;
alter table public.stock_orders add column if not exists updated_at timestamptz not null default now();
create or replace function public.update_order_contact(p_session_id text, p_email text, p_name text)
returns void language sql security definer set search_path = '' as $$
  update public.stock_orders set customer_email = nullif(p_email, ''), customer_name = nullif(p_name, ''), updated_at = now()
  where session_id = p_session_id;
$$;
revoke all on function public.update_order_contact(text, text, text) from public, anon, authenticated;
grant execute on function public.update_order_contact(text, text, text) to service_role;
commit;
