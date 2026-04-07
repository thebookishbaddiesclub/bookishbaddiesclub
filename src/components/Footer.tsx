"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";

const TikTokIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-bb-beige pt-20 pb-10 px-6 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {/* Colonne 1: Navigation */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[.4em] font-black text-bb-ink/40">Découvrir</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Accueil</Link></li>
              <li><Link href="/agenda" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Agenda</Link></li>
              <li><Link href="/lectures" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Lectures</Link></li>
              <li><Link href="/merch" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Merch</Link></li>
            </ul>
          </div>

          {/* Colonne 2: Légal & RSE */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[.4em] font-black text-bb-ink/40">Informations</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/mentions-legales" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Mentions Légales</Link></li>
              <li><Link href="/cgv" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">CGV</Link></li>
              <li><Link href="/confidentialite" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Politique de Confidentialité</Link></li>
              <li><Link href="/engagements" className="text-sm font-medium text-bb-ink/70 hover:text-bb-rose transition-colors">Nos Engagements (RSE)</Link></li>
            </ul>
          </div>

          {/* Colonne 3: Réseaux */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[.4em] font-black text-bb-ink/40">Suivre l'aventure</h4>
            <div className="flex gap-6">
              <a href="https://www.instagram.com/bookishbaddiesclub/" target="_blank" rel="noopener noreferrer" className="text-bb-ink/60 hover:text-bb-rose transition-colors p-3 bg-white/30 rounded-full">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@bookishbaddiesclub" target="_blank" rel="noopener noreferrer" className="text-bb-ink/60 hover:text-bb-rose transition-colors p-3 bg-white/30 rounded-full">
                <TikTokIcon className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-bb-ink/50 leading-relaxed max-w-xs font-medium italic">
              Rejoignez une communauté de lectrices passionnées à Perpignan & Montpellier.
            </p>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="pt-10 border-t border-bb-ink/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest font-bold text-bb-ink/30">
            © 2026 The Bookish Baddies Club
          </p>
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-[10px] uppercase tracking-widest font-bold text-bb-ink/20 hover:text-bb-ink transition-colors">
              Accès Admin
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-bb-rose rounded-full"></span>
              <span className="text-[9px] font-black uppercase tracking-widest text-bb-ink/40">Made with Love</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
