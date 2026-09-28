"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Star } from "lucide-react";

interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  month?: string;
  city?: string;
  review?: string;
  className?: string;
  delay?: number;
  resume?: string;
  lien_place_des_libraires?: string;
  rating?: number | null;
}

export default function BookCard({ title, author, coverUrl, month, city, review, className, delay = 0, resume, lien_place_des_libraires, rating }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dateCity = [month, city].filter(Boolean).join(" · ");
  const score = rating != null && Number.isFinite(Number(rating))
    ? Math.min(5, Math.max(0, Number(rating))) : null;
  const ratingStars = score == null ? null : (
    <div className="mt-2 flex flex-wrap items-center gap-2" role="img" aria-label={`Note du club : ${score.toLocaleString("fr-FR")} sur 5`}>
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.round(Math.max(0, Math.min(1, score - index)) * 100);
          return <span key={index} className="relative inline-block h-5 w-5">
            <Star className="absolute inset-0 h-5 w-5 text-bb-gold/35" strokeWidth={1.5} />
            <Star className="absolute inset-0 h-5 w-5 text-bb-gold fill-current" strokeWidth={1.5} style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }} />
          </span>;
        })}
      </span>
      <span className="text-xs font-medium text-bb-ink/60" aria-hidden="true">{score.toLocaleString("fr-FR")} / 5</span>
    </div>
  );

  useEffect(() => {
    if (!isModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  return (
    <>
    <FadeIn delay={delay} className={cn("group cursor-pointer", className)}>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-bb-beige border border-bb-beige/50 shadow-sm transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-2"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Couverture de ${title}`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center border-2 border-dashed border-bb-ink/5 rounded-2xl transition-colors duration-300 group-hover:border-bb-accent/20 group-hover:bg-bb-cream/30">
            <span className="font-serif text-bb-ink/30 text-sm tracking-wider uppercase">Couverture</span>
          </div>
        )}
        
        {/* Badge du mois */}
        {month && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-bb-cream/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-bb-rose border border-bb-rose/20 shadow-sm">
              {month}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-bb-ink/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
          <span className="text-bb-cream text-xs font-sans tracking-widest uppercase font-bold">Voir les détails</span>
        </div>
      </div>
      <div className="mt-4 px-1">
        <h3 className="font-serif text-lg leading-tight group-hover:text-bb-rose transition-colors duration-300 line-clamp-1">{title}</h3>
        <p className="text-[10px] text-bb-ink/60 mt-1 font-bold uppercase tracking-widest">{author}</p>
        {ratingStars}
      </div>
    </FadeIn>

    {isModalOpen && createPortal(
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-bb-ink/50 backdrop-blur-sm" />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-6xl max-h-[90dvh] overflow-y-auto md:overflow-hidden bg-bb-cream rounded-3xl border border-bb-beige shadow-2xl md:flex"
          >
            <button autoFocus aria-label="Fermer la fiche du livre"
              onClick={() => setIsModalOpen(false)}
              className="sticky md:absolute top-3 float-right right-3 z-10 p-3 bg-bb-cream/95 rounded-full text-bb-ink hover:text-bb-rose shadow-sm">
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[45dvh] md:h-auto md:w-2/5 md:min-h-[65vh] bg-bb-beige/40 shrink-0">
              {coverUrl ? (
                <Image src={coverUrl} alt={`Couverture de ${title}`} fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-contain p-5 md:p-8" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-bb-ink/40">Couverture à venir</div>
              )}
            </div>
            <div className="w-full min-w-0 p-6 sm:p-8 md:p-10 md:pr-16 md:max-h-[90dvh] md:overflow-y-auto space-y-6">
              <header>
                <h2 className="text-3xl lg:text-4xl font-serif text-bb-ink leading-tight">{title}</h2>
                <p className="mt-3 text-sm text-bb-rose font-bold uppercase tracking-widest">{author}</p>
                {dateCity && <p className="mt-4 text-xs text-bb-ink/60 font-bold uppercase tracking-widest">{dateCity}</p>}
                {ratingStars}
              </header>
              {review && <section>
                <h3 className="font-serif text-xl text-bb-rose mb-3">L’avis du bookclub</h3>
                <p className="text-sm text-bb-ink/80 leading-relaxed whitespace-pre-wrap break-words">{review}</p>
              </section>}
              {lien_place_des_libraires && (
                <a href={lien_place_des_libraires} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-5 bg-bb-ink text-bb-cream rounded-2xl font-bold text-sm text-center hover:bg-bb-rose transition-colors">
                  Je le réserve chez mon libraire
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>
              )}
              <section className="pt-6 border-t border-bb-beige">
                <h3 className="font-serif text-xl text-bb-ink mb-3">Résumé</h3>
                <p className="text-sm text-bb-ink/80 leading-relaxed whitespace-pre-wrap break-words">
                  {resume || "Le résumé de ce livre arrive très bientôt…"}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>, document.body)}
    </>
  );
}
