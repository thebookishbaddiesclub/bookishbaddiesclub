import FadeIn from "@/components/FadeIn";

export default function Confidentialite() {
  return (
    <div className="py-20 max-w-3xl mx-auto font-sans text-bb-ink/80 leading-relaxed">
      <FadeIn>
        <h1 className="text-4xl font-serif text-bb-ink mb-12 italic">Politique de Confidentialité</h1>
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Protection des Données</h2>
            <p>Le Bookish Baddies Club s'engage à protéger la vie privée de ses membres. Les informations recueillies (nom, email, adresse) servent uniquement au traitement des commandes et à l'envoi de l'Agenda du club (si vous y avez souscrit).</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Vos Droits</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données personnelles.</p>
          </section>

          <section className="space-y-4 pt-10 border-t border-bb-beige">
            <h2 className="text-xs uppercase tracking-[.4em] font-black text-bb-rose">Cookies</h2>
            <p>Nous utilisons uniquement des cookies nécessaires au bon fonctionnement de la boutique et de votre panier d'achat.</p>
          </section>
        </div>
      </FadeIn>
    </div>
  );
}
