import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface ProductGalleryProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  onOpenDetails?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: (productId: string) => boolean;
}

export default function ProductGallery({
  products,
  onAddToCart,
  onOpenDetails,
  onToggleWishlist,
  isWishlisted,
}: ProductGalleryProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground" data-testid="product-gallery-empty">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="product-gallery">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onOpenDetails={onOpenDetails}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted ? isWishlisted(product.id) : undefined}
        />
      ))}
    </div>
  );
}
