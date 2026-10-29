import EventCard, { type ClubEvent } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";
import { eventCategories, eventCategory } from "@/lib/event-category";

export const dynamic = "force-dynamic";

export default async function EvenementsPage() {
  const { data, error } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
  const events: ClubEvent[] = data || [];
  const now = Date.now();
  const card = (event: ClubEvent, past = false) => <EventCard key={event.id} event={event} past={past} />;
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
