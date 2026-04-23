import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";
  return createClient(url, key);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret!);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Here logic to handle successful payment
    // 1. Reduire le stock dans Supabase (optionnel - nécessite de passer les IDs produits dans les metadata)
    // 2. Envoyer un email
    // 3. Enregistrer la commande
    
    console.log("Payment successful for session:", session.id);
  }

  return NextResponse.json({ received: true });
}
