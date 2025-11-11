/**
 * Shows selected items in the cart, displays subtotal, and provides checkout button.
 * Renders a summary of cart items with individual quantities and prices, plus total.
 *
 * @example
 * ```tsx
 * <CartSummary
 *   onCheckout={() => console.log("Proceed to checkout")}
 * />
 * ```
 */

import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { Separator } from '../base/separator';
import { ScrollArea } from '../base/scroll-area';
import { useCart } from '../hooks/useCart';

interface CartSummaryProps {
  onCheckout: () => void;
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const { items: cartItems, totalCost } = useCart();

  const subtotal = cartItems ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;

  return (
    <Card className="w-full max-w-md border shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle>🛍️ Your Cart</CardTitle>
      </CardHeader>
      <CardContent>
        {!cartItems || cartItems.length === 0 ? (
          <p className="text-sm">Your cart is empty.</p>
        ) : (
          <ScrollArea className="pr-2 max-h-60">
            <div className="space-y-3">
              {cartItems.map((item) => (
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
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>${totalCost.toFixed(2)}</span>
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
