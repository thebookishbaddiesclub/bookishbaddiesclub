import {validSession} from "@/lib/admin-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin") || pathname === "/preview/retraite-lecture-2027" || pathname.startsWith("/preview/retraite-lecture-2027/")) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!await validSession(sessionCookie?.value)) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/preview/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/preview/retraite-lecture-2027/:path*"],
};
