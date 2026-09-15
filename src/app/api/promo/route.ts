import { NextResponse } from "next/server";
import { getStripe } from "@/lib/server/clients";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (typeof code !== "string" || !/^[A-Z0-9_-]{3,64}$/i.test(code.trim())) {
      return NextResponse.json({ error: "Code promo invalide." }, { status: 400 });
    }
    const stripe = getStripe();
    const result = await stripe.promotionCodes.list({ code: code.trim(), active: true, limit: 1 });
    const promotion = result.data[0] as any;
    if (!promotion) return NextResponse.json({ error: "Ce code promo est invalide ou expiré." }, { status: 404 });
    const coupon = promotion.promotion?.coupon ?? promotion.coupon;
    if (!coupon || coupon.valid === false) return NextResponse.json({ error: "Ce code promo n'est plus disponible." }, { status: 404 });
    return NextResponse.json({
      code: promotion.code,
      promotionCodeId: promotion.id,
      percentOff: coupon.percent_off ?? null,
      amountOff: coupon.amount_off ?? null,
      currency: coupon.currency ?? "eur",
    });
  } catch (error) {
    console.error("Promo validation failed", error);
    return NextResponse.json({ error: "Impossible de vérifier ce code promo." }, { status: 503 });
  }
}
