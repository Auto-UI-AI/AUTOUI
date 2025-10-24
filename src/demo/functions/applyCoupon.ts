/**
 * Apply a coupon code and return the updated total if successful.
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function applyCoupon(input: { code: string; cart: CartItem[] }): { ok: boolean; newTotal?: number } {
  // Mock implementation
  if (input.code === 'DISCOUNT10') {
    const newTotal = input.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.9;
    return { ok: true, newTotal };
  }
  return { ok: false };
}
