/**
 * Submit the checkout order and return the order ID with ETA.
 */
import type { CartItem, OrderReceipt } from '../types';
import type { UserInfo } from '../components/CheckoutForm';

export function submitOrder(input: { user: UserInfo; cart: CartItem[] }): OrderReceipt {
  const totalCost = input.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
    eta: `${Math.floor(Math.random() * 5) + 1} days`,
    totalCost,
    createdAtIso: new Date().toISOString(),
  };
}
