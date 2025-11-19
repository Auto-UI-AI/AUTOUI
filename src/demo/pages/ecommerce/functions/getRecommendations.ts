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
import { PLACEHOLDER_IMAGE } from '@/demo/constants';

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
          id: '5',
          name: 'Scarf',
          description: 'Cozy scarf perfect for cold weather.',
          price: 29.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Accessories',
        },
        {
          id: '6',
          name: 'Winter Boots',
          description: 'Warm and comfortable winter boots.',
          price: 129.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Shoes',
        },
        {
          id: '7',
          name: 'Wool Hat',
          description: 'Soft wool hat for winter warmth.',
          price: 39.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Accessories',
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
