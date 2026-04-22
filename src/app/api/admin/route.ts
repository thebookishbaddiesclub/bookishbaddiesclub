import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Instance Supabase administrateur qui peut bypasser le Row Level Security (RLS)
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key);
}

async function verifyAuth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "true";
}

// GET: Récupérer les données actuelles
export async function GET() {
  try {
    const adminSupabase = getAdminSupabase();
    const { data: books, error: booksError } = await adminSupabase.from("books").select("*").order("created_at", { ascending: true });
    const { data: products, error: productsError } = await adminSupabase.from("products").select("*").order("created_at", { ascending: true });

    if (booksError) throw booksError;
    if (productsError) throw productsError;

    return NextResponse.json({ lectures: { books }, merch: { products } });
  } catch (error: any) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error?.message || "Erreur lecture données" }, { status: 500 });
  }
}

// POST: Ajouter un nouvel élément
export async function POST(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type, data } = await request.json();

  try {
    const table = type === "lectures" ? "books" : "products";
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase.from(table).insert([data]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error?.message || "Erreur sauvegarde" }, { status: 500 });
  }
}

// PUT: Modifier un élément existant
export async function PUT(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { type, id, data } = await request.json();

  try {
    const table = type === "lectures" ? "books" : "products";
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase.from(table).update(data).eq("id", id);
    
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error?.message || "Erreur modification" }, { status: 500 });
  }
}

// DELETE: Supprimer un élément
export async function DELETE(request: Request) {
  if (!(await verifyAuth())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const table = type === "lectures" ? "books" : "products";
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase.from(table).delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error?.message || "Erreur suppression" }, { status: 500 });
  }
}
