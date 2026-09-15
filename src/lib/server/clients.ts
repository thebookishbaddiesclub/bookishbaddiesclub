import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export function getStockDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Stock database configuration missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe configuration missing");
  // Keep the existing API version; the installed SDK types target a newer version.
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia" as NonNullable<ConstructorParameters<typeof Stripe>[1]>["apiVersion"],
    maxNetworkRetries: 2,
    timeout: 15000,
  });
}

export function getSiteOrigin() {
  if (!process.env.SITE_URL) throw new Error("SITE_URL is required");
  const url = new URL(process.env.SITE_URL);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
    throw new Error("Invalid SITE_URL");
  }
  return url.origin;
}
