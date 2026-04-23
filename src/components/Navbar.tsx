"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Calendar, BookOpen, Home, Instagram, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Icônes réseaux sociaux (non disponibles dans lucide)
const TikTokIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.032.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/agenda", label: "Agenda", icon: Calendar },
    { href: "/lectures", label: "Lectures", icon: BookOpen },
    { href: "/merch", label: "Merch", icon: ShoppingBag },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] flex flex-col items-center pointer-events-none">

      {/* LOGO — visible uniquement tout en haut, disparaît au scroll */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="pt-5 pb-2 pointer-events-auto"
          >
            <Link href="/">
              <Image
                src="/logo-club.png"
                alt="Bookish Baddies Club"
                width={500}
                height={220}
                className="w-auto h-[110px] md:h-[150px]"
                priority
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAV PILL — compacte et flottante */}
      <motion.nav
        layout
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "flex items-center backdrop-blur-xl border border-bb-beige/30 rounded-full pointer-events-auto",
          "shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-500",
          isScrolled
            ? "mt-4 px-5 py-2.5 bg-white/80 gap-3"
            : "px-8 py-3 bg-white/55 gap-8"
        )}
      >
        {/* Mini logo intégré dans la pill au scroll */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, maxWidth: 0 }}
              animate={{ opacity: 1, maxWidth: 120 }}
              exit={{ opacity: 0, maxWidth: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden shrink-0"
            >
              <Link href="/" className="block pr-1">
                <Image
                  src="/logo-club.png"
                  alt="BB"
                  width={200}
                  height={100}
                  className="h-11 w-auto"
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Séparateur vertical au scroll */}
        {isScrolled && (
          <div className="hidden md:block h-4 w-px bg-bb-beige/60 shrink-0" />
        )}

        {/* Liens desktop */}
        <ul className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold transition-all duration-300 hover:text-bb-rose",
                  isActive ? "text-bb-rose" : "text-bb-ink/55"
                )}
              >
                <Icon className={cn("w-3 h-3 shrink-0 transition-transform duration-300", isActive && "scale-110")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </ul>

        {/* Séparateur + Icônes réseaux sociaux */}
        <div className="hidden md:flex items-center gap-3">
          <div className="h-4 w-px bg-bb-beige/50" />
          <a
            href="https://www.instagram.com/bookishbaddiesclub/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bb-ink/40 hover:text-bb-rose transition-colors"
            title="Instagram"
          >
            <Instagram className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.tiktok.com/@bookishbaddiesclub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bb-ink/40 hover:text-bb-rose transition-colors"
            title="TikTok"
          >
            <TikTokIcon />
          </a>
          <a
            href="https://discord.gg/yrzPjg4FuW"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bb-ink/40 hover:text-bb-rose transition-colors"
            title="Discord"
          >
            <DiscordIcon />
          </a>
        </div>

        {/* Bouton burger mobile */}
        <button
          className="md:hidden p-1.5 text-bb-ink/70 hover:text-bb-rose transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </motion.nav>

      {/* Menu Mobile — overlay plein écran */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] bg-bb-cream flex flex-col pointer-events-auto"
          >
            <div className="flex justify-between items-center px-6 py-5 border-b border-bb-beige/20">
              <Image src="/logo-club.png" alt="Logo" width={200} height={88} className="h-12 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-bb-ink hover:text-bb-rose transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>

            <nav className="flex-grow flex flex-col justify-center items-center gap-7 p-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 text-2xl font-serif tracking-wide transition-all duration-200",
                      isActive ? "text-bb-rose" : "text-bb-ink/70 hover:text-bb-rose"
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="mt-10 flex gap-4">
                <a
                  href="https://www.instagram.com/bookishbaddiesclub/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-full bg-bb-beige/30 text-bb-ink hover:text-bb-rose transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@bookishbaddiesclub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-full bg-bb-beige/30 text-bb-ink hover:text-bb-rose transition-colors"
                  title="TikTok"
                >
                  <TikTokIcon />
                </a>
                <a
                  href="https://discord.gg/yrzPjg4FuW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-full bg-bb-beige/30 text-bb-ink hover:text-bb-rose transition-colors"
                  title="Discord"
                >
                  <DiscordIcon />
                </a>
              </div>
            </nav>

            <div className="pb-10 flex justify-center opacity-20">
              <Image src="/logo-club.png" alt="Logo" width={150} height={66} className="h-10 w-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
