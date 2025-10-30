/**
 * Get products list filtered by category and/or search query.
 * Returns an array of products matching the provided filters.
 *
 * @param params - Filter parameters
 * @param params.category - Optional category filter (e.g., "Tops", "Bottoms")
 * @param params.q - Optional search query string
 * @returns Promise resolving to an array of products
 *
 * @example
 * ```ts
 * const products = await fetchProducts({ category: "Tops", q: "coat" });
 * ```
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

import { PLACEHOLDER_IMAGE } from '../constants';

export interface FetchProductsParams {
  category?: string;
  q?: string;
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<Product[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Beige Coat',
          description: 'A stylish beige coat for modern fashion.',
          price: 89.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Tops',
        },
        {
          id: '2',
          name: 'Denim Jacket',
          description: 'Classic denim jacket for everyday wear.',
          price: 69.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Tops',
        },
        {
          id: '3',
          name: 'Black Jeans',
          description: 'Comfortable black jeans with modern fit.',
          price: 49.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Bottoms',
        },
        {
          id: '4',
          name: 'White Sneakers',
          description: 'Clean white sneakers for casual style.',
          price: 79.99,
          image: PLACEHOLDER_IMAGE,
          category: 'Shoes',
        },
      ];

      let filtered = mockProducts;

      if (params.category && params.category !== 'All') {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(query) || p.category?.toLowerCase().includes(query),
        );
      }

      resolve(filtered);
    }, 100);
  });
}
