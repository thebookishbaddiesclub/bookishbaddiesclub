import FadeIn from "@/components/FadeIn";

export default function MentionsLegales() {
  return (
    <div className="py-20 max-w-3xl mx-auto">
      <FadeIn>
        <h1 className="text-4xl font-serif text-bb-ink mb-12 italic">Mentions Légales</h1>
        <div className="space-y-10 text-bb-ink/80 font-sans leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Éditeur</h2>
            <p>Le <strong>Bookish Baddies Club</strong> est géré par :</p>
            <p><strong>SORIA ANAIS</strong><br />📍 PERPIGNAN</p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Hébergement</h2>
            <p>Ce site est hébergé par <strong>Vercel Inc.</strong><br />📍 440 N Barranca Ave #4133, Covina, CA 91723</p>
          </section>

          <section className="space-y-4 border-t border-bb-beige pt-10">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Propriété Intellectuelle</h2>
            <p>Tout contenu (textes, logos, designs, images) présent sur ce site est la propriété exclusive du <strong>Bookish Baddies Club</strong>. Toute reproduction sans accord préalable est strictement interdite.</p>
          </section>
        </div>
      </FadeIn>
    </div>
  );
}
