import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../base/card';
import { Separator } from '../base/separator';
import { ScrollArea } from '../base/scroll-area';
import { Button } from '../base/button';
import { getWishlist, toggleWishlistItem, type Product } from '../functions';
import { Heart } from 'lucide-react';

interface WishlistPanelProps {
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string) => void;
  items?: Product[];
  onToggle?: (product: Product) => void;
}

export default function WishlistPanel({ onSelect, onAddToCart, items: controlledItems, onToggle }: WishlistPanelProps) {
  const [items, setItems] = useState<Product[]>(controlledItems ?? []);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Keep internal state in sync with external control
  useEffect(() => {
    if (controlledItems) {
      setItems(controlledItems);
      const nextSizes: Record<string, string> = {};
      controlledItems.forEach((item) => {
        if (item.sizes && item.sizes.length) {
          nextSizes[item.id] = item.sizes[0];
        }
      });
      setSelectedSizes((prev) => ({ ...nextSizes, ...prev }));
      return;
    }
    const stored = getWishlist();
    setItems(stored);
    const nextSizes: Record<string, string> = {};
    stored.forEach((item) => {
      if (item.sizes && item.sizes.length) {
        nextSizes[item.id] = item.sizes[0];
      }
    });
    setSelectedSizes((prev) => ({ ...nextSizes, ...prev }));
  }, [controlledItems]);

  const handleToggle = (product: Product) => {
    if (onToggle) {
      onToggle(product);
      return;
    }

    const { items: updated } = toggleWishlistItem({ product });
    setItems(updated);
  };

  return (
    <Card className="w-full border shadow-sm rounded-xl" data-testid="wishlist-panel">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4" /> Wishlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No favorites yet.</p>
        ) : (
          <ScrollArea className="max-h-[70vh] h-[360px] pr-2">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    {item.sizes && item.sizes.length > 0 && (
                      <div className="space-y-1" data-testid="wishlist-item-sizes">
                        <p className="text-xs text-muted-foreground">Choose size</p>
                        <div className="flex flex-wrap gap-2">
                          {item.sizes.map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                selectedSizes[item.id] === size
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted'
                              }`}
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {onSelect && (
                        <Button variant="ghost" size="sm" onClick={() => onSelect(item)}>
                          View
                        </Button>
                      )}
                      {onAddToCart && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddToCart(item, selectedSizes[item.id] || item.sizes?.[0])}
                        >
                          Add to cart
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove from wishlist"
                    onClick={() => handleToggle(item)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator className="my-4" />
      </CardContent>
      <CardFooter className="justify-end">
        <p className="text-xs text-muted-foreground">Toggle items to add or remove them from favorites.</p>
      </CardFooter>
    </Card>
  );
}
