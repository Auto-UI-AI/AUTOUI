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
 * />
 * ```
 */
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: {
    description: string;
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  };

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
        <Button onClick={handleAddToCart} className="w-full" data-testid="product-card-add-to-cart">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
