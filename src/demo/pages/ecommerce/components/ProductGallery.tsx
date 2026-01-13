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
  // onAddToCart: (productId: string) => void;
}

export default function ProductGallery({ products }: ProductGalleryProps) {
  const onAddToCart = (productId: string) => {
    console.log('Adding to cart:', productId);
  };
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground" data-testid="product-gallery-empty">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="product-gallery">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
