"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BookOpen, Sparkles } from "lucide-react";

interface FlipCardProps {
  frontIcon: React.ElementType;
  title: string;
  description: string;
  footerText: string;
  actionLink?: string;
  actionText?: string;
}

function FlipCard({ 
  frontIcon: Icon, 
  title, 
  description, 
  footerText, 
  actionLink, 
  actionText 
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full aspect-[4/5] max-w-[340px] mx-auto cursor-pointer"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 50, damping: 15 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-16 h-16 bg-bb-ink/5 rounded-full flex items-center justify-center mb-8">
            <Icon className="w-7 h-7 text-bb-ink/70" strokeWidth={1} />
          </div>
          <h2 className="text-2xl font-serif text-bb-ink tracking-tight">{title}</h2>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 w-full h-full bg-bb-cream/95 backdrop-blur-xl border border-bb-beige shadow-2xl rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm md:text-base text-bb-ink/80 font-sans leading-relaxed mb-6 font-medium">
            {description}
          </p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-bb-accent font-bold mb-6">
            — {footerText}
          </p>

          {actionLink && actionText && (
            <a 
              href={actionLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-3 bg-bb-ink text-bb-cream rounded-full font-sans font-semibold text-xs tracking-wider uppercase hover:bg-bb-accent transition-colors shadow-md"
            >
              {actionText}
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const res = await fetch("/api/admin");
        const data = await res.json();
        if (data.lectures && data.lectures.books) {
          const bookTitles = data.lectures.books.map((b: any) => b.title);
          setTitles(bookTitles);
        }
      } catch (err) {
        console.error("Failed to fetch titles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTitles();
  }, []);

  const marqueeItems = titles.length > 0 ? titles : ["À venir : Nos prochaines pépites littéraires..."];

  return (
    <div className="flex flex-col items-center justify-center py-4 relative overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[40vh] text-center w-full relative z-10 px-4">
        <FadeIn direction="down" className="mb-0">
          <h1 className="text-3xl md:text-5xl font-playfair tracking-tight text-bb-ink mb-6 !leading-[1.2] max-w-3xl mx-auto italic">
            Ici, on lit, on crée et<br />on s’évade le temps d’une<br />soirée ou d’un week-end.
          </h1>
          <p className="text-[11px] md:text-xs text-bb-ink/90 leading-relaxed font-sans mt-2 flex items-center justify-center gap-2 tracking-[0.3em] font-black uppercase">
            📍 PERPIGNAN & MONTPELLIER
          </p>
        </FadeIn>

        {/* Marquee Section */}
        <FadeIn delay={0.2} className="w-full mt-10 overflow-hidden border-y border-bb-beige/30 py-4 bg-white/5 backdrop-blur-sm">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 px-6">
                <span className="flex items-center gap-3 text-[10px] font-sans tracking-[0.25em] text-bb-ink/50 uppercase font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-blink-green"></span>
                  EN CE MOMENT
                </span>
                {marqueeItems.map((item, idx) => (
                  <span key={idx} className="text-xs md:text-sm font-sans tracking-[0.2em] text-bb-ink/70 font-medium uppercase">
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Elegant Gold Vertical Line */}
        <FadeIn delay={0.4} className="my-10">
          <div className="h-20 w-[1px] bg-gradient-to-b from-bb-gold/80 to-transparent"></div>
        </FadeIn>

        {/* Flip Cards Section */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 relative z-10 px-6">
          <FlipCard 
            frontIcon={BookOpen}
            title="Le Bookclub Mensuel"
            description="Une lecture commune, des échanges passionnés, le choix collectif de nos futures pépites."
            footerText="Gratuit"
            actionLink="https://tally.so/r/jaoWo6"
            actionText="Rejoindre la liste d'attente"
          />
          <FlipCard 
            frontIcon={Sparkles}
            title="Les Événements"
            description="Watch Parties, Brunchs, Booknights, Chasses aux livres. Des moments hors du temps, pour découvrir de nouvelles lectures ou essayer de nouvelles activités."
            footerText="Ouvert à tout le monde — Payant"
          />
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="w-full max-w-4xl mx-auto py-32 px-6 text-center mt-12">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-bb-beige/40 to-transparent mb-24"></div>
        
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-playfair text-bb-rose mb-10 leading-tight">
            Le Bookish Baddies Club, c’est plus qu’un bookclub
          </h2>
          <p className="text-lg md:text-xl text-bb-ink/80 font-sans leading-relaxed max-w-2xl mx-auto text-balance">
            C’est un espace pour se retrouver entre lectrices, autour de <strong className="font-bold text-bb-ink">livres qui font battre nos cœurs</strong> et de <strong className="font-bold text-bb-ink" >moments qui font du bien</strong> : soirées lecture, ateliers créatifs, week-ends cosy, échanges passionnés.<br /><br />
            En partenariat avec des <strong className="font-bold text-bb-ink">librairies locales</strong>, on crée ensemble des instants de lecture et de douceur, loin du quotidien.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.3} className="mt-24">
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-bb-ink/30 font-black mb-12">Nos Partenaires</h3>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 text-xs md:text-sm font-sans tracking-[0.2em] text-bb-ink/60 font-medium uppercase">
            <span>Le Coin de Mnemosyne</span>
            <span className="text-bb-beige/50 text-[8px]">/</span>
            <span>La Bouquetière</span>
            <span className="text-bb-beige/50 text-[8px]">/</span>
            <span>Ici Tout Romance</span>
          </div>
        </FadeIn>
      </section>
      
    </div>
  );
}
