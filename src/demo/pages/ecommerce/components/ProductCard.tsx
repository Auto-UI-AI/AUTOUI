/**
 * Single product card component.
 * Displays product name, price, image, and "Add to Cart" button.
 *
 * @example
 * ```tsx
 * <ProductCard
 *   product={{
 *     id: "1",
 *     name: "Beige Coat",
 *     description: "A stylish beige coat for modern fashion.",
 *     price: 89.99,
 *     image: "https://example.com/coat.jpg"
 *   }}
 *   onAddToCart={(productId) => console.log("Added", productId)}
 * />
 * ```
 */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Button } from '@/demo/base/button';

interface ProductCardProps {
  product: {
    description: string;
    id: string;
    name: string;
    price: number;
    image: string;
  };
  onAddToCart: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden" data-testid="product-card">
      <div className="relative w-full overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
          data-testid="product-card-image"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2" data-testid="product-card-name">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2" data-testid="product-card-description">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-2xl font-bold" data-testid="product-card-price">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            console.log(product.id);
            onAddToCart(product.id);
          }}
          className="w-full"
          data-testid="product-card-add-to-cart"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
