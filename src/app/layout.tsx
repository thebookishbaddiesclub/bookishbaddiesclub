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
    <html lang="fr" className={`${montserrat.variable} ${abril.variable} ${playfair.variable} scroll-smooth`}>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className="bg-bb-cream text-bb-ink font-sans antialiased">
        <Navbar />
        
        <main className="flex-grow pt-[195px] md:pt-[210px] pb-12 px-6 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
