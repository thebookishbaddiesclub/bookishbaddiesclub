import FadeIn from "@/components/FadeIn";
import { Sparkles, Heart, Globe } from "lucide-react";

export default function Engagements() {
  return (
    <div className="py-20 max-w-4xl mx-auto font-sans text-bb-ink/80 leading-relaxed text-center px-6">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl font-serif text-bb-ink mb-6 italic">Nos Engagements</h1>
        <p className="text-sm font-sans tracking-[.2em] text-bb-rose uppercase font-black mb-20 animate-pulse-slow">Un club engagé & conscient</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Pilier 1 */}
          <section className="space-y-6">
            <div className="w-16 h-16 bg-bb-beige/30 rounded-full flex items-center justify-center mx-auto text-bb-rose border border-bb-rose/10">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-ink">Librairies Locales</h2>
            <p className="text-sm leading-relaxed italic font-medium">
              Nous collaborons activement avec les librairies indépendantes du sud.
            </p>
          </section>

          {/* Pilier 2 */}
          <section className="space-y-6">
            <div className="w-16 h-16 bg-bb-beige/30 rounded-full flex items-center justify-center mx-auto text-bb-rose border border-bb-rose/10">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-ink">Faire rayonner le sud</h2>
            <p className="text-sm leading-relaxed italic font-medium">
              Prouver que la passion du livre et les expériences culturelles fortes ne sont pas réservées aux capitales.
            </p>
          </section>

          {/* Pilier 3 */}
          <section className="space-y-6">
            <div className="w-16 h-16 bg-bb-beige/30 rounded-full flex items-center justify-center mx-auto text-bb-rose border border-bb-rose/10">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-ink">Accès & Expérience</h2>
            <p className="text-sm leading-relaxed italic font-medium">
              Offrir à toutes l'accès à des événements et des rencontres dans un univers unique.
            </p>
          </section>
        </div>

        <div className="h-[1px] w-24 bg-bb-gold/60 mx-auto mt-24"></div>
      </FadeIn>
    </div>
  );
}
