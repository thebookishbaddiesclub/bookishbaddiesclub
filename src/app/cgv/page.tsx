import FadeIn from "@/components/FadeIn";

export default function CGV() {
  return (
    <div className="py-20 max-w-3xl mx-auto font-sans text-bb-ink/80 leading-relaxed">
      <FadeIn>
        <h1 className="text-4xl font-serif text-bb-ink mb-12 italic">Conditions Générales de Vente</h1>
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">1. Objet</h2>
            <p>Les présentes CGV régissent la vente des produits du Bookish Baddies Club.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">2. Commandes & Remise des produits</h2>
            <p className="bg-bb-beige/20 p-6 rounded-2xl border border-bb-beige italic text-bb-ink">
              La remise des articles se fait <strong>exclusivement en main propre</strong> lors des événements du club à Perpignan ou Montpellier. 
              <strong> Pas de vente à distance ni d'expédition.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">3. Paiements</h2>
            <p>Le paiement s'effectue en ligne via la plateforme sécurisée ou lors de l'événement.</p>
          </section>

          <section className="space-y-4 border-t border-bb-beige pt-10">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">4. Propriété</h2>
            <p>Le <strong>Bookish Baddies Club</strong> reste propriétaire des produits jusqu'au paiement intégral et à la remise du bien.</p>
          </section>
        </div>
      </FadeIn>
    </div>
  );
}
