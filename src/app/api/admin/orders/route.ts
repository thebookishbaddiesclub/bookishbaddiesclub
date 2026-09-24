import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStockDatabase, getStripe } from "@/lib/server/clients";
import { sendOrderStatusEmail } from "@/lib/email";

async function authorized() { return (await cookies()).get("admin_session")?.value === "true"; }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data, error } = await getStockDatabase().from("stock_orders").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const orders = data || [];
  // Read Stripe for existing orders too; never infer payment from fulfillment.
  const stripe = getStripe();
  for (let offset = 0; offset < orders.length; offset += 5) {
    await Promise.all(orders.slice(offset, offset + 5).map(async order => {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.session_id);
        order.customer_name = session.customer_details?.name || order.customer_name;
        order.customer_email = session.customer_details?.email || order.customer_email;
        order.payment_status = session.payment_status === "paid" ? "paid" : session.payment_status === "no_payment_required" ? "free" : session.status === "expired" ? "expired" : "pending";
        order.paid_total = session.amount_total;
        order.stripe_verified = true;
      } catch {
        order.payment_status = order.status === "paid" ? "paid_recorded" : "unknown";
        order.stripe_verified = false;
      }
    }));
  }
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { sessionId, status, note } = await request.json();
  if (typeof sessionId !== "string" || !["received", "ready_for_pickup", "handed_over", "cancelled"].includes(status)) return NextResponse.json({ error: "Commande ou statut invalide" }, { status: 400 });
  // Recover the recipient from Stripe before any status notification.
  let contact: { customer_name?: string; customer_email?: string } = {};
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.customer_details?.email) contact.customer_email = session.customer_details.email;
    if (session.customer_details?.name) contact.customer_name = session.customer_details.name;
  } catch { return NextResponse.json({ error: "Vérification Stripe indisponible. Réessaie." }, { status: 503 }); }
  const { data, error } = await getStockDatabase().from("stock_orders").update({ ...contact, fulfillment_status: status, fulfillment_note: typeof note === "string" ? note : null, updated_at: new Date().toISOString() }).eq("session_id", sessionId).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sendOrderStatusEmail(data.customer_email, data.customer_name, status, data.fulfillment_note);
  return NextResponse.json({ order: data });
}
