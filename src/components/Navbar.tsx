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
      setIsScrolled(window.scrollY > 50);
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
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[60] flex flex-col items-center transition-all duration-700 ease-in-out",
      "pointer-events-none",
      isScrolled ? "py-3" : "py-6"
    )}>
      {/* LOGO */}
      <Link href="/" className="mb-4 pointer-events-auto">
        <Image 
          src="/logo-club.png" 
          alt="Logo" 
          width={500} 
          height={220} 
          className={cn(
            "w-auto transition-all duration-700 ease-in-out origin-top",
            isScrolled ? "h-[60px] md:h-[80px] drop-shadow-sm" : "h-[100px] md:h-[180px]"
          )} 
          priority 
        />
      </Link>
      
      {/* NAV BAR */}
      <nav className={cn(
        "flex items-center backdrop-blur-xl border border-bb-beige/30 rounded-full transition-all duration-700 ease-in-out pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        isScrolled 
          ? "px-8 py-2.5 gap-8 bg-white/40 scale-95" 
          : "px-12 py-4 gap-12 bg-white/60"
      )}>
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-bb-rose",
                  isActive ? "text-bb-rose" : "text-bb-ink/60"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 transition-transform duration-300", isActive && "scale-110")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </ul>
        
        {/* Menu Mobile Button */}
        <button className="md:hidden p-2 text-bb-ink" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-7 h-7" />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-bb-cream flex flex-col pointer-events-auto"
          >
            <div className="flex justify-between items-center p-6 border-b border-bb-beige/20">
              <span className="font-abril text-2xl text-bb-rose">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-bb-ink">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <nav className="flex-grow flex flex-col justify-center items-center gap-8 p-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 text-xl uppercase tracking-widest font-bold transition-all duration-300",
                      isActive ? "text-bb-rose scale-110" : "text-bb-ink/70"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              
              <div className="mt-12 flex gap-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-4 rounded-full bg-bb-beige/20 text-bb-ink">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </nav>
            
            <div className="p-12 flex justify-center">
               <Image src="/logo-club.png" alt="Logo" width={150} height={60} className="opacity-30 h-auto w-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
