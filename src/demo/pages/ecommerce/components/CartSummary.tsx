import { Button } from '@/demo/base/button';
import { Minus, Plus, Trash2 } from 'lucide-react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartSummaryProps = {
  cart: CartItem[];
  onCheckout?: () => void;
  onQuantityChange?: (productId: string, newQuantity: number) => void;
  onRemove?: (productId: string) => void;
  getItemImage?: (productId: string) => string | undefined;
};

export default function CartSummary({ cart, onCheckout, onQuantityChange, onRemove, getItemImage }: CartSummaryProps) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="space-y-4 rounded-2xl border-0 bg-card/45 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Cart</div>
          <div className="text-xs text-muted-foreground">{cart.length} item types</div>
        </div>
        <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm font-semibold tabular-nums">
          ${subtotal.toFixed(2)}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">Your cart is empty.</div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => {
            const img = getItemImage?.(item.id);
            return (
              <div key={item.id} className="rounded-2xl bg-muted/20 p-3">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background/40">
                    {img ? (
                      <img src={img} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">${item.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-0 sm:justify-end">
                  {onQuantityChange ? (
                    <div className="flex items-center gap-1 rounded-xl bg-background/35 p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">× {item.quantity}</span>
                  )}

                  <div className="w-16 text-right text-sm font-semibold tabular-nums sm:w-20">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {onRemove ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.18),transparent)] dark:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.12),transparent)]" />

      <div className="rounded-2xl bg-muted/20 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">Taxes and shipping are calculated at checkout.</div>
      </div>

      {onCheckout ? (
        <Button
          onClick={onCheckout}
          className="w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          disabled={cart.length === 0}
        >
          Checkout
        </Button>
      ) : null}
    </div>
  );
}
