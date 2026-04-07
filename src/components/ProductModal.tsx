"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  colors: string[];
  sizes: string[];
  imageUrl: string;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: any, config: { color: string, size: string }) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, { color: selectedColor, size: selectedSize });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bb-ink/40 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-bb-cream border border-bb-beige w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/50 backdrop-blur-md rounded-full text-bb-ink hover:text-bb-rose z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image */}
          <div className="w-full md:w-1/2 aspect-square md:aspect-auto bg-bb-beige/30 relative">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-bb-ink/20 uppercase tracking-widest font-serif">
                Photo indisponible
              </div>
            )}
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-10 overflow-y-auto space-y-8">
            <header>
              <h2 className="text-3xl font-serif text-bb-ink leading-tight">{product.name}</h2>
              <p className="text-xl font-sans text-bb-rose mt-2">{product.price} €</p>
            </header>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest font-black text-bb-ink/40">Description</h4>
              <p className="text-bb-ink/70 leading-relaxed font-sans">{product.description}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-8">
              {product.colors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-bb-ink/40">Couleurs</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedColor === color ? "bg-bb-ink text-bb-cream border-bb-ink" : "bg-white border-bb-beige text-bb-ink hover:border-bb-rose"}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {product.sizes.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-bb-ink/40">Tailles</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selectedSize === size ? "bg-bb-ink text-bb-cream border-bb-ink" : "bg-white border-bb-beige text-bb-ink hover:border-bb-rose"}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleAdd}
              disabled={added}
              className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all ${added ? "bg-green-500 text-white" : "bg-bb-ink text-bb-cream hover:bg-bb-rose shadow-lg"}`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Ajouté !</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> Ajouter au panier</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
