/**
 * Return the list of products saved in the user’s wishlist.
 */
import type { WishlistItem } from '../types';

export function getWishlist(): WishlistItem[] {
  // Mock implementation
  return [
    { id: '1', name: 'Product A', price: 29.99 },
    { id: '2', name: 'Product B', price: 49.99 },
  ];
}
