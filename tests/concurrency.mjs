import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

let server, directory, first, second, observer;
const a = '00000000-0000-0000-0000-000000000001';
const items = JSON.stringify([{ id: a, quantity: 1, unit_amount: 1200 }]);
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'bookish-stock-test-'));
  server = new EmbeddedPostgres({ databaseDir: join(directory, 'db'), user: 'postgres', password: 'local-test-only',
    port: 55439, persistent: false, createPostgresUser: false, onLog: () => {}, onError: () => {},
    postgresFlags: ['-c', 'listen_addresses=127.0.0.1', '-c', `unix_socket_directories=${directory}`] });
  await server.initialise(); await server.start();
  first = server.getPgClient(); second = server.getPgClient(); observer = server.getPgClient();
  await Promise.all([first.connect(), second.connect(), observer.connect()]);
  await first.query(`create role anon; create role authenticated; create role service_role;
    create table products(id uuid primary key, name text, price numeric, stock integer, created_at timestamptz default now());`);
  await first.query(await readFile(new URL('../supabase/migrations/202609130001_automatic_stock.sql', import.meta.url), 'utf8'));
  await first.query('set statement_timeout = 10000'); await second.query('set statement_timeout = 10000');
});
after(async () => {
  await Promise.all([first?.end(), second?.end(), observer?.end()]);
  if (server) await server.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
});
async function reset() {
  await first.query('truncate stock_orders, products');
  await first.query("insert into products(id,name,price,stock) values ($1,'Tote',12,1)", [a]);
}
async function waitForLock() {
  const deadline = Date.now() + 4000;
  while (Date.now() < deadline) {
    const result = await observer.query("select 1 from pg_stat_activity where pid=$1 and wait_event_type='Lock'", [second.processID]);
    if (result.rowCount) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error('Second connection did not wait for the row lock');
}
test('real concurrent checkouts: second waits, then sees reservation committed by first', async () => {
  await reset();
  await first.query('begin');
  await first.query("select reserve_stock('cs_first',$1,now()+interval '35 minutes')", [items]);
  const competing = second.query("select reserve_stock('cs_second',$1,now()+interval '35 minutes')", [items]).then(() => null, error => error);
  try { await waitForLock(); } finally { await first.query('commit'); }
  assert.match((await competing)?.message ?? '', /INSUFFICIENT_STOCK/);
  assert.equal((await first.query('select count(*)::int as n from stock_orders')).rows[0].n, 1);
});
test('real concurrent duplicate webhooks: one paid marker and one stock decrement', async () => {
  await reset();
  await first.query("select reserve_stock('cs_paid',$1,now()+interval '35 minutes')", [items]);
  await first.query('begin');
  await first.query("select settle_stock('cs_paid','evt_a',1200,'eur')");
  const duplicate = second.query("select settle_stock('cs_paid','evt_b',1200,'eur')");
  try { await waitForLock(); } finally { await first.query('commit'); }
  assert.equal((await duplicate).rows[0].settle_stock, 'already_paid');
  assert.equal((await first.query('select stock from products')).rows[0].stock, 0);
});
test('stale admin stock update cannot restore stock after a simultaneous payment', async () => {
  await reset();
  await first.query("select reserve_stock('cs_admin',$1,now()+interval '35 minutes')", [items]);
  await first.query('begin');
  await first.query("select settle_stock('cs_admin','evt_admin',1200,'eur')");
  const stale = second.query('update products set stock=8 where id=$1 and stock=1 returning id', [a]);
  try { await waitForLock(); } finally { await first.query('commit'); }
  assert.equal((await stale).rowCount, 0);
  assert.equal((await first.query('select stock from products')).rows[0].stock, 0);
});
