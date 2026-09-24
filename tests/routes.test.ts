import { test, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import Stripe from "stripe";
import { POST as webhook } from "../src/app/api/webhook/route";
import { POST as checkout } from "../src/app/api/checkout/route";

const stripe = new Stripe("sk_test_local_only");
const sessionPrototype = Object.getPrototypeOf(stripe.checkout.sessions);
let calls: { name: string; body: Record<string, unknown> }[];
let failingRpc: string | undefined;
let reserveMessage: string;
let catalog: any[];
let sessionCalls: NonNullable<Parameters<Stripe["checkout"]["sessions"]["create"]>[0]>[];
beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_local_only";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_local_test";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://database.example.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "local-test-key";
  process.env.SITE_URL = "https://shop.example.test";
  catalog = [{ id: "p1", name: "Real product", price: 12, stock: 3 }];
  calls = []; failingRpc = undefined; reserveMessage = "temporary database failure"; sessionCalls = [];
  mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    assert.equal(url.hostname, "database.example.test");
    const name = url.pathname.split("/").pop()!;
    calls.push({ name, body: JSON.parse(String(init?.body ?? "{}")) });
    return new Response(JSON.stringify(name === failingRpc ? { message: reserveMessage, code: "P0001" }
      : name === "stock_catalog" ? catalog : null),
      { status: name === failingRpc ? 500 : 200, headers: { "Content-Type": "application/json" } });
  });
  mock.method(sessionPrototype, "create", async (params: NonNullable<Parameters<Stripe["checkout"]["sessions"]["create"]>[0]>) => {
    sessionCalls.push(params);
    return { id: "cs_test_1", url: "https://checkout.stripe.com/test", expires_at: Math.floor(Date.now()/1000)+2100 };
  });
  mock.method(sessionPrototype, "expire", async () => ({ status: "expired" }));
});
afterEach(() => mock.restoreAll());
function signedEvent(type: string, overrides = {}) {
  const payload = JSON.stringify({ id: "evt_test", object: "event", type, data: { object: {
    id: "cs_test_1", mode: "payment", metadata: { stock_flow: "v1" }, payment_status: "paid", status: "complete",
    amount_total: 2400, currency: "eur", ...overrides,
  } } });
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!).update(`${timestamp}.${payload}`).digest("hex");
  const signature = `t=${timestamp},v1=${digest}`;
  return new Request("https://shop.example.test/api/webhook", { method: "POST", body: payload, headers: { "stripe-signature": signature } });
}
function cartRequest(cart: unknown) {
  return new Request("https://shop.example.test/api/checkout", { method: "POST", headers: { origin: "https://attacker.example" }, body: JSON.stringify({ cart }) });
}
test("valid signed paid webhook invokes transactional settlement with amount and session ID", async () => {
  assert.equal((await webhook(signedEvent("checkout.session.completed"))).status, 200);
  assert.deepEqual(calls, [{ name: "settle_stock", body: { p_session_id: "cs_test_1", p_event_id: "evt_test", p_amount_total: 2400, p_currency: "eur" } }]);
});
test("unpaid, failed and unrelated events never decrement stock", async () => {
  for (const type of ["checkout.session.completed", "checkout.session.async_payment_failed", "payment_intent.payment_failed"]) {
    assert.equal((await webhook(signedEvent(type, { payment_status: "unpaid" }))).status, 200);
  }
  assert.equal(calls.length, 0);
});
test("invalid signature is rejected before any database write", async () => {
  const request = new Request("https://shop.example.test/api/webhook", { method: "POST", body: "{}", headers: { "stripe-signature": "invalid" } });
  assert.equal((await webhook(request)).status, 400); assert.equal(calls.length, 0);
});
test("database failure asks Stripe to retry", async () => {
  failingRpc = "settle_stock";
  assert.equal((await webhook(signedEvent("checkout.session.completed"))).status, 500);
});
test("legacy sessions are ignored instead of guessing their product mapping", async () => {
  assert.equal((await webhook(signedEvent("checkout.session.completed", { metadata: {} }))).status, 200);
  assert.equal(calls.length, 0);
});
test("expiration releases only an actually expired unpaid session", async () => {
  await webhook(signedEvent("checkout.session.expired", { status: "expired", payment_status: "unpaid" }));
  assert.deepEqual(calls.map(c => c.name), ["expire_stock"]);
});
test("asynchronous success also uses settlement", async () => {
  await webhook(signedEvent("checkout.session.async_payment_succeeded"));
  assert.deepEqual(calls.map(c => c.name), ["settle_stock"]);
});
test("checkout ignores browser prices, combines duplicates, and uses configured redirects", async () => {
  const result = await checkout(cartRequest([{ product: { id: "p1", price: 0.01, name: "Fake" }, quantity: 1 }, { id: "p1", quantity: 1 }]));
  assert.equal(result.status, 200);
  assert.equal(sessionCalls[0].line_items![0].price_data!.unit_amount, 1200);
  assert.equal(sessionCalls[0].line_items![0].quantity, 2);
  assert.equal(sessionCalls[0].success_url, "https://shop.example.test/success");
  assert.deepEqual(calls.map(c => c.name), ["stock_catalog", "reserve_stock"]);
});
test("insufficient stock prevents Stripe session creation", async () => {
  assert.equal((await checkout(cartRequest([{ id: "p1", quantity: 4 }]))).status, 409);
  assert.equal(sessionCalls.length, 0);
});
test("a reservation conflict expires Stripe before releasing and never returns a checkout URL", async () => {
  failingRpc = "reserve_stock"; reserveMessage = "INSUFFICIENT_STOCK";
  const result = await checkout(cartRequest([{ id: "p1", quantity: 1 }]));
  assert.equal(result.status, 409); assert.equal((await result.json()).url, undefined);
  assert.deepEqual(calls.map(c => c.name), ["stock_catalog", "reserve_stock", "expire_stock"]);
});
test("uncertain Stripe expiration does not release a possibly payable session", async () => {
  failingRpc = "reserve_stock";
  mock.method(sessionPrototype, "expire", async () => { throw new Error("Network error"); });
  assert.equal((await checkout(cartRequest([{ id: "p1", quantity: 1 }]))).status, 503);
  assert.deepEqual(calls.map(c => c.name), ["stock_catalog", "reserve_stock"]);
});
test("missing privileged database credentials fails closed", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await checkout(cartRequest([{ id: "p1", quantity: 1 }]))).status, 503);
  assert.equal(calls.length, 0);
});

test("contact update failure asks Stripe to retry instead of losing customer details", async () => {
  failingRpc = "update_order_contact";
  const result = await webhook(signedEvent("checkout.session.completed", { customer_details: { email: "buyer@example.test", name: "Test Buyer" } }));
  assert.equal(result.status, 500);
  assert.deepEqual(calls.map(c => c.name), ["update_order_contact"]);
});

test("checkout sends chosen sizes to Stripe and retains them in the stock order", async () => {
  catalog[0].sizes = ["S", "M"];
  const result = await checkout(cartRequest([{ id: "p1", quantity: 1, size: "S" }, { id: "p1", quantity: 1, size: "M" }]));
  assert.equal(result.status, 200);
  assert.equal(sessionCalls[0].line_items!.length, 2);
  assert.equal(sessionCalls[0].line_items![0].price_data!.product_data!.metadata!.size, "S");
  assert.match(sessionCalls[0].line_items![1].price_data!.product_data!.name, /Taille : M/);
  const items = calls.find(c => c.name === "reserve_stock")!.body.p_items as any[];
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 2);
  assert.deepEqual(items[0].variants.map((v: any) => v.size), ["S", "M"]);
});
