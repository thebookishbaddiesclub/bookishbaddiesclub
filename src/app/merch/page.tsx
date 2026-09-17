"use client";

import { useState, useEffect } from "react";
import { availableStock } from "@/lib/stock";
import FadeIn from "@/components/FadeIn";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, Trash2, Info, Loader2 } from "lucide-react";
import ProductModal from "@/components/ProductModal";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: string[];
  sizes: string[];
  imageUrl: string;
  stock?: number;
  coming_soon?: boolean;
  images?: string[];
}

export const dynamic = "force-dynamic";

export default function MerchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [shopError, setShopError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<{ percentOff?: number | null; amountOff?: number | null } | null>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      setCart([]);
      alert("Merci pour votre commande ! On s'occupe de tout.");
    }
    if (params.get("canceled")) {
      alert("Paiement annulé. Vous pouvez continuer vos achats.");
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setProducts(data.products);
        setCart(previous => previous.map(item => ({ ...item, product: data.products.find((p: Product) => p.id === item.product.id) ?? item.product })));
        setSelectedProduct(previous => previous ? data.products.find((p: Product) => p.id === previous.id) ?? null : null);
        setShopError("");
      } catch (err) {
        setShopError("La boutique est momentanément indisponible. Recharge la page pour réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    const refresh = () => { void fetchProducts(); };
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 30000);
    return () => { window.removeEventListener("focus", refresh); window.clearInterval(interval); };
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if ((existing?.quantity ?? 0) >= availableStock(product)) return prev;
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const product = products.find(p => p.id === id);
          const newQuantity = Math.max(0, Math.min(availableStock(product ?? {}), item.quantity + delta));
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart.map(item => ({ id: item.product.id, quantity: item.quantity })), promotionCodeId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur: " + (data.error || "Paiement impossible"));
      }
    } catch (err) {
      alert("Une erreur est survenue lors de la redirection vers Stripe.");
    } finally {
      setCheckingOut(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = promoDiscount?.percentOff ? cartTotal * promoDiscount.percentOff / 100 : promoDiscount?.amountOff ? promoDiscount.amountOff / 100 : 0;
  const discountedTotal = Math.max(0, cartTotal - discount);

  const applyPromo = async () => {
    setCheckingPromo(true); setPromoMessage(""); setPromotionCodeId(null); setPromoDiscount(null);
    try {
      const res = await fetch("/api/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: promoCode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");
      setPromotionCodeId(data.promotionCodeId); setPromoDiscount(data); setPromoMessage(`Code ${data.code} appliqué.`);
    } catch (error: any) { setPromoMessage(error.message); }
    finally { setCheckingPromo(false); }
  };

  return (
    <div className="py-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-serif text-bb-ink mb-4">La Boutique</h1>
          <p className="text-bb-ink/70 mb-10 text-lg">
            Tes essentiels pour entrer dans ta baddies era ❤️🔥
          </p>
        </FadeIn>

        {shopError && <p role="alert" className="mb-6 text-red-600">{shopError}</p>}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-bb-ink/30 translate-y-10">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-serif italic text-lg">Préparation des étagères...</p>
          </div>
        ) : products.length === 0 ? (
          <FadeIn delay={0.2} className="text-center py-20 group">
             <p className="text-bb-ink/40 font-serif italic text-2xl tracking-wide group-hover:text-bb-rose/60 transition-colors">
                Bientôt de nouvelles pépites ici...
             </p>
             <div className="mt-8 flex justify-center opacity-30">
               <div className="w-1.5 h-1.5 rounded-full bg-bb-gold mx-1"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-bb-gold mx-1"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-bb-gold mx-1"></div>
             </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {products.map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 0.1}>
                <div className="bg-white/50 backdrop-blur-sm border border-bb-beige rounded-[2.5rem] p-6 transition-all hover:shadow-xl hover:border-bb-rose/20 group">
                  <div 
                    className="aspect-square bg-bb-beige/20 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden group-hover:scale-[0.98] transition-transform duration-500"
                    onClick={() => setSelectedProduct(product)}
                  >
                     {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                     ) : (
                        <span className="font-serif text-bb-ink/20 uppercase tracking-widest text-xs">Photo à venir</span>
                     )}
                     <button 
                       className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-full text-bb-ink opacity-0 group-hover:opacity-100 transition-all shadow-md hover:text-bb-rose"
                       title="Aperçu rapide"
                     >
                       <Info className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-xl tracking-tight text-bb-ink">{product.name}</h3>
                      <p className="text-bb-rose font-bold uppercase tracking-widest text-xs">{product.price} €</p>
                    </div>
                    <div className="mt-2">
                       {product.coming_soon ? (<span className="text-sm font-bold text-bb-rose">Bientôt disponible</span>) : availableStock(product) === 0 ? (
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">En rupture de stock</span>
                       ) : product.stock !== undefined && product.stock <= 5 ? (
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Plus que {product.stock} exemplaires !</span>
                       ) : (
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">En stock</span>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={availableStock(product) <= (cart.find(item => item.product.id === product.id)?.quantity ?? 0)}
                      className="flex-1 py-3 px-4 bg-bb-ink text-bb-cream rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:bg-bb-rose hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-bb-ink"
                    >
                      <Plus className="w-4 h-4" /> {product.coming_soon ? "Bientôt disponible" : availableStock(product) === 0 ? "Indisponible" : "Ajouter"}
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="py-3 px-4 bg-white border border-bb-beige text-bb-ink rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:border-bb-rose/40"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className="lg:col-span-1">
        <FadeIn delay={0.4} className="bg-bb-cream/90 backdrop-blur-md border border-bb-beige rounded-[2.5rem] p-10 shadow-xl">
          <div className="flex items-center gap-3 border-b border-bb-beige pb-6 mb-8">
            <ShoppingBag className="w-6 h-6 text-bb-ink" />
            <h2 className="text-2xl font-serif text-bb-ink italic">Votre Panier</h2>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-12 text-bb-ink/40">
              <p className="font-sans text-sm italic">Votre panier est vide pour le moment.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="max-h-[40vh] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-bb-beige/30">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-bb-ink line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-bb-rose font-medium tracking-wider">{item.product.price} €</p>
                    </div>
                    <div className="flex items-center gap-3 bg-bb-beige/20 p-2 rounded-xl">
                      <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:text-bb-rose transition-colors">
                        {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      </button>
                      <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                      <button disabled={item.quantity >= availableStock(products.find(p => p.id === item.product.id) ?? {})} onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:text-bb-rose transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-bb-beige">
                <div className="mb-6 flex gap-2">
                  <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Code promo" className="min-w-0 flex-1 rounded-full border border-bb-beige bg-white px-4 py-3 text-xs uppercase tracking-wider" />
                  <button type="button" onClick={applyPromo} disabled={!promoCode || checkingPromo} className="rounded-full border border-bb-ink px-4 py-3 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40">{checkingPromo ? "..." : "Valider"}</button>
                </div>
                {promoMessage && <p className="mb-4 text-xs text-bb-rose">{promoMessage}</p>}
                {cart.some(item => item.quantity > availableStock(products.find(p => p.id === item.product.id) ?? {})) && <p role="alert" className="mb-4 text-sm text-red-600">Le stock a changé. Réduis les quantités ou retire les produits indisponibles.</p>}
                <div className="flex justify-between items-center mb-10 px-2">
                  <span className="text-bb-ink/50 font-sans uppercase tracking-[.2em] text-[10px] font-black">Estimation Total</span>
                  <span className="text-3xl font-serif font-medium text-bb-ink">{discountedTotal.toFixed(2)} €</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={checkingOut || loading || !!shopError || cart.some(item => item.quantity > availableStock(products.find(p => p.id === item.product.id) ?? {}))}
                  className="w-full py-5 bg-bb-ink text-bb-cream rounded-full hover:bg-bb-rose transition-all font-bold text-xs uppercase tracking-[.3em] flex justify-center items-center gap-3 shadow-lg hover:shadow-bb-rose/20 text-center disabled:opacity-50"
                >
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : "Procéder au Paiement"}
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 opacity-30">
                  <span className="h-[1px] w-4 bg-bb-ink"></span>
                  <p className="text-[8px] font-black uppercase tracking-widest text-bb-ink mb-0">Secure Checkout via Stripe</p>
                  <span className="h-[1px] w-4 bg-bb-ink"></span>
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>

      {/* Product Detail Modal */}
      <ProductModal key={selectedProduct?.id || "closed"}
        product={selectedProduct}
        quantityInCart={cart.find(item => item.product.id === selectedProduct?.id)?.quantity ?? 0}
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(p) => {
          addToCart(p);
        }}
      />
    </div>
  );
}
