/**
 * Shows selected items in the cart, displays subtotal, and provides checkout button.
 * Renders a summary of cart items with individual quantities and prices, plus total.
 *
 * @example
 * ```tsx
 * <CartSummary
 *   items={[
 *     { id: "1", name: "Beige Coat", price: 89.99, quantity: 2 },
 *     { id: "2", name: "Denim Jacket", price: 69.99, quantity: 1 }
 *   ]}
 *   onCheckout={() => console.log("Proceed to checkout")}
 * />
 * ```
 */

import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/demo/base/card';
import { Button } from '@/demo/base/button';
import { Separator } from '@/demo/base/separator';
import { ScrollArea } from '@/demo/base/scroll-area';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartSummaryProps {
  items?: CartItem[];
  onCheckout: () => void;
}

export default function CartSummary({ items, onCheckout }: CartSummaryProps) {
  const subtotal = items ? items.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;

  return (
    <Card className="w-full max-w-md border shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle>🛍️ Your Cart</CardTitle>
      </CardHeader>
      <CardContent>
        {!items || items.length === 0 ? (
          <p className="text-sm text-gray-500">Your cart is empty.</p>
        ) : (
          <ScrollArea className="pr-2 max-h-60">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate">
                    {item.name} <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Separator className="my-4" />

        <div className="flex justify-between text-base font-medium">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onCheckout} className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
