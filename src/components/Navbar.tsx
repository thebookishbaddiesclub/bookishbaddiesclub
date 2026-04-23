"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Calendar, BookOpen, Home, Instagram, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                className="w-auto h-[70px] md:h-[110px]"
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
                  className="h-6 w-auto"
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
              <Image src="/logo-club.png" alt="Logo" width={140} height={60} className="h-8 w-auto" />
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

              <div className="mt-10 flex gap-5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-full bg-bb-beige/30 text-bb-ink hover:text-bb-rose transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </nav>

            <div className="pb-10 flex justify-center opacity-20">
              <Image src="/logo-club.png" alt="Logo" width={100} height={44} className="h-8 w-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
