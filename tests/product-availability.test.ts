import { test } from "node:test";
import assert from "node:assert/strict";
import { availableStock, priceCart, configuredCart } from "../src/lib/stock";

test("coming soon products cannot be purchased even with positive stock", () => {
  const product = { id: "tote", name: "Tote", price: 12, stock: 5, coming_soon: true };
  assert.equal(availableStock(product), 0);
  assert.throws(() => priceCart([{ id: "tote", quantity: 1 }], [product]));
  const available = { ...product, coming_soon: false };
  assert.equal(availableStock(available), 5);
  assert.equal(priceCart([{ id: "tote", quantity: 1 }], [available])[0].unit_amount, 1200);
});

test("sizes survive checkout while stock is aggregated across variants", () => {
  const products = [{ id: "shirt", name: "Shirt", price: 20, stock: 3, sizes: ["S", "M"], colors: ["Noir"] }];
  const cart = [{ id: "shirt", quantity: 1, size: "S", color: "Noir" }, { id: "shirt", quantity: 2, size: "M", color: "Noir" }];
  const { lines, items } = configuredCart(cart, products);
  assert.equal(lines.length, 2);
  assert.match(lines[0].name, /Taille : S/);
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 3);
  assert.deepEqual(items[0].variants, [{ size: "S", color: "Noir", quantity: 1 }, { size: "M", color: "Noir", quantity: 2 }]);
  assert.throws(() => configuredCart([...cart, cart[0]], products));
  assert.throws(() => configuredCart([{ id: "shirt", quantity: 1 }], products));
  assert.throws(() => configuredCart([{ ...cart[0], size: "XL" }], products));
});
