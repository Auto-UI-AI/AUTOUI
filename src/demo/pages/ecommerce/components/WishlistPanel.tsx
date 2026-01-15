import { Button } from '@/demo/base/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/demo/base/card';
import { ScrollArea } from '@/demo/base/scrollArea';
import { Separator } from '@/demo/base/separator';

interface WishlistPanelProps {
  wishlist: { id: string; name: string; price: number }[];
  onRemove?: (productId: string) => void;
  onAddToCart?: (productId: string) => void;
}

export default function WishlistPanel({ wishlist, onRemove, onAddToCart }: WishlistPanelProps) {
  return (
    <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>Wishlist</CardTitle>
      </CardHeader>
      <CardContent>
        {wishlist.length === 0 ? (
          <div className="text-sm text-muted-foreground">No saved items yet.</div>
        ) : (
          <ScrollArea className="max-h-80 pr-2">
            <div className="space-y-3">
              {wishlist.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">${item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {onAddToCart && (
                        <Button size="sm" onClick={() => onAddToCart(item.id)}>
                          Add
                        </Button>
                      )}
                      {onRemove && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-0 bg-muted/50"
                          onClick={() => onRemove(item.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  {idx !== wishlist.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
