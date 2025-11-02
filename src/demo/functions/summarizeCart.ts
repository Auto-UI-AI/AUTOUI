/**
 * Generate a textual summary and total price for the current cart.
 */
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function summarizeCart(input: { cart: CartItem[] }): {
  summary: string;
  total: number;
} {
  const total = input.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const summary = input.cart.map((item) => `${item.quantity}x ${item.name}`).join(', ');
  return { summary, total };
}
