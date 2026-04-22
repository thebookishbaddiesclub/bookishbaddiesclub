"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingBag, Calendar, BookOpen, Home, Instagram, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Accueil", path: "/", icon: Home },
  { name: "Agenda", path: "/agenda", icon: Calendar },
  { name: "Lectures", path: "/lectures", icon: BookOpen },
  { name: "Merch", path: "/merch", icon: ShoppingBag },
];

const SOCIAL_LINKS = [
  { 
    name: "Instagram", 
    href: "https://www.instagram.com/bookishbaddiesclub/", 
    icon: (props: any) => <Instagram {...props} /> 
  },
  { 
    name: "TikTok", 
    href: "https://www.tiktok.com/@bookishbaddiesclub?_r=1&_t=ZN-95LgAoRawQI", 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/>
      </svg>
    )
  },
  { 
    name: "Discord", 
    href: "https://discord.gg/7RBs5eDw", 
    icon: (props: any) => (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01a13.525 13.525 0 0 0 10.986 0a.07.07 0 0 1 .077.01c.124.097.248.195.372.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
      </svg>
    )
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY > lastScroll && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScroll = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-[60] flex flex-col items-center transition-all duration-500 ease-in-out will-change-transform",
        isScrolled ? "py-2 bg-white/80 backdrop-blur-xl border-b border-bb-beige shadow-sm" : "pt-4 pb-4 bg-transparent border-transparent",
        !isVisible ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}>
        <Link 
          href="/" 
          className={cn(
            "pointer-events-auto shrink-0 group flex items-center transition-all duration-300 ease-in-out",
            isScrolled ? "mb-2" : "mb-5"
          )}
        >
          <Image 
            src="/logo-club.png" 
            alt="Logo" 
            width={400} 
            height={180} 
            className={cn(
              "w-auto object-contain transition-all duration-300 ease-in-out transform origin-top",
              isScrolled ? "h-[50px] md:h-[90px] scale-100" : "h-[80px] md:h-[180px]"
            )} 
            priority
          />
        </Link>
        
        <nav className={cn(
          "pointer-events-auto bg-white/70 backdrop-blur-xl border shadow-xl flex items-center transition-all duration-300 ease-in-out relative z-[100]",
          "w-[90%] md:w-auto rounded-full justify-between md:justify-center px-4 md:px-10",
          isScrolled ? "py-2 gap-4 h-14 md:h-16" : "py-3 md:py-5 gap-10 h-16 md:h-24"
        )}>
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.path;
              const Icon = link.icon;
              return (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={cn(
                      "flex items-center gap-2 text-[10px] md:text-xs font-normal uppercase tracking-[.25em] transition-all duration-200 group relative py-1",
                      isActive ? "text-bb-ink" : "text-bb-ink/50 hover:text-bb-ink"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", isActive && "text-bb-accent")} />
                    <span>{link.name}</span>
                    {isActive && <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-bb-accent rounded-full" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="h-4 w-[1px] bg-bb-beige hidden md:block"></div>

          <div className="hidden md:flex items-center gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-bb-ink/30 hover:text-bb-accent transition-all duration-200">
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <div className="flex md:hidden w-full justify-between items-center px-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-bb-ink/50">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-bb-ink"><Menu className="w-5 h-5" /></button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 z-[100] bg-bb-ink/40 backdrop-blur-sm md:hidden" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed top-0 right-0 bottom-0 w-64 bg-bb-cream z-[110] shadow-2xl flex flex-col md:hidden border-l border-bb-beige">
              <div className="flex justify-end p-6">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-bb-ink rounded-full bg-white/50 border border-bb-beige"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-4 flex flex-col gap-8">
                <ul className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <li key={link.path}>
                      <Link href={link.path} className={cn("flex items-center gap-4 text-xs font-bold uppercase tracking-[.2em]", pathname === link.path ? "text-bb-rose" : "text-bb-ink")}>
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
