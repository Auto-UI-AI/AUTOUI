import React from 'react';

import { Badge } from '@/demo/base/badge';
import { Button } from '@/demo/base/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/demo/base/dialog';

interface ProductDetailsModalProps {
  product: { id: string; name: string; description: string; price: number; image?: string; category?: string };
  onClose: () => void;
  onAddToCart?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted?: boolean;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl overflow-hidden border-0 bg-background/55 p-0 shadow-2xl backdrop-blur-xl">
        <div className="grid sm:grid-cols-2">
          <div className="relative bg-muted/25">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="aspect-square h-full w-full object-cover sm:aspect-auto"
              />
            ) : (
              <div className="aspect-square w-full" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--ecom-primary)/0.22),transparent_55%),radial-gradient(circle_at_80%_75%,hsl(var(--ecom-accent)/0.18),transparent_55%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="flex flex-col gap-5 p-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="flex items-start justify-between gap-3">
                <span className="pr-8 text-xl leading-tight">{product.name}</span>
                {product.category && <Badge className="border-0 bg-muted/45">{product.category}</Badge>}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">{product.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Price</div>
              <div className="text-3xl font-semibold">${product.price.toFixed(2)}</div>
            </div>

            <div className="mt-auto space-y-2">
              {onAddToCart && (
                <Button onClick={() => onAddToCart(product.id)} className="w-full">
                  Add to cart
                </Button>
              )}
              {onToggleWishlist && (
                <Button
                  variant="secondary"
                  onClick={() => onToggleWishlist(product.id)}
                  className="w-full border-0 bg-muted/40 hover:bg-muted/55"
                >
                  {isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                </Button>
              )}
              <div className="rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">
                Free returns · 2-year warranty · Fast shipping
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
