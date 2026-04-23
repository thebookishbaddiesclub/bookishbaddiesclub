import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";

export default function SuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
      <FadeIn className="max-w-md w-full bg-white/40 backdrop-blur-md border border-bb-beige p-12 rounded-[3.5rem] shadow-xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-green-100 p-6 rounded-full text-green-500 animate-bounce">
            <CheckCircle className="w-16 h-16" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif text-bb-ink">Merci beaucoup !</h1>
          <p className="text-bb-ink/60 text-lg italic">Votre commande a été validée avec succès.</p>
        </div>

        <div className="bg-bb-beige/20 p-6 rounded-3xl text-sm text-bb-ink/70 leading-relaxed">
          Vous recevrez un e-mail de confirmation d'ici quelques instants. On prépare vos pépites avec amour !
        </div>

        <div className="pt-6 space-y-4">
          <Link 
            href="/merch" 
            className="w-full py-5 bg-bb-ink text-bb-cream rounded-full font-black uppercase tracking-[.3em] text-[10px] hover:bg-bb-rose transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <ShoppingBag className="w-4 h-4" /> Retour à la boutique
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-bb-ink/40 hover:text-bb-rose transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            Retour à l'accueil <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
