import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CartItem, OrderReceipt, Product, WishlistItem } from '../types';

type EcommerceState = {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  lastOrder: OrderReceipt | null;

  setProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;

  addToCart: (product: Pick<Product, 'id' | 'name' | 'price'>) => void;
  removeFromCart: (productId: string) => void;
  setCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  toggleWishlist: (product: Pick<Product, 'id' | 'name' | 'price'>) => void;
  removeFromWishlist: (productId: string) => void;

  setLastOrder: (order: OrderReceipt | null) => void;
};

export const useEcommerceStore = create<EcommerceState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: ['All'],
      cart: [],
      wishlist: [],
      lastOrder: null,

      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),

      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
          set({
            cart: cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
          });
          return;
        }
        set({ cart: [...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }] });
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
      },

      setCartItemQuantity: (productId, quantity) => {
        const safeQuantity = Math.max(1, Math.floor(quantity || 1));
        set({
          cart: get().cart.map((item) => (item.id === productId ? { ...item, quantity: safeQuantity } : item)),
        });
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => {
        const wishlist = get().wishlist;
        const exists = wishlist.some((w) => w.id === product.id);
        if (exists) {
          set({ wishlist: wishlist.filter((w) => w.id !== product.id) });
          return;
        }
        set({ wishlist: [...wishlist, { id: product.id, name: product.name, price: product.price }] });
      },

      removeFromWishlist: (productId) => set({ wishlist: get().wishlist.filter((w) => w.id !== productId) }),

      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    {
      name: 'autoui-ecommerce-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        lastOrder: state.lastOrder,
      }),
    },
  ),
);

export const selectCartCount = (state: Pick<EcommerceState, 'cart'>) =>
  state.cart.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state: Pick<EcommerceState, 'cart'>) =>
  state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
