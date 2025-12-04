/**
 * Grid of fashion items displaying products with name, price, image, and "Add to Cart" button.
 * Renders a responsive grid layout reusing ProductCard components from the base component library.
 *
 * @example
 * ```tsx
 * <ProductGallery
 *   products={[
 *     {
 *       id: "1",
 *       name: "Beige Coat",
 *       description: "A stylish beige coat for modern fashion.",
 *       price: 89.99,
 *       image: "https://example.com/coat.jpg"
 *     },
 *     {
 *       id: "2",
 *       name: "Denim Jacket",
 *       description: "Classic denim jacket for everyday wear.",
 *       price: 69.99,
 *       image: "https://example.com/jacket.jpg"
 *     }
 *   ]}
 *   onAddToCart={(productId) => console.log("Added", productId)}
 * />
 * ```
 */
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sizes?: string[];
}

interface ProductGalleryProps {
  products: Product[];
  onAddToCart: (productId: string, size?: string) => void;
  onViewDetails?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  wishlistIds?: string[];
}

export default function ProductGallery({
  products,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  wishlistIds,
}: ProductGalleryProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground" data-testid="product-gallery-empty">
        No products found.
      </div>
    );
  }

  // For a single product, avoid the grid container to reduce unnecessary padding when rendered in chat.
  if (products.length === 1) {
    const product = products[0];
    return (
      <div data-testid="product-gallery-single">
        <ProductCard
          key={product.id}
          product={product}
          onAddToCartOverride={onAddToCart}
          onViewDetails={onViewDetails}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds?.includes(product.id)}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="product-gallery">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCartOverride={onAddToCart}
          onViewDetails={onViewDetails}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={wishlistIds?.includes(product.id)}
        />
      ))}
    </div>
  );
}
