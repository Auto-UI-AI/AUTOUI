/**
 * Return the list of products saved in the user’s wishlist.
 */
interface Product {
  id: string;
  name: string;
  price: number;
}

export function getWishlist(): Product[] {
  // Mock implementation
  return [
    { id: '1', name: 'Product A', price: 29.99 },
    { id: '2', name: 'Product B', price: 49.99 },
  ];
}
