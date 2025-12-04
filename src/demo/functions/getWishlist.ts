/**
 * Return the list of products saved in the user’s wishlist.
 * Persists in localStorage so the panel and product grid stay in sync.
 */
import type { Product } from './fetchProducts';

const WISHLIST_KEY = 'autoui_wishlist';

export function getWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to read wishlist from storage', error);
    return [];
  }
}

export function setWishlist(items: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to write wishlist to storage', error);
  }
}
