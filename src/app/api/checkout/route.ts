import { NextResponse } from "next/server";
import { CartError, parseCart, priceCart, type CatalogProduct } from "@/lib/stock";
import { getSiteOrigin, getStockDatabase, getStripe } from "@/lib/server/clients";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => { throw new CartError("Panier invalide."); });
    const cart = parseCart(body?.cart);
    const promotionCodeId = typeof body?.promotionCodeId === "string" && /^promo_[A-Za-z0-9]+$/.test(body.promotionCodeId)
      ? body.promotionCodeId : null;
    const database = getStockDatabase();
    const { data, error } = await database.rpc("stock_catalog");
    if (error) throw error;
    const items = priceCart(cart, data as CatalogProduct[]);
    const stripe = getStripe();
    const origin = getSiteOrigin();
    // No URL is exposed until the database has atomically reserved every item.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(item => ({
        price_data: { currency: "eur", product_data: { name: item.name, metadata: { product_id: item.id } }, unit_amount: item.unit_amount },
        quantity: item.quantity,
      })),
      ...(promotionCodeId ? { discounts: [{ promotion_code: promotionCodeId }] } : {}),
      metadata: { stock_flow: "v1", promotion_code: promotionCodeId ?? "", cart_summary: items.map(item => `${item.name} × ${item.quantity}`).join(", ") },
      expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
      success_url: `${origin}/success`,
      cancel_url: `${origin}/merch?canceled=true`,
    }, { idempotencyKey: crypto.randomUUID() });

    const { error: reservationError } = await database.rpc("reserve_stock", {
      p_session_id: session.id, p_items: items,
      p_expires_at: new Date(session.expires_at * 1000).toISOString(),
    });
    if (!reservationError) {
      await database.rpc("update_order_contact", { p_session_id: session.id, p_email: session.customer_details?.email || "", p_name: session.customer_details?.name || "" });
    }
    if (reservationError || !session.url) {
      // A timeout can mean the DB committed. Expire at Stripe first; only then release.
      try {
        const expired = await stripe.checkout.sessions.expire(session.id);
        if (expired.status === "expired") await database.rpc("expire_stock", { p_session_id: session.id });
      } catch {
        console.error("Could not expire undisclosed checkout session", session.id);
        // Its eventual signed expiration webhook will release any committed hold.
      }
      if (reservationError && /INSUFFICIENT_STOCK|PRODUCT_UNAVAILABLE|PRICE_CHANGED/.test(reservationError.message)) {
        throw new CartError("Le stock ou le prix a changé. Actualise ton panier.");
      }
      throw reservationError ?? new Error("Missing checkout URL");
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof CartError) return NextResponse.json({ error: error.message }, { status: 409 });
    console.error("Checkout could not be prepared");
    return NextResponse.json({ error: "Paiement momentanément indisponible. Réessaie dans quelques instants." }, { status: 503 });
  }
}
