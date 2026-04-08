import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: Récupérer les données actuelles
export async function GET() {
  try {
    const { data: books, error: booksError } = await supabase.from("books").select("*").order("created_at", { ascending: true });
    const { data: products, error: productsError } = await supabase.from("products").select("*").order("created_at", { ascending: true });

    if (booksError) throw booksError;
    if (productsError) throw productsError;

    return NextResponse.json({ lectures: { books }, merch: { products } });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Erreur lecture données" }, { status: 500 });
  }
}

// POST: Ajouter un nouvel élément
export async function POST(request: Request) {
  const { password, type, data } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe erroné" }, { status: 401 });
  }

  try {
    const table = type === "lectures" ? "books" : "products";
    const { error } = await supabase.from(table).insert([data]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Erreur sauvegarde" }, { status: 500 });
  }
}

// PUT: Modifier un élément existant
export async function PUT(request: Request) {
  const { password, type, id, data } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe erroné" }, { status: 401 });
  }

  try {
    const table = type === "lectures" ? "books" : "products";
    const { error } = await supabase.from(table).update(data).eq("id", id);
    
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: "Erreur modification" }, { status: 500 });
  }
}

// DELETE: Supprimer un élément
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe erroné" }, { status: 401 });
  }

  if (!type || !id) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  try {
    const table = type === "lectures" ? "books" : "products";
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
