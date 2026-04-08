import FadeIn from "@/components/FadeIn";
import BookCard from "@/components/BookCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LecturesPage() {
  const { data: booksData } = await supabase.from("books").select("*").order("created_at", { ascending: true });
  const books = booksData || [];
  
  const perpignanBooks = books.filter((b: any) => b.city === "Perpignan");
  const montpellierBooks = books.filter((b: any) => b.city === "Montpellier");

  const isEmpty = books.length === 0;

  return (
    <div className="py-12 space-y-32">
      {/* Title Section */}
      <FadeIn className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-playfair text-bb-ink mb-6">Nos Lectures Communes</h1>
        <p className="text-sm font-sans tracking-[.2em] text-bb-rose uppercase font-bold">
          Notre prochaine obsession littéraire.
        </p>
        <div className="h-[1px] w-24 bg-bb-gold/40 mx-auto mt-10"></div>
      </FadeIn>

      {isEmpty ? (
        <FadeIn delay={0.3} className="text-center py-20">
          <p className="text-bb-ink/40 font-serif italic text-2xl tracking-wide">
            Bientôt de nouvelles pépites ici...
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-bb-gold/30 mx-1"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-bb-gold/30 mx-1"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-bb-gold/30 mx-1"></div>
          </div>
        </FadeIn>
      ) : (
        <>
          {/* Perpignan Section */}
          {perpignanBooks.length > 0 && (
            <section className="space-y-12">
              <FadeIn direction="right" className="flex items-center gap-6">
                <h2 className="text-3xl md:text-4xl font-serif text-bb-rose shrink-0 italic">Perpignan</h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-bb-beige to-transparent"></div>
              </FadeIn>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                {perpignanBooks.map((book: any, index: number) => (
                  <BookCard 
                    key={book.id} 
                    title={book.title} 
                    author={book.author} 
                    coverUrl={book.coverUrl}
                    month={book.month}
                    delay={index * 0.1} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Montpellier Section */}
          {montpellierBooks.length > 0 && (
            <section className="space-y-12">
              <FadeIn direction="right" className="flex items-center gap-6">
                <h2 className="text-3xl md:text-4xl font-serif text-bb-rose shrink-0 italic">Montpellier</h2>
                <div className="h-[1px] w-full bg-gradient-to-r from-bb-beige to-transparent"></div>
              </FadeIn>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                {montpellierBooks.map((book: any, index: number) => (
                  <BookCard 
                    key={book.id} 
                    title={book.title} 
                    author={book.author} 
                    coverUrl={book.coverUrl}
                    month={book.month}
                    delay={index * 0.1} 
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Trait de fin élégant */}
      <FadeIn delay={0.5} className="flex justify-center pt-20">
        <div className="h-20 w-[1px] bg-gradient-to-b from-bb-gold/60 to-transparent"></div>
      </FadeIn>
    </div>
  );
}
