import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStockDatabase } from "@/lib/server/clients";
import { sendOrderStatusEmail } from "@/lib/email";

async function authorized() { return (await cookies()).get("admin_session")?.value === "true"; }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data, error } = await getStockDatabase().from("stock_orders").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { sessionId, status, note } = await request.json();
  if (typeof sessionId !== "string" || !["received", "ready_for_pickup", "handed_over", "cancelled"].includes(status)) return NextResponse.json({ error: "Commande ou statut invalide" }, { status: 400 });
  const { data, error } = await getStockDatabase().from("stock_orders").update({ fulfillment_status: status, fulfillment_note: typeof note === "string" ? note : null, updated_at: new Date().toISOString() }).eq("session_id", sessionId).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await sendOrderStatusEmail(data.customer_email, data.customer_name, status, data.fulfillment_note);
  return NextResponse.json({ order: data });
}
