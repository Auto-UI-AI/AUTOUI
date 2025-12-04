/**
 * Add or remove a product from the wishlist and persist it.
 */
import type { Product } from './fetchProducts';
import { getWishlist, setWishlist } from './getWishlist';

export function toggleWishlistItem(input: { product: Product }): { ok: boolean; items: Product[] } {
  const current = getWishlist();
  const exists = current.some((item) => item.id === input.product.id);
  const updated = exists ? current.filter((item) => item.id !== input.product.id) : [...current, input.product];
  setWishlist(updated);
  return { ok: true, items: updated };
}
