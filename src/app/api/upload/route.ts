import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    console.log("[upload] Uploading file:", file.name, file.type, file.size);

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    console.log("[upload] Success:", blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error("[upload] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
