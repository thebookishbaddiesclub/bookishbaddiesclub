import type { Metadata } from "next";
import { Montserrat, Abril_Fatface, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const abril = Abril_Fatface({ weight: "400", subsets: ["latin"], variable: "--font-abril" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "The Bookish Baddies Club",
  description: "A modern, cozy book club application.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${abril.variable} ${playfair.variable}`}>
      <body className="flex flex-col min-h-screen bg-bb-cream text-bb-ink font-sans">
        {/* Masque de dégradé et flou au scroll (Smooth Fade Effect) */}
        <div className="fixed top-0 left-0 right-0 h-80 bg-gradient-to-b from-bb-cream via-bb-cream/90 to-transparent pointer-events-none z-40 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
        
        <Navbar />
        <main className="flex-grow pt-[305px] pb-12 px-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
