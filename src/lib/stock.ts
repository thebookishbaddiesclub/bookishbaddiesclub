export interface CartItem { id: string; quantity: number }
export interface CatalogProduct {
  id: string | number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string;
}
export class CartError extends Error {}

export function parseCart(value: unknown): CartItem[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) throw new CartError("Panier invalide.");
  const quantities = new Map<string, number>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") throw new CartError("Panier invalide.");
    // Accept old, already-open shop tabs, but never trust their product price/name.
    const id = entry.id ?? entry.product?.id;
    if ((typeof id !== "string" && typeof id !== "number") || !String(id).trim() || String(id).length > 200
      || !Number.isSafeInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 999) {
      throw new CartError("Produit ou quantité invalide.");
    }
    const quantity = (quantities.get(String(id)) ?? 0) + entry.quantity;
    if (quantity > 999) throw new CartError("Quantité trop élevée.");
    quantities.set(String(id), quantity);
  }
  return [...quantities].map(([id, quantity]) => ({ id, quantity })).sort((a, b) => a.id.localeCompare(b.id));
}

export function priceCart(cart: CartItem[], products: CatalogProduct[]) {
  return cart.map(({ id, quantity }) => {
    const product = products.find(p => String(p.id) === id);
    if (!product || !Number.isSafeInteger(product.stock) || product.stock < quantity) {
      throw new CartError("Le stock a changé. Actualise ton panier.");
    }
    const unit_amount = Math.round(Number(product.price) * 100);
    if (product.price == null || !Number.isSafeInteger(unit_amount) || unit_amount <= 0) throw new CartError("Prix indisponible.");
    return { id, quantity, unit_amount, name: product.name };
  });
}

export function availableStock(product: { stock?: number | null }) {
  return Number.isSafeInteger(product.stock) && (product.stock ?? 0) > 0 ? product.stock! : 0;
}
