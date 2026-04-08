import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        /* clientPayload */
      ) => {
        /**
         * Generate a client token for the browser to upload the file directly.
         * ---------------------------------------------------------
         * IMPORTANT: Here you should check for the user's session 
         * or a custom admin password to authorize the upload.
         */
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          tokenPayload: JSON.stringify({
            // optional, sent to your server-side onUploadCompleted callback
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This is called on your server after a successful upload
        console.log("Blob upload completed", blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The error from focus onBeforeGenerateToken
    );
  }
}
