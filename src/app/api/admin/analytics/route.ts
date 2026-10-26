import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
  if ((await cookies()).get("admin_session")?.value !== "true") return reply({ error: "Non autorisé" }, 401);
  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return reply({ error: "Connexion Vercel à configurer", configured: false }, 503);
  const url = new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  url.searchParams.set("projectId", projectId);
  if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  else url.searchParams.set("slug", "thebookishbaddiesclub-6479s-projects");
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) return reply({ error: "Statistiques indisponibles : vérifier l’accès Vercel." }, 502);
    const { data } = await response.json();
    if (!Number.isFinite(data?.visitors) || !Number.isFinite(data?.pageviews)) throw new Error("Invalid metrics");
    return reply({ visitors: data.visitors, pageviews: data.pageviews });
  } catch { return reply({ error: "Statistiques temporairement indisponibles." }, 502); }
}
