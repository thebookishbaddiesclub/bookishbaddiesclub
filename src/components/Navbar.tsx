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
      // On déclenche l'effet dès qu'on dépasse 20px de scroll
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[60] flex flex-col items-center transition-all duration-500",
      isScrolled ? "py-2 bg-white/90 backdrop-blur-md shadow-md" : "py-6 bg-transparent"
    )}>
      {/* LOGO : Il rétrécit quand on scroll */}
      <Link href="/" className="mb-4">
        <Image 
          src="/logo-club.png" 
          alt="Logo" 
          width={400} 
          height={180} 
          className={cn(
            "w-auto transition-all duration-500",
            isScrolled ? "h-[60px] md:h-[80px]" : "h-[100px] md:h-[180px]"
          )} 
          priority 
        />
      </Link>
      
      {/* NAV BAR : Elle change de style quand on scroll */}
      <nav className={cn(
        "flex items-center bg-white/80 border border-bb-beige rounded-full transition-all duration-500",
        isScrolled ? "px-6 py-2 gap-6" : "px-10 py-4 gap-10"
      )}>
        <ul className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] uppercase tracking-widest hover:text-bb-rose">Accueil</Link>
          <Link href="/agenda" className="text-[10px] uppercase tracking-widest hover:text-bb-rose">Agenda</Link>
          <Link href="/lectures" className="text-[10px] uppercase tracking-widest hover:text-bb-rose">Lectures</Link>
          <Link href="/merch" className="text-[10px] uppercase tracking-widest hover:text-bb-rose">Merch</Link>
        </ul>
        
        {/* Menu Mobile */}
        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6 text-bb-ink" />
        </button>
      </nav>
    </header>
  );
}
