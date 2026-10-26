"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
export default function AdminAnalytics() {
  const [data, setData] = useState<{ visitors?: number; pageviews?: number; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    try { const res = await fetch("/api/admin/analytics", { cache: "no-store" }); const body = await res.json(); setData(res.ok ? body : { error: body.error || "Statistiques indisponibles" }); }
    catch { setData({ error: "Connexion indisponible. Réessaie." }); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, []);
  return <div className="bg-white/40 p-8 rounded-[2.5rem] border border-bb-beige shadow-sm">
    <div className="flex items-center justify-between gap-3 mb-6"><Users className="w-6 h-6 text-bb-rose" /><span className="text-[10px] uppercase tracking-widest">Depuis l’activation</span></div>
    <div aria-live="polite">{loading ? <p>Chargement…</p> : data?.error ? <p className="text-sm">{data.error}</p> : <><p className="text-4xl font-serif">{data?.visitors?.toLocaleString("fr-FR")}</p><h3 className="text-[10px] uppercase font-bold tracking-widest mt-2">Visiteurs · Vercel Analytics</h3><p className="text-sm mt-3">{data?.pageviews?.toLocaleString("fr-FR")} pages vues</p></>}</div>
    <button type="button" onClick={refresh} disabled={loading} className="text-xs underline mt-4 text-bb-rose disabled:opacity-50">Actualiser</button>
  </div>;
}
