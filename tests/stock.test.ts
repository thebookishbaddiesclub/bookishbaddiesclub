import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { parseCart, priceCart, availableStock } from "../src/lib/stock";

const db = new PGlite();
before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create table products(id uuid primary key, name text, price numeric, stock integer, created_at timestamptz default now());`);
  await db.exec(await readFile(new URL("../supabase/migrations/202609130001_automatic_stock.sql", import.meta.url), "utf8"));
});
after(() => db.close());
const a = "00000000-0000-0000-0000-000000000001";
const b = "00000000-0000-0000-0000-000000000002";
const item = (id = a, quantity = 1) => ({ id, quantity, unit_amount: 1200, name: "Tote" });
beforeEach(async () => {
  await db.exec("truncate stock_orders, products;");
  await db.query("insert into products(id,name,price,stock) values ($1,'Tote',12,5),($2,'Book',12,2)", [a,b]);
});
async function reserve(id: string, items = [item()]) {
  return db.query("select reserve_stock($1,$2::jsonb,now()+interval '35 minutes')", [id, JSON.stringify(items)]);
}
async function settle(id: string, amount = 1200, event = "evt_1") {
  return db.query("select settle_stock($1,$2,$3,'eur')", [id, event, amount]);
}
async function stock(id = a) {
  return (await db.query<{ stock: number }>("select stock from products where id=$1", [id])).rows[0].stock;
}
async function available(id = a) {
  const result = await db.query<{ catalog: { id: string; stock: number }[] }>("select stock_catalog() as catalog");
  return result.rows[0].catalog.find(p => p.id === id)!.stock;
}

test("cart validation rejects malformed quantities and aggregates duplicate products", () => {
  assert.deepEqual(parseCart([{ id: a, quantity: 1 }, { product: { id: a, price: 0 }, quantity: 2 }]), [{ id: a, quantity: 3 }]);
  for (const cart of [null, [], {}, [{ id: a, quantity: -1 }], [{ id: a, quantity: 1.5 }], [{ id: a, quantity: "1" }], [{ id: a, quantity: 1000 }]]) {
    assert.throws(() => parseCart(cart));
  }
  assert.equal(priceCart([{ id: a, quantity: 2 }], [{ id: a, name: "Tote", price: 12, stock: 3 }])[0].unit_amount, 1200);
  assert.throws(() => priceCart([{ id: a, quantity: 4 }], [{ id: a, name: "Tote", price: 12, stock: 3 }]));
  assert.equal(availableStock({}), 0);
  assert.equal(availableStock({ stock: null }), 0);
});
test("reservation does not decrement stock; paid quantity is deducted exactly once across distinct events", async () => {
  await reserve("cs_1", [item(a, 3)]);
  assert.equal(await stock(), 5);
  assert.equal(await available(), 2);
  await settle("cs_1", 3600);
  await settle("cs_1", 3600);
  await settle("cs_1", 3600, "evt_different_success");
  assert.equal(await stock(), 2);
  assert.equal(await available(), 2);
});
test("expiration frees a reservation without decrementing, even if delivered twice", async () => {
  await reserve("cs_1", [item(a, 5)]);
  assert.equal(await available(), 0);
  await db.query("select expire_stock($1)", ["cs_1"]);
  await db.query("select expire_stock($1)", ["cs_1"]);
  assert.equal(await stock(), 5);
  assert.equal(await available(), 5);
});
test("delayed payment notification retains stock even after the local expiry time", async () => {
  await reserve("cs_1", [item(a, 5)]);
  await db.exec("update stock_orders set expires_at = now()-interval '1 hour'");
  assert.equal(await available(), 0);
  await settle("cs_1", 6000);
  assert.equal(await stock(), 0);
});
test("later expiration cannot undo a paid purchase", async () => {
  await reserve("cs_1"); await settle("cs_1");
  await db.query("select expire_stock($1)", ["cs_1"]);
  assert.equal(await stock(), 4);
  assert.equal(await available(), 4);
});
test("competing reservations cannot allocate the same last item (serialized PGlite requests)", async () => {
  await db.query("update products set stock=1 where id=$1", [a]);
  const results = await Promise.allSettled([reserve("cs_1"), reserve("cs_2")]);
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
  assert.equal(await stock(), 1);
  assert.equal(await available(), 0);
});
test("multi-product reservation is all or nothing", async () => {
  await assert.rejects(reserve("cs_1", [item(a, 3), item(b, 3)]), /INSUFFICIENT_STOCK/);
  assert.equal(await available(), 5);
  assert.equal((await db.query("select * from stock_orders")).rows.length, 0);
});
test("amount mismatch or missing purchase never changes stock", async () => {
  await reserve("cs_1");
  await assert.rejects(settle("cs_1", 1), /PAYMENT_MISMATCH/);
  await assert.rejects(settle("unknown"), /ORDER_NOT_FOUND/);
  assert.equal(await stock(), 5);
});
test("admin cannot remove or reduce units reserved for checkout", async () => {
  await reserve("cs_1", [item(a, 3)]);
  await assert.rejects(db.query("delete from products where id=$1", [a]), /PRODUCT_RESERVED/);
  await assert.rejects(db.query("update products set stock=2 where id=$1", [a]), /PRODUCT_RESERVED/);
  await assert.rejects(db.query("update products set stock=-1 where id=$1", [b]));
});
test("database failure rolls back every product and paid marker; retry then succeeds", async () => {
  await reserve("cs_1", [item(), item(b)]);
  await db.exec(`create function fail_book() returns trigger language plpgsql as $$ begin
    if new.id = '${b}'::uuid then raise exception 'SIMULATED_FAILURE'; end if; return new; end $$;
    create trigger test_failure before update on products for each row execute function fail_book();`);
  await assert.rejects(settle("cs_1", 2400), /SIMULATED_FAILURE/);
  assert.equal(await stock(), 5); assert.equal(await stock(b), 2);
  assert.equal((await db.query<{status: string}>("select status from stock_orders")).rows[0].status, "reserved");
  await db.exec("drop trigger test_failure on products; drop function fail_book();");
  await settle("cs_1", 2400);
  assert.equal(await stock(), 4); assert.equal(await stock(b), 1);
});
test("database refuses forged prices and duplicate lines", async () => {
  await assert.rejects(reserve("cs_1", [{ ...item(), unit_amount: 1 }]), /PRICE_CHANGED/);
  await assert.rejects(reserve("cs_1", [item(), item()]), /INVALID_CART/);
});
test("anonymous callers cannot read orders or invoke stock mutation functions", async () => {
  await db.exec("set role anon");
  try {
    await assert.rejects(db.query("select * from stock_orders"), /permission denied/);
    await assert.rejects(reserve("cs_1"), /permission denied/);
    await assert.rejects(settle("cs_1"), /permission denied/);
    await assert.rejects(db.query("select expire_stock('cs_1')"), /permission denied/);
  } finally { await db.exec("reset role"); }
});
