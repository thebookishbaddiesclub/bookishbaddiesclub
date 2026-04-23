import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  console.log("[upload] Received upload request, type:", body.type);

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log("[upload] Generating token for:", pathname);
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"],
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("[upload] Upload completed successfully:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = (error as Error).message;
    console.error("[upload] Upload failed:", message);
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
