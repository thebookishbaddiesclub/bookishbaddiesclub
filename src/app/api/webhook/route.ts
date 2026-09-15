import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStockDatabase, getStripe } from "@/lib/server/clients";
import { sendOrderEmails } from "@/lib/email";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.expired"].includes(event.type)) {
    return NextResponse.json({ received: true });
  }
  const session = event.data.object as Stripe.Checkout.Session;
  // Existing Stripe sessions / other integrations have no reliable stock mapping.
  if (session.metadata?.stock_flow !== "v1" || session.mode !== "payment") {
    return NextResponse.json({ received: true });
  }
  try {
    const database = getStockDatabase();
    if (session.customer_details?.email) {
      await database.rpc("update_order_contact", { p_session_id: session.id, p_email: session.customer_details.email, p_name: session.customer_details.name || "" });
    }
    if (event.type === "checkout.session.expired") {
      if (session.status === "expired" && session.payment_status !== "paid") {
        const { error } = await database.rpc("expire_stock", { p_session_id: session.id });
        if (error) throw error;
      }
    } else if (session.payment_status === "paid") {
      const { data: settled, error } = await database.rpc("settle_stock", {
        p_session_id: session.id, p_event_id: event.id,
        p_amount_total: session.amount_total, p_currency: session.currency,
      });
      if (error) throw error;
      if (settled !== "already_paid") await sendOrderEmails({ customerEmail: session.customer_details?.email, customerName: session.customer_details?.name, sessionId: session.id, items: session.metadata?.cart_summary || "Commande boutique", total: session.amount_total, promoCode: session.metadata?.promotion_code });
    }
    return NextResponse.json({ received: true });
  } catch {
    console.error("Stock webhook requires retry", event.id, session.id);
    // Do not acknowledge an uncommitted stock update: Stripe must retry it.
    return NextResponse.json({ error: "Stock update failed" }, { status: 500 });
  }
}
