export type ProductCategory = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories' | 'All' | string;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: ProductCategory;
  sizes?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderReceipt {
  orderId: string;
  eta: string;
  totalCost: number;
  createdAtIso: string;
}
