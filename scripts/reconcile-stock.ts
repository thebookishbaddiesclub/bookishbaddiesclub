/** Run manually with the isolated test project's environment. No clock-only releases. */
import { getStockDatabase, getStripe } from "../src/lib/server/clients";

async function main() {
  const database = getStockDatabase();
  const stripe = getStripe();
  const { data: orders, error } = await database.from("stock_orders").select("session_id")
    .eq("status", "reserved").lte("expires_at", new Date().toISOString()).order("expires_at").limit(100);
  if (error) throw error;
  for (const order of orders ?? []) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.session_id);
      if (session.metadata?.stock_flow !== "v1" || session.mode !== "payment") throw new Error("Unexpected session mapping");
      if (session.payment_status === "paid") {
        const { error } = await database.rpc("settle_stock", {
          p_session_id: session.id, p_event_id: `reconcile:${session.id}`,
          p_amount_total: session.amount_total, p_currency: session.currency,
        });
        if (error) throw error;
        console.log(session.id, "paid");
      } else if (session.status === "expired") {
        const { error } = await database.rpc("expire_stock", { p_session_id: session.id });
        if (error) throw error;
        console.log(session.id, "expired");
      } else console.log(session.id, "still pending at Stripe; reservation retained");
    } catch {
      console.error("Reconciliation failed; reservation retained", order.session_id);
      process.exitCode = 1;
    }
  }
}
main().catch(() => { console.error("Stock reconciliation failed"); process.exitCode = 1; });
