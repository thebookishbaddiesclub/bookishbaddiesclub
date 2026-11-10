import {validSession} from "@/lib/admin-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!await validSession(sessionCookie?.value)) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
