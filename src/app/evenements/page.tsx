import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { eventCategories, eventCategory } from "@/lib/event-category";

export const dynamic = "force-dynamic";

type ClubEvent = { id: string; title: string; starts_at: string; city: string; summary?: string; image_url?: string; action_url?: string; action_label?: string; category?: string };

export default async function EvenementsPage() {
  const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
  const events: ClubEvent[] = data || [];
  const now = Date.now();
  const card = (event: ClubEvent, past = false) => <article key={event.id} className="overflow-hidden rounded-[2rem] border border-bb-beige bg-white/60 shadow-sm">
    {event.image_url ? <div className="relative aspect-[16/9]"><Image src={event.image_url} alt="" fill className="object-cover" /></div> : <div className="flex aspect-[16/9] items-center justify-center bg-bb-beige/30 text-5xl" aria-hidden="true">{eventCategory(event.category) === "twitch" ? "📺" : "✨"}</div>}
    <div className="p-6"><p className="text-xs font-bold uppercase tracking-widest text-bb-rose">{new Date(event.starts_at).toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" })} · {eventCategory(event.category) === "twitch" ? "En ligne · Twitch" : event.city}</p>
      <h4 className="mt-2 font-serif text-2xl">{event.title}</h4><p className="mt-3 whitespace-pre-wrap text-sm text-bb-ink/70">{event.summary}</p>
      {event.action_url && !past && <a href={event.action_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-bb-ink px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-bb-cream">{eventCategory(event.category) === "twitch" ? "Voir sur Twitch" : event.action_label || "En savoir plus"}</a>}
    </div>
  </article>;
  return <div className="py-12 space-y-16">
    <header className="text-center"><h1 className="text-5xl font-serif italic text-bb-ink">Les événements</h1><p className="mt-4 text-bb-ink/60">En ville ou sur Twitch, on se retrouve bientôt.</p>
      <nav aria-label="Catégories d’événements" className="mt-8 flex flex-wrap justify-center gap-4">{eventCategories.map(category => <a key={category.value} href={`#${category.value}`} className="rounded-full border border-bb-rose/30 px-6 py-3 text-bb-rose hover:bg-bb-rose/10">{category.label}</a>)}</nav>
    </header>
    {error ? <p role="alert" className="text-center">Les événements sont momentanément indisponibles. Réessaie dans quelques instants.</p> : eventCategories.map(category => {
      const selected = events.filter(event => eventCategory(event.category) === category.value);
      const upcoming = selected.filter(event => new Date(event.starts_at).getTime() >= now);
      const past = selected.filter(event => new Date(event.starts_at).getTime() < now).reverse();
      return <section key={category.value} id={category.value} aria-labelledby={`${category.value}-title`} className="scroll-mt-40 border-t border-bb-beige pt-10 space-y-8">
        <div><h2 id={`${category.value}-title`} className="text-4xl font-serif text-bb-rose">{category.label}</h2><p className="mt-3 text-bb-ink/60">{category.value === "twitch" ? "Les Baddies Night et nos rendez-vous en ligne." : "Nos rencontres et activités autour des livres."}</p></div>
        <div className="space-y-6"><h3 className="text-2xl font-serif">À venir</h3>{upcoming.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{upcoming.map(event => card(event))}</div> : <p className="text-bb-ink/60">Les prochains rendez-vous arrivent bientôt.</p>}</div>
        {past.length > 0 && <div className="space-y-6"><h3 className="text-2xl font-serif text-bb-ink/60">Événements passés</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{past.map(event => card(event, true))}</div></div>}
      </section>;
    })}
  </div>;
}
