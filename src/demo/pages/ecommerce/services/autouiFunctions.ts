import { fetchCategories } from '../functions/fetchCategories';
import { fetchProducts } from '../functions/fetchProducts';
import { submitOrder } from '../functions/submitOrder';
import { summarizeCart } from '../functions/summarizeCart';
import { useEcommerceStore } from '../store/useEcommerceStore';

export async function listCategories() {
  const categories = await fetchCategories();
  useEcommerceStore.getState().setCategories(categories);
  return { categories };
}

export async function searchProducts(params: { category?: string; q?: string }) {
  const products = await fetchProducts(params);
  useEcommerceStore.getState().setProducts(products);
  return { products, count: products.length, category: params.category ?? 'All', q: params.q ?? '' };
}

export async function addToCart(params: { productId: string }) {
  const state = useEcommerceStore.getState();
  const product = state.products.find((p) => p.id === params.productId);
  if (!product) {
    return { ok: false, error: 'Product not found in current catalog. Run searchProducts first.' };
  }
  state.addToCart({ id: product.id, name: product.name, price: product.price });
  return { ok: true };
}

export async function removeFromCart(params: { productId: string }) {
  const state = useEcommerceStore.getState();
  state.removeFromCart(params.productId);
  return { ok: true };
}

export async function setCartItemQuantity(params: { productId: string; quantity: number }) {
  const state = useEcommerceStore.getState();
  state.setCartItemQuantity(params.productId, params.quantity);
  return { ok: true };
}

export async function clearCart() {
  useEcommerceStore.getState().clearCart();
  return { ok: true };
}

export async function toggleWishlistItem(params: { productId: string }) {
  const state = useEcommerceStore.getState();
  const product = state.products.find((p) => p.id === params.productId);
  if (!product) {
    return { ok: false, error: 'Product not found in current catalog. Run searchProducts first.' };
  }
  state.toggleWishlist({ id: product.id, name: product.name, price: product.price });
  return { ok: true };
}

export async function getWishlist() {
  const wishlist = useEcommerceStore.getState().wishlist;
  return { wishlist, count: wishlist.length };
}

export async function getCartSummary() {
  const state = useEcommerceStore.getState();
  const { summary, total } = summarizeCart({ cart: state.cart });
  return {
    summary,
    total,
    itemCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
    distinctItems: state.cart.length,
  };
}

export async function checkout(params: { name: string; email: string; address: string }) {
  const state = useEcommerceStore.getState();

  if (state.cart.length === 0) {
    return { ok: false, error: 'Cart is empty. Add items before checkout.' };
  }

  const name = params.name?.trim() ?? '';
  const email = params.email?.trim() ?? '';
  const address = params.address?.trim() ?? '';

  if (!name) return { ok: false, error: 'Name is required.' };
  if (!email) return { ok: false, error: 'Email is required.' };
  if (!address) return { ok: false, error: 'Shipping address is required.' };

  const basicEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!basicEmailOk) return { ok: false, error: 'Email looks invalid. Please enter a real email address.' };

  const receipt = submitOrder({ user: { name, email, address }, cart: state.cart });
  const order = receipt;

  state.setLastOrder(order);
  state.clearCart();

  return { ok: true, order };
}
