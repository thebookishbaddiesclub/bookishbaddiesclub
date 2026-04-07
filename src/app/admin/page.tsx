"use client";

import { useState, useEffect } from "react";
import FadeIn from "@/components/FadeIn";
import { 
  Plus, Book, ShoppingBag, Upload, Check, Trash2, Edit2, 
  Users, BarChart3, BookOpen, LogOut, LayoutDashboard 
} from "lucide-react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // Data lists
  const [books, setBooks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for Book
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookMonth, setBookMonth] = useState("");
  const [bookCity, setBookCity] = useState("Perpignan");
  const [bookImage, setBookImage] = useState<File | null>(null);
  const [currentBookCover, setCurrentBookCover] = useState("");

  // Form states for Merch
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodColors, setProdColors] = useState("");
  const [prodSizes, setProdSizes] = useState("");
  const [prodPriceId, setProdPriceId] = useState("");
  const [prodImage, setProdImage] = useState<File | null>(null);
  const [currentProdImage, setCurrentProdImage] = useState("");

  const fetchData = async () => {
    const res = await fetch("/api/admin");
    const data = await res.json();
    if (data.lectures) setBooks(data.lectures.books || []);
    if (data.merch) setProducts(data.merch.products || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    // We could call an API to clear the cookie, but for now simple redirect 
    // since the middleware will block /admin if the cookie is gone or invalid.
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  const resetBookForm = () => {
    setEditingId(null);
    setBookTitle(""); setBookAuthor(""); setBookMonth(""); setBookCity("Perpignan"); setBookImage(null); setCurrentBookCover("");
  };

  const resetProdForm = () => {
    setEditingId(null);
    setProdName(""); setProdPrice(""); setProdDesc(""); setProdColors(""); setProdSizes(""); setProdPriceId(""); setProdImage(null); setCurrentProdImage("");
  };

  const handleAddOrEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let imageUrl = currentBookCover;
    if (bookImage) {
      const newBlob = await upload(bookImage.name, bookImage, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      imageUrl = newBlob.url;
    }

    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "lectures",
        id: editingId,
        data: { title: bookTitle, author: bookAuthor, month: bookMonth, city: bookCity, coverUrl: imageUrl }
      })
    });

    if (res.ok) {
      setMessage(editingId ? "Lecture modifiée !" : "Lecture ajoutée !");
      resetBookForm();
      fetchData();
    } else {
      setMessage("Erreur.");
    }
    setLoading(false);
  };

  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let imageUrl = currentProdImage;
    if (prodImage) {
      const newBlob = await upload(prodImage.name, prodImage, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      imageUrl = newBlob.url;
    }

    const method = editingId ? "PUT" : "POST";
    const res = await fetch("/api/admin", {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "merch",
        id: editingId,
        data: { 
          name: prodName, 
          price: parseFloat(prodPrice), 
          priceId: prodPriceId,
          description: prodDesc, 
          colors: prodColors.split(",").map(c => c.trim()).filter(c => c !== ""), 
          sizes: prodSizes.split(",").map(s => s.trim()).filter(s => s !== ""),
          imageUrl: imageUrl 
        }
      })
    });

    if (res.ok) {
      setMessage(editingId ? "Produit modifié !" : "Produit ajouté !");
      resetProdForm();
      fetchData();
    } else {
      setMessage("Erreur.");
    }
    setLoading(false);
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    if (!confirm(`Êtes-vous sûre de vouloir supprimer "${name}" ?`)) return;

    const res = await fetch(`/api/admin?type=${type}&id=${id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      setMessage("Élément supprimé.");
      fetchData();
    } else {
      setMessage("Erreur suppression.");
    }
  };

  const startEditBook = (book: any) => {
    setEditingId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookMonth(book.month);
    setBookCity(book.city);
    setCurrentBookCover(book.coverUrl || "");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const startEditProduct = (prod: any) => {
    setEditingId(prod.id);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdDesc(prod.description);
    setProdColors((prod.colors || []).join(", "));
    setProdSizes((prod.sizes || []).join(", "));
    setProdPriceId(prod.priceId || "");
    setCurrentProdImage(prod.imageUrl || "");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-16 px-6">
      {/* Header */}
      <FadeIn className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-bb-beige pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-bb-rose">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] uppercase font-black tracking-[.4em]">Administration</span>
          </div>
          <h1 className="text-5xl font-serif text-bb-ink italic">Tableau de Bord</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {message && (
            <div className="bg-white/80 backdrop-blur-md text-bb-rose px-6 py-3 rounded-full border border-bb-rose/20 flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest shadow-sm animate-in fade-in slide-in-from-right-4">
              <Check className="w-3.5 h-3.5" /> {message}
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-bb-beige rounded-full text-bb-ink/60 hover:text-bb-rose hover:border-bb-rose/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Quitter
          </button>
        </div>
      </FadeIn>

      {/* Stats Section */}
      <FadeIn delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-bb-beige shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-bb-rose/10 rounded-2xl text-bb-rose group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-bb-ink/20 uppercase tracking-widest">30 derniers jours</span>
          </div>
          <p className="text-4xl font-serif text-bb-ink">1,284</p>
          <h3 className="text-[10px] uppercase font-black tracking-widest text-bb-ink/40 mt-2">Visiteurs Uniques</h3>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-bb-beige shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-bb-accent/10 rounded-2xl text-bb-accent group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-bb-ink/20 uppercase tracking-widest">Ce mois-ci</span>
          </div>
          <p className="text-4xl font-serif text-bb-ink">{products.length * 12}</p>
          <h3 className="text-[10px] uppercase font-black tracking-widest text-bb-ink/40 mt-2">Commandes Boutique</h3>
        </div>

        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-bb-beige shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-bb-ink/10 rounded-2xl text-bb-ink group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-bb-ink/20 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-4xl font-serif text-bb-ink">{books.length}</p>
          <h3 className="text-[10px] uppercase font-black tracking-widest text-bb-ink/40 mt-2">Lectures Partagées</h3>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
        {/* Formulaire Lectures */}
        <FadeIn delay={0.2} className="space-y-8 bg-white/40 backdrop-blur-sm p-10 rounded-[3rem] border border-bb-beige shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="w-5 h-5 text-bb-rose" />
              <h2 className="text-2xl font-serif italic text-bb-ink">{editingId ? "Modifier une Lecture" : "Ajouter une Lecture"}</h2>
            </div>
            {editingId && <button onClick={resetBookForm} className="text-[10px] uppercase font-black tracking-widest text-bb-ink/40 hover:text-bb-rose transition-colors">Annuler la modification</button>}
          </div>

          <form onSubmit={handleAddOrEditBook} className="space-y-4">
            <input placeholder="Titre du livre" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 transition-all shadow-sm font-medium text-sm" value={bookTitle} onChange={e => setBookTitle(e.target.value)} required />
            <input placeholder="Auteur" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 transition-all shadow-sm font-medium text-sm" value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Mois (ex: Avril 2024)" className="bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 transition-all shadow-sm font-medium text-sm" value={bookMonth} onChange={e => setBookMonth(e.target.value)} required />
              <select className="bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 transition-all shadow-sm font-medium text-sm appearance-none cursor-pointer" value={bookCity} onChange={e => setBookCity(e.target.value)}>
                <option value="Perpignan">Perpignan</option>
                <option value="Montpellier">Montpellier</option>
              </select>
            </div>
            <div className="relative group">
              <input type="file" className="hidden" id="bookImg" onChange={e => setBookImage(e.target.files?.[0] || null)} />
              <label htmlFor="bookImg" className="w-full bg-white px-6 py-16 rounded-[2.5rem] border-2 border-dashed border-bb-beige flex flex-col items-center justify-center cursor-pointer group-hover:border-bb-rose/20 transition-all hover:bg-bb-beige/10">
                <Upload className="w-8 h-8 text-bb-ink/10 mb-4 group-hover:text-bb-rose/20 transition-colors" />
                <span className="text-bb-ink/40 text-[10px] font-black uppercase tracking-[.25em]">{bookImage ? bookImage.name : (currentBookCover ? "Changer la couverture" : "Uploader la couverture")}</span>
              </label>
            </div>
            <button disabled={loading} className="w-full py-5 bg-bb-ink text-bb-cream rounded-full font-black uppercase tracking-[.3em] text-[10px] hover:bg-bb-rose transition-all shadow-xl active:scale-95 disabled:opacity-50">
              {loading ? "Chargement..." : (editingId ? "Enregistrer les modifications" : "Ajouter la Lecture")}
            </button>
          </form>
        </FadeIn>

        {/* Formulaire Boutique */}
        <FadeIn delay={0.3} className="space-y-8 bg-white/40 backdrop-blur-sm p-10 rounded-[3rem] border border-bb-beige shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-bb-rose" />
              <h2 className="text-2xl font-serif italic text-bb-ink">{editingId ? "Modifier un Produit" : "Ajouter un Produit"}</h2>
            </div>
            {editingId && <button onClick={resetProdForm} className="text-[10px] uppercase font-black tracking-widest text-bb-ink/40 hover:text-bb-rose transition-colors">Annuler la modification</button>}
          </div>

          <form onSubmit={handleAddOrEditProduct} className="space-y-4">
            <input placeholder="Nom du produit" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm font-medium text-sm" value={prodName} onChange={e => setProdName(e.target.value)} required />
            <input type="number" placeholder="Prix (€)" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm font-medium text-sm" value={prodPrice} onChange={e => setProdPrice(e.target.value)} required />
            <textarea placeholder="Description" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm min-h-[120px] font-medium text-sm resize-none" value={prodDesc} onChange={e => setProdDesc(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Couleurs (ex: Rose, Blanc)" className="bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm font-medium text-sm" value={prodColors} onChange={e => setProdColors(e.target.value)} />
              <input placeholder="Tailles (ex: S, M, L)" className="bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm font-medium text-sm" value={prodSizes} onChange={e => setProdSizes(e.target.value)} />
            </div>
            <input placeholder="Stripe Price ID (ex: price_123...)" className="w-full bg-white px-8 py-5 rounded-3xl border border-bb-beige outline-none focus:border-bb-rose/30 shadow-sm font-medium text-sm" value={prodPriceId} onChange={e => setProdPriceId(e.target.value)} />
            <div className="relative">
              <input type="file" className="hidden" id="prodImg" onChange={e => setProdImage(e.target.files?.[0] || null)} />
              <label htmlFor="prodImg" className="w-full bg-white px-6 py-16 rounded-[2.5rem] border-2 border-dashed border-bb-beige flex flex-col items-center justify-center cursor-pointer hover:bg-bb-beige/10 transition-all group">
                <Upload className="w-8 h-8 text-bb-ink/10 mb-4 group-hover:text-bb-rose/20 transition-colors" />
                <span className="text-bb-ink/40 text-[10px] font-black uppercase tracking-[.25em]">{prodImage ? prodImage.name : (currentProdImage ? "Changer la photo" : "Uploader la photo")}</span>
              </label>
            </div>
            <button disabled={loading} className="w-full py-5 bg-bb-ink text-bb-cream rounded-full font-black uppercase tracking-[.3em] text-[10px] hover:bg-bb-rose transition-all shadow-xl active:scale-95 disabled:opacity-50">
              {loading ? "Chargement..." : (editingId ? "Enregistrer les modifications" : "Ajouter au Catalogue")}
            </button>
          </form>
        </FadeIn>
      </div>

      {/* Liste Contenu Actuel */}
      <FadeIn delay={0.4} className="space-y-12 pb-20">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-serif text-bb-ink italic">Gestion du Contenu Actuel</h2>
          <div className="h-[1px] w-20 bg-bb-gold/40"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Lectures Perpignan */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-bb-beige">
              <span className="w-1.5 h-1.5 rounded-full bg-bb-rose"></span>
              <h3 className="text-[10px] uppercase tracking-[.3em] font-black text-bb-ink/60">Lectures Perpignan</h3>
            </div>
            <div className="space-y-4">
              {books.filter(b => b.city === "Perpignan").length === 0 ? (
                 <p className="text-bb-ink/30 text-[10px] uppercase font-black tracking-widest italic py-4">Aucune lecture</p>
              ) : books.filter(b => b.city === "Perpignan").map(book => (
                <div key={book.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-bb-beige flex items-center justify-between group hover:border-bb-rose/20 transition-all shadow-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-serif text-base text-bb-ink truncate">{book.title}</p>
                    <p className="text-[10px] text-bb-ink/40 font-black uppercase tracking-widest mt-1">{book.month}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button onClick={() => startEditBook(book)} className="p-3 bg-bb-beige/30 rounded-full hover:text-bb-rose transition-colors" title="Modifier"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete("lectures", book.id, book.title)} className="p-3 bg-red-50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lectures Montpellier */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-bb-beige">
              <span className="w-1.5 h-1.5 rounded-full bg-bb-accent"></span>
              <h3 className="text-[10px] uppercase tracking-[.3em] font-black text-bb-ink/60">Lectures Montpellier</h3>
            </div>
            <div className="space-y-4">
              {books.filter(b => b.city === "Montpellier").length === 0 ? (
                 <p className="text-bb-ink/30 text-[10px] uppercase font-black tracking-widest italic py-4">Aucune lecture</p>
              ) : books.filter(b => b.city === "Montpellier").map(book => (
                <div key={book.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-bb-beige flex items-center justify-between group hover:border-bb-rose/20 transition-all shadow-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-serif text-base text-bb-ink truncate">{book.title}</p>
                    <p className="text-[10px] text-bb-ink/40 font-black uppercase tracking-widest mt-1">{book.month}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button onClick={() => startEditBook(book)} className="p-3 bg-bb-beige/30 rounded-full hover:text-bb-rose transition-colors" title="Modifier"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete("lectures", book.id, book.title)} className="p-3 bg-red-50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutique */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-bb-beige">
              <span className="w-1.5 h-1.5 rounded-full bg-bb-ink"></span>
              <h3 className="text-[10px] uppercase tracking-[.3em] font-black text-bb-ink/60">Catalogue Boutique</h3>
            </div>
            <div className="space-y-4">
              {products.length === 0 ? (
                 <p className="text-bb-ink/30 text-[10px] uppercase font-black tracking-widest italic py-4">Aucun produit</p>
              ) : products.map(prod => (
                <div key={prod.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] border border-bb-beige flex items-center justify-between group hover:border-bb-rose/20 transition-all shadow-sm">
                  <div className="min-w-0 pr-4">
                    <p className="font-serif text-base text-bb-ink truncate">{prod.name}</p>
                    <p className="text-[10px] text-bb-rose font-black uppercase tracking-widest mt-1">{prod.price} €</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    <button onClick={() => startEditProduct(prod)} className="p-3 bg-bb-beige/30 rounded-full hover:text-bb-rose transition-colors" title="Modifier"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete("merch", prod.id, prod.name)} className="p-3 bg-red-50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
