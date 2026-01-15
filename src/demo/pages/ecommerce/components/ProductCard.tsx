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
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Button } from '@/demo/base/button';
import { Badge } from '@/demo/base/badge';
import { Heart, Info, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: {
    description: string;
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
  onAddToCart: (productId: string) => void;
  onOpenDetails?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onOpenDetails,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Card
      className="flex h-full flex-col overflow-hidden border-0 bg-card/55 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
      data-testid="product-card"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {product.category && (
          <div className="absolute left-2 top-2 z-10">
            <Badge variant="secondary">{product.category}</Badge>
          </div>
        )}

        {imageFailed ? (
          <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,hsl(var(--ecom-primary)/0.18),transparent_60%),radial-gradient(circle_at_80%_70%,hsl(var(--ecom-accent)/0.16),transparent_55%)]" />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 will-change-transform hover:scale-[1.04]"
            data-testid="product-card-image"
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        {onToggleWishlist && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-2 z-10 h-9 w-9 rounded-full border-0 bg-background/35 backdrop-blur hover:bg-background/45"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={isWishlisted ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
          </Button>
        )}
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2" data-testid="product-card-name">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2" data-testid="product-card-description">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-2xl font-bold" data-testid="product-card-price">
          ${product.price.toFixed(2)}
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          {onOpenDetails && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenDetails(product.id)}
              className="min-w-0 flex-1 border-0 bg-muted/40 hover:bg-muted/55"
              data-testid="product-card-open-details"
            >
              <Info className="mr-2 h-4 w-4" />
              Details
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={() => onAddToCart(product.id)}
            className={onOpenDetails ? 'min-w-0 flex-1' : 'w-full'}
            data-testid="product-card-add-to-cart"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
