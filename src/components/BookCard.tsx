"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";

interface BookCardProps {
  title: string;
  author: string;
  coverUrl?: string;
  month?: string;
  className?: string;
  delay?: number;
}

export default function BookCard({ title, author, coverUrl, month, className, delay = 0 }: BookCardProps) {
  return (
    <FadeIn delay={delay} className={cn("group cursor-pointer", className)}>
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-bb-beige border border-bb-beige/50 shadow-sm transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:-translate-y-2">
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
  );
}
