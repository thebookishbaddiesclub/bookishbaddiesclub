"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  month?: string;
  className?: string;
  delay?: number;
  resume?: string;
  lien_place_des_libraires?: string;
}

export default function BookCard({ title, author, coverUrl, month, className, delay = 0, resume, lien_place_des_libraires }: BookCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
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
      </div>
    </FadeIn>

    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-bb-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-bb-cream rounded-[2rem] border border-bb-beige shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-bb-cream/80 backdrop-blur-md rounded-full text-bb-ink hover:text-bb-rose hover:bg-white transition-all shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cover Image */}
            <div className="relative w-full md:w-2/5 aspect-[3/4] md:aspect-auto bg-bb-beige shrink-0">
              {coverUrl ? (
                <Image src={coverUrl} alt={title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <span className="font-serif text-bb-ink/30 text-sm uppercase tracking-widest">Couverture</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col p-8 md:p-10 overflow-y-auto w-full">
              <div className="mb-6">
                <h2 className="text-3xl font-serif text-bb-ink mb-2 leading-tight">{title}</h2>
                <p className="text-sm text-bb-rose font-bold uppercase tracking-widest">{author}</p>
                {month && <p className="text-[10px] text-bb-ink/40 font-black uppercase tracking-[.2em] mt-3">{month}</p>}
              </div>

              <div className="flex-grow">
                <div className="w-8 h-[1px] bg-bb-gold/60 mb-6"></div>
                <div className="text-sm text-bb-ink/80 leading-relaxed font-medium whitespace-pre-wrap">
                  {resume ? resume : <span className="italic text-bb-ink/40">Le résumé de ce livre arrive très bientôt...</span>}
                </div>
              </div>

              {lien_place_des_libraires && (
                <div className="mt-10 pt-6 border-t border-bb-beige/50">
                  <a 
                    href={lien_place_des_libraires}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-bb-ink text-bb-cream rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-bb-rose transition-all shadow-xl active:scale-95 group"
                  >
                    Je le réserve dans ma librairie
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
