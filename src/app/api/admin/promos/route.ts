import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/server/clients";

async function authorized() { return (await cookies()).get("admin_session")?.value === "true"; }

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const promos = await getStripe().promotionCodes.list({ limit: 100, active: true, expand: ["data.promotion.coupon"] });
  return NextResponse.json({ promos: promos.data });
}

export async function POST(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const type = body.type === "amount" ? "amount" : "percent";
    const value = Number(body.value);
    if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !Number.isFinite(value) || value <= 0) throw new Error("Code ou valeur invalide");
    const coupon = await getStripe().coupons.create(type === "percent" ? { percent_off: value, duration: "once", name: code } : { amount_off: Math.round(value * 100), currency: "eur", duration: "once", name: code });
    const promo = await getStripe().promotionCodes.create({ promotion: { type: "coupon", coupon: coupon.id }, code });
    return NextResponse.json({ promo });
  } catch (error: any) { return NextResponse.json({ error: error?.message || "Création impossible" }, { status: 400 }); }
}

export async function PATCH(request: Request) {
  if (!(await authorized())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await request.json();
  if (typeof id !== "string") return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  const promo = await getStripe().promotionCodes.update(id, { active: false });
  return NextResponse.json({ promo });
}
