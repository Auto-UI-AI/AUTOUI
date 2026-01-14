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
import type { Product } from '../types';

export type { Product } from '../types';

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const IMG = {
  coat: pexels(994523),
  denim: pexels(2529148),
  jeans: pexels(4041392),
  sneakers: pexels(298863),
  belt: pexels(322207),
  shorts: pexels(1598505),
  boots: pexels(4041687),
  tshirt: pexels(934070),
  hoodie: pexels(6311387),
  trousers: pexels(4041391),
  chinos: pexels(2983464),
  runners: pexels(279906),
  loafers: pexels(2983465),
  scarf: pexels(572897),
  tote: pexels(6310929),
  cap: pexels(1055691),
  vest: pexels(3755706),
  tank: pexels(6311388),
  joggers: pexels(4041196),
  retro: pexels(4041390),
  wallet: pexels(6311390),
};

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
          image: IMG.coat,
          category: 'Tops',
          sizes: ['S', 'M', 'L'],
        },
        {
          id: '2',
          name: 'Denim Jacket',
          description: 'Classic denim jacket for everyday wear.',
          price: 69.99,
          image: IMG.denim,
          category: 'Tops',
          sizes: ['XS', 'S', 'M', 'L'],
        },
        {
          id: '3',
          name: 'Black Jeans',
          description: 'Comfortable black jeans with modern fit.',
          price: 49.99,
          image: IMG.jeans,
          category: 'Bottoms',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '4',
          name: 'White Sneakers',
          description: 'Clean white sneakers for casual style.',
          price: 79.99,
          image: IMG.sneakers,
          category: 'Shoes',
          sizes: ['S', 'M', 'L'],
        },
        {
          id: '8',
          name: 'Leather Belt',
          description: 'Minimal leather belt with matte buckle.',
          price: 24.99,
          image: IMG.belt,
          category: 'Accessories',
        },
        {
          id: '9',
          name: 'Running Shorts',
          description: 'Lightweight shorts for training and everyday.',
          price: 34.99,
          image: IMG.shorts,
          category: 'Bottoms',
          sizes: ['XS', 'S', 'M', 'L'],
        },
        {
          id: '10',
          name: 'Chelsea Boots',
          description: 'Sleek boots for smart casual outfits.',
          price: 119.99,
          image: IMG.boots,
          category: 'Shoes',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '11',
          name: 'Merino T-Shirt',
          description: 'Soft merino tee that stays fresh all day.',
          price: 39.0,
          image: IMG.tshirt,
          category: 'Tops',
          sizes: ['XS', 'S', 'M', 'L', 'XL'],
        },
        {
          id: '12',
          name: 'Oversized Hoodie',
          description: 'Cozy hoodie with a relaxed fit.',
          price: 74.0,
          image: IMG.hoodie,
          category: 'Tops',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '13',
          name: 'Pleated Trousers',
          description: 'Modern pleated trousers, office to weekend.',
          price: 92.0,
          image: IMG.trousers,
          category: 'Bottoms',
          sizes: ['XS', 'S', 'M', 'L'],
        },
        {
          id: '14',
          name: 'Everyday Chinos',
          description: 'Stretch chinos with a clean silhouette.',
          price: 58.0,
          image: IMG.chinos,
          category: 'Bottoms',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '15',
          name: 'Trail Runners',
          description: 'Grip, comfort, and stability on any terrain.',
          price: 104.0,
          image: IMG.runners,
          category: 'Shoes',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '16',
          name: 'Minimal Loafers',
          description: 'Leather loafers with a minimal profile.',
          price: 128.0,
          image: IMG.loafers,
          category: 'Shoes',
          sizes: ['S', 'M', 'L'],
        },
        {
          id: '17',
          name: 'Wool Scarf',
          description: 'Warm scarf, perfect for chilly evenings.',
          price: 29.0,
          image: IMG.scarf,
          category: 'Accessories',
        },
        {
          id: '18',
          name: 'Travel Tote',
          description: 'Roomy tote with internal organizer pockets.',
          price: 44.0,
          image: IMG.tote,
          category: 'Accessories',
        },
        {
          id: '19',
          name: 'Sports Cap',
          description: 'Lightweight cap with breathable panels.',
          price: 19.0,
          image: IMG.cap,
          category: 'Accessories',
        },
        {
          id: '20',
          name: 'Puffer Vest',
          description: 'Layer-friendly vest with warm insulation.',
          price: 86.0,
          image: IMG.vest,
          category: 'Tops',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '21',
          name: 'Ribbed Tank',
          description: 'Ribbed cotton tank for everyday basics.',
          price: 22.0,
          image: IMG.tank,
          category: 'Tops',
          sizes: ['XS', 'S', 'M', 'L'],
        },
        {
          id: '22',
          name: 'Relaxed Joggers',
          description: 'Soft joggers with a relaxed taper.',
          price: 49.0,
          image: IMG.joggers,
          category: 'Bottoms',
          sizes: ['S', 'M', 'L', 'XL'],
        },
        {
          id: '23',
          name: 'Retro Sneakers',
          description: 'Retro-inspired sneakers with comfy cushioning.',
          price: 88.0,
          image: IMG.retro,
          category: 'Shoes',
          sizes: ['S', 'M', 'L'],
        },
        {
          id: '24',
          name: 'Slim Wallet',
          description: 'Slim wallet with RFID lining.',
          price: 32.0,
          image: IMG.wallet,
          category: 'Accessories',
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
