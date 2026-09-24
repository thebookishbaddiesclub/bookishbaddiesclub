"use client";
import { useEffect, useState } from "react";

const labels: Record<string, string> = { received: "Commande reçue", ready_for_pickup: "À remettre en main propre", handed_over: "Remise effectuée", cancelled: "Annulée" };
const payments: Record<string, string> = { paid: "Paiement confirmé par Stripe", paid_recorded: "Paiement enregistré — Stripe indisponible", free: "Commande sans paiement requis", expired: "Paiement non effectué — session expirée", pending: "Paiement non confirmé", unknown: "Paiement à vérifier — Stripe indisponible" };
export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/admin/orders", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error();
      setOrders((await response.json()).orders || []);
    } catch { setMessage("Impossible de charger les commandes. Réessaie avec Actualiser."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const update = async (order: any, status: string) => {
    const note = window.prompt("Note pour cette commande (facultatif)", order.fulfillment_note || "");
    if (note === null) return;
    try {
      const response = await fetch("/api/admin/orders", { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: order.session_id, status, note }) });
      if (!response.ok) throw new Error();
      await load(); setMessage("Commande mise à jour.");
    } catch { setMessage("Mise à jour impossible."); }
  };
  return <div className="py-12 space-y-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-5xl font-serif italic">Commandes</h1><p className="mt-3 text-bb-ink/60">Les 100 dernières commandes et tentatives de paiement.</p></div><a href="/admin">Retour à l’admin</a><button disabled={loading} onClick={() => void load()} className="rounded-full border px-5 py-3">{loading ? "Vérification…" : "Actualiser"}</button></div>
    {message && <p role="alert" className="text-bb-rose">{message}</p>}
    <div className="space-y-4">{orders.map(order => <article key={order.session_id} className="rounded-[2rem] border border-bb-beige bg-white/60 p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-4"><div><p className="font-bold">{order.customer_name || "Nom non renseigné"}</p><p className="text-sm">{order.customer_email || "E-mail non renseigné"}</p><p className="mt-2 text-xs text-bb-ink/50">{new Date(order.created_at).toLocaleString("fr-FR")}</p></div><div><p className={`font-bold ${order.payment_status === "paid" ? "text-green-700" : "text-bb-rose"}`}>{payments[order.payment_status] || "Paiement à vérifier"}</p>{order.paid_total != null && <p>Total : {(order.paid_total / 100).toFixed(2)} €</p>}</div></div>
      {order.payment_status === "paid" && order.status !== "paid" && <p role="alert" className="text-sm text-amber-800">Paiement reçu sur Stripe, mais mise à jour du stock non confirmée sur le site. Vérifier le webhook avant de modifier le stock manuellement.</p>}
      <ul className="space-y-2">{(order.items || []).map((item: any, i: number) => <li key={i}><strong>{item.name || item.id}</strong> × {item.quantity}{item.variants ? item.variants.map((variant: any, j: number) => <p key={j} className="text-sm text-bb-ink/70">{[variant.size && `Taille : ${variant.size}`, variant.color && `Couleur : ${variant.color}`].filter(Boolean).join(" · ") || "Sans option"} — quantité : {variant.quantity}</p>) : <p className="text-sm text-bb-ink/60">Options non enregistrées pour cette ancienne commande.</p>}</li>)}</ul>
      <p className="text-sm">Préparation : <strong>{labels[order.fulfillment_status] || order.fulfillment_status}</strong></p>
      <div className="flex flex-wrap gap-2">{Object.entries(labels).map(([status, label]) => <button key={status} onClick={() => update(order, status)} className="rounded-full border border-bb-beige px-4 py-2 text-xs hover:border-bb-rose">{label}</button>)}</div>
      {order.fulfillment_note && <p className="text-sm italic">{order.fulfillment_note}</p>}
      <p className="text-xs text-bb-ink/40 break-all">Référence : {order.session_id}</p>
    </article>)}{!loading && !message && orders.length === 0 && <p>Aucune commande pour le moment.</p>}</div>
  </div>;
}
