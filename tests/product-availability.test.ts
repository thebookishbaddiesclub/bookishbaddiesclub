import { test } from "node:test";
import assert from "node:assert/strict";
import { availableStock, priceCart } from "../src/lib/stock";

test("coming soon products cannot be purchased even with positive stock", () => {
  const product = { id: "tote", name: "Tote", price: 12, stock: 5, coming_soon: true };
  assert.equal(availableStock(product), 0);
  assert.throws(() => priceCart([{ id: "tote", quantity: 1 }], [product]));
  const available = { ...product, coming_soon: false };
  assert.equal(availableStock(available), 5);
  assert.equal(priceCart([{ id: "tote", quantity: 1 }], [available])[0].unit_amount, 1200);
});
