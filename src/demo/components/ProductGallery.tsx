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
}

interface ProductGalleryProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
}

export default function ProductGallery({ products, onAddToCart }: ProductGalleryProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground" data-testid="product-gallery-empty">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-gallery">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
