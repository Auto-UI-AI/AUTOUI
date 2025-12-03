/**
 * Submit the checkout order and return the order ID with ETA.
 */
interface UserInfo {
  name: string;
  email: string;
  address: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function submitOrder(input: { user: UserInfo; cart: CartItem[] }): {
  orderId: string;
  eta: string;
} {
  console.log('Submitting order for user:', input.user);
  console.log('Cart items:', input.cart);
  // Mock implementation
  return {
    orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
    eta: `${Math.floor(Math.random() * 5) + 1} days`,
  };
}
