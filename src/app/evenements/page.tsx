import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function EvenementsPage() {
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
  const events = data || [];
  const now = new Date();
  const upcoming = events.filter((event: any) => new Date(event.starts_at) >= now);
  const past = events.filter((event: any) => new Date(event.starts_at) < now).reverse();
  const card = (event: any, pastEvent = false) => <article key={event.id} className="overflow-hidden rounded-[2rem] border border-bb-beige bg-white/60 shadow-sm">{event.image_url ? <div className="relative aspect-[16/9]"><Image src={event.image_url} alt="" fill className="object-cover" /></div> : <div className="flex aspect-[16/9] items-center justify-center bg-bb-beige/30 text-5xl">✨</div>}<div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-bb-rose">{new Date(event.starts_at).toLocaleDateString("fr-FR", { dateStyle: "long" })} · {event.city}</p><h2 className="mt-2 font-serif text-2xl">{event.title}</h2><p className="mt-3 text-sm text-bb-ink/70">{event.summary}</p>{event.action_url && !pastEvent && <a href={event.action_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-bb-ink px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-bb-cream">{event.action_label}</a>}</div></article>;
  return <div className="py-12 space-y-16"><header className="text-center"><h1 className="text-5xl font-serif italic text-bb-ink">Les événements</h1><p className="mt-4 text-bb-ink/60">On se retrouve bientôt, à Perpignan, Montpellier et ailleurs.</p></header><section className="space-y-8"><h2 className="text-3xl font-serif text-bb-rose">À venir</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{upcoming.map(event => card(event))}</div>{upcoming.length === 0 && <p className="text-bb-ink/40">Aucun événement à venir pour le moment.</p>}</section><section className="space-y-8"><h2 className="text-3xl font-serif text-bb-ink/60">Événements passés</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-80">{past.map(event => card(event, true))}</div></section></div>;
}
