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
  sizes?: string[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export interface FetchProductsParams {
  category?: string;
  q?: string;
  sizes?: string[];
}

export async function fetchProducts(params: FetchProductsParams = {}): Promise<Product[]> {
  // Mock implementation - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Beige Trench Coat',
          description: 'Lightweight trench for everyday layering.',
          price: 129.99,
          image: img('photo-1521572163474-6864f9cf17ab'),
          category: 'Tops',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '2',
          name: 'Indigo Denim Jacket',
          description: 'Classic denim with a modern cut.',
          price: 92.0,
          image: img('photo-1521572267360-ee0c2909d518'),
          category: 'Tops',
          sizes: ['M', 'L', 'XL'],
        },
        {
          id: '3',
          name: 'Black Slim Jeans',
          description: 'Stretch denim with a tapered fit.',
          price: 74.5,
          image: img('photo-1489987707025-afc232f7ea0f'),
          category: 'Bottoms',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '4',
          name: 'White Leather Sneakers',
          description: 'Minimal sneakers with cushioned sole.',
          price: 119.99,
          image: img('photo-1512436991641-6745cdb1723f'),
          category: 'Shoes',
          sizes: ['8', '9', '10', '11'],
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
          id: '7',
          name: 'Canvas Tote Bag',
          description: 'Everyday carryall with inner pocket.',
          price: 27.0,
          image: img('photo-1521572267360-ee0c2909d518'),
          category: 'Accessories',
          sizes: ['One Size'],
        },
        {
          id: '8',
          name: 'Grey Pullover Hoodie',
          description: 'Fleece-lined hoodie with relaxed fit.',
          price: 58.5,
          image: img('photo-1521572163474-6864f9cf17ab'),
          category: 'Tops',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '9',
          name: 'Running Socks 3-Pack',
          description: 'Breathable socks with arch support.',
          price: 19.99,
          image: img('photo-1503342217505-b0a15ec3261c'),
          category: 'Accessories',
          sizes: ['M', 'L'],
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
      ];

      let filtered = mockProducts;

      if (params.category && params.category !== 'All') {
        filtered = filtered.filter((p) => p.category === params.category);
      }

      if (params.sizes && params.sizes.length > 0) {
        filtered = filtered.filter((p) => {
          if (!p.sizes) return false;
          return params.sizes?.some((size) => p.sizes?.includes(size));
        });
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
