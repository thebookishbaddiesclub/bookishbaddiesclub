"use client";

import { Analytics } from "@vercel/analytics/next";

export default function SiteAnalytics() {
  return <Analytics beforeSend={(event) => {
    const url = new URL(event.url);
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/preview/") || url.pathname === "/login") return null;
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  }} />;
}
