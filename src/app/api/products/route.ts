import { NextResponse } from "next/server";
import { getStockDatabase } from "@/lib/server/clients";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { data, error } = await getStockDatabase().rpc("stock_catalog");
    if (error) throw error;
    return NextResponse.json({ products: data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "La boutique est momentanément indisponible." }, { status: 503 });
  }
}
