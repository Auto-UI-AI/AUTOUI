/**
 * Suggest products based on cart contents.
 * Returns product recommendations based on items currently in the user's cart.
 *
 * @param params - Recommendation parameters
 * @param params.cart - Optional array of cart items to base recommendations on
 * @returns Promise resolving to an array of recommended products
 *
 * @example
 * ```ts
 * const recommendations = await getRecommendations({
 *   cart: [{ id: "1", name: "Coat", price: 89.99, quantity: 1 }]
 * });
 * ```
 */
import { type Product } from './fetchProducts';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GetRecommendationsParams {
  cart?: CartItem[];
}

export async function getRecommendations(params: GetRecommendationsParams = {}): Promise<Product[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock recommendations based on cart items
      const mockRecommendations: Product[] = [
        {
          id: '6',
          name: 'Cozy Wool Scarf',
          description: 'Soft merino scarf for chilly days.',
          price: 34.0,
          image: img('photo-1503342217505-b0a15ec3261c'),
          category: 'Accessories',
          sizes: ['One Size'],
        },
        {
          id: '10',
          name: 'Midnight Chelsea Boots',
          description: 'Suede boots with rubber sole.',
          price: 149.0,
          image: img('photo-1519744792095-2f2205e87b6f'),
          category: 'Shoes',
          sizes: ['8', '9', '10', '11', '12'],
        },
        {
          id: '5',
          name: 'Olive Utility Shirt',
          description: 'Cotton twill overshirt with pockets.',
          price: 68.0,
          image: img('photo-1503341455253-b2e723bb3dbb'),
          category: 'Tops',
          sizes: ['S', 'M', 'L'],
        },
      ];

      // If cart has items, filter recommendations to complementary products
      if (params.cart && params.cart.length > 0) {
        // Mock logic: if cart has tops, recommend accessories
        const hasTops = params.cart.some((item) => item.name.toLowerCase().includes('coat'));
        if (hasTops) {
          resolve(mockRecommendations.filter((p) => p.category === 'Accessories'));
          return;
        }
      }

      resolve(mockRecommendations);
    }, 150);
  });
}
