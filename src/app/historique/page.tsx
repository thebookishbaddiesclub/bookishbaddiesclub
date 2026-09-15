import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HistoriquePage({ searchParams }: { searchParams: Promise<{ city?: string }> }) {
  const city = (await searchParams).city || "Toutes";
  const query = supabase.from("reading_history").select("*").order("created_at", { ascending: false });
  if (city !== "Toutes") query.eq("city", city);
  const { data } = await query;
  const books = data || [];
  return <div className="py-12 space-y-12"><header className="text-center"><h1 className="text-5xl font-serif italic text-bb-ink">Historique des lectures</h1><p className="mt-4 text-bb-ink/60">Les pépites déjà découvertes ensemble.</p></header><div className="flex justify-center gap-3">{["Toutes", "Perpignan", "Montpellier"].map(item => <a key={item} href={item === "Toutes" ? "/historique" : `/historique?city=${item}`} className={`rounded-full px-5 py-2 text-xs font-bold ${city === item ? "bg-bb-ink text-bb-cream" : "bg-white border border-bb-beige"}`}>{item}</a>)}</div><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{books.map((book: any) => <article key={book.id} className="overflow-hidden rounded-[2rem] border border-bb-beige bg-white/60">{book.cover_url && <div className="relative aspect-[3/4]"><Image src={book.cover_url} alt="" fill className="object-cover" /></div>}<div className="p-6"><p className="text-xs uppercase tracking-widest text-bb-rose">{book.city} · {book.month}</p><h2 className="mt-2 font-serif text-2xl">{book.title}</h2><p className="text-sm text-bb-ink/60">{book.author}</p>{book.rating != null && <p className="mt-3 text-bb-gold">{"★".repeat(Math.round(book.rating))}{"☆".repeat(5 - Math.round(book.rating))} <span className="text-xs text-bb-ink/50">{book.rating}/5</span></p>}<p className="mt-4 text-sm text-bb-ink/70">{book.review}</p></div></article>)}</div>{books.length === 0 && <p className="py-20 text-center font-serif italic text-2xl text-bb-ink/40">L’historique sera bientôt rempli.</p>}</div>;
}
