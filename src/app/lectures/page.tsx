import FadeIn from "@/components/FadeIn";
import BookCard from "@/components/BookCard";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LecturesPage() {
  let books: any[] = [];
  let history: any[] = [];
  
  try {
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    books = data || [];
    history = books.filter((book: any) => book.archived);
    books = books.filter((book: any) => !book.archived);
  } catch (e) {
    console.warn("Supabase not available during build", e);
  }
  
  const isEmpty = books.length === 0 && history.length === 0;

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
          {books.length > 0 && <section className="space-y-12"><FadeIn direction="right" className="flex items-center gap-6"><h2 className="text-3xl md:text-4xl font-serif text-bb-rose shrink-0 italic">Lectures communes en cours</h2><div className="h-[1px] w-full bg-gradient-to-r from-bb-beige to-transparent"></div></FadeIn>{["Montpellier", "Perpignan"].map(city => { const cityBooks = books.filter((book: any) => book.city === city); return cityBooks.length ? <div key={city} className="space-y-5"><h3 className="text-2xl font-serif italic text-bb-ink">Lecture commune — {city}</h3><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{cityBooks.map((book: any, index: number) => <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl} month={book.month} resume={book.resume} lien_place_des_libraires={book.lien_place_des_libraires} delay={index * 0.1} />)}</div></div> : null; })}</section>}

          {history.length > 0 && <section className="space-y-12"><FadeIn direction="right" className="flex items-center gap-6"><h2 className="text-3xl md:text-4xl font-serif text-bb-ink italic">Lectures passées</h2><div className="h-[1px] w-full bg-gradient-to-r from-bb-beige to-transparent"></div></FadeIn><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{history.map((book: any, index: number) => <BookCard key={book.id} title={book.title} author={book.author} coverUrl={book.coverUrl || book.cover_url} month={`${book.month} · ${book.city}`} resume={book.review || book.resume} rating={book.rating} delay={index * 0.08} />)}</div></section>}

        </>
      )}

      {/* Trait de fin élégant */}
      <FadeIn delay={0.5} className="flex justify-center pt-20">
        <div className="h-20 w-[1px] bg-gradient-to-b from-bb-gold/60 to-transparent"></div>
      </FadeIn>
    </div>
  );
}
