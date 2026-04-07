import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Le panier est vide" }, { status: 400 });
    }

    const line_items = cart.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.product.name,
          images: item.product.imageUrl ? [item.product.imageUrl] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${request.headers.get("origin")}/merch?success=true`,
      cancel_url: `${request.headers.get("origin")}/merch?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
