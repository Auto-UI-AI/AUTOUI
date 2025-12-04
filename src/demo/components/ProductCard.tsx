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
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { ToggleGroup, ToggleGroupItem } from '../base/toggle-group';
import { useCart } from '../hooks/useCart';
import { cn } from '../base/utils';
import { Heart, Info } from 'lucide-react';

interface ProductCardProps {
  product: {
    description: string;
    id: string;
    name: string;
    price: number;
    image: string;
    sizes?: string[];
  };
  onViewDetails?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
  onAddToCartOverride?: (productId: string, size?: string) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onToggleWishlist,
  isWishlisted = false,
  onAddToCartOverride,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);

  const hasSizes = useMemo(() => Boolean(product.sizes && product.sizes.length), [product.sizes]);

  const handleAddToCart = () => {
    const sizeToUse = hasSizes ? selectedSize || product.sizes?.[0] : undefined;

    if (onAddToCartOverride) {
      onAddToCartOverride(product.id, sizeToUse);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: sizeToUse,
    });
  };

  return (
    <Card className="flex h-full w-full max-w-sm flex-col overflow-hidden" data-testid="product-card">
      <div className="relative w-full overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform hover:scale-105"
          data-testid="product-card-image"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-2" data-testid="product-card-name">
              {product.name}
            </CardTitle>
            <CardDescription className="line-clamp-2" data-testid="product-card-description">
              {product.description}
            </CardDescription>
          </div>
          {onToggleWishlist && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={() => onToggleWishlist(product.id)}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {hasSizes && (
          <div className="space-y-1" data-testid="product-card-sizes">
            <p className="text-xs font-medium text-muted-foreground">Choose size</p>
            <ToggleGroup
              type="single"
              value={selectedSize}
              onValueChange={(value) => setSelectedSize(value)}
              className="flex flex-wrap gap-2"
              aria-label={`Choose size for ${product.name}`}
            >
              {product.sizes?.map((size) => (
                <ToggleGroupItem
                  key={size}
                  value={size}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    selectedSize === size ? 'border-primary bg-primary text-primary-foreground' : 'border-muted',
                  )}
                >
                  {size}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
        <p className="text-2xl font-bold" data-testid="product-card-price">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          {onViewDetails && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 border border-border"
              data-testid="product-card-view-details"
              aria-label="View details"
              onClick={() => onViewDetails(product.id)}
            >
              <Info className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleAddToCart} className="flex-1" data-testid="product-card-add-to-cart">
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
