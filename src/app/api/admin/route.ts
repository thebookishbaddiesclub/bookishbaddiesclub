import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");

async function readJson(type: string) {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}

async function writeJson(type: string, data: any) {
  const filePath = path.join(DATA_DIR, `${type}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// GET: Récupérer les données actuelles
export async function GET() {
  try {
    const lectures = await readJson("lectures");
    const merch = await readJson("merch");
    return NextResponse.json({ lectures, merch });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lecture données" }, { status: 500 });
  }
}

// POST: Ajouter un nouvel élément
export async function POST(request: Request) {
  const { password, type, data } = await (request.json() as any);

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe erroné" }, { status: 401 });
  }

  try {
    const json = await readJson(type);
    const key = type === "lectures" ? "books" : "products";
    json[key].push({ id: Date.now().toString(), ...data });
    await writeJson(type, json);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur sauvegarde" }, { status: 500 });
  }
}

// PUT: Modifier un élément existant
export async function PUT(request: Request) {
  const { password, type, id, data } = await (request.json() as any);

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe erroné" }, { status: 401 });
  }

  try {
    const json = await readJson(type);
    const key = type === "lectures" ? "books" : "products";
    const index = json[key].findIndex((item: any) => item.id === id);
    
    if (index !== -1) {
      json[key][index] = { ...json[key][index], ...data };
      await writeJson(type, json);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Élément non trouvé" }, { status: 404 });
  } catch (error) {
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
    const json = await readJson(type);
    const key = type === "lectures" ? "books" : "products";
    json[key] = json[key].filter((item: any) => item.id !== id);
    await writeJson(type, json);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
