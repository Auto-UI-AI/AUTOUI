/**
 * Displays the order ID, estimated delivery time (ETA), and total cost.
 */
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { Separator } from '../base/separator';
import { ScrollArea } from '../base/scroll-area';
import { useCart } from '../hooks/useCart';

interface OrderConfirmationProps {
  orderId: string;
  className?: string;
  onClose?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, className = '', onClose }) => {
  const { items, totalCost } = useCart();

  return (
    <Card className={`w-full border shadow-sm rounded-xl ${className}`}>
      <CardHeader>
        <CardTitle>✅ Order Confirmed</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Order ID</div>
            <div className="font-mono text-sm mt-1">{orderId}</div>
          </div>

          <Separator className="my-2" />

          <ScrollArea className="pr-2 max-h-60">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.id}-${item.size || 'nosize'}`} className="flex justify-between text-sm">
                  <span className="truncate">
                    {item.name}
                    {item.size && <span className="ml-1 text-xs text-muted-foreground">• Size {item.size}</span>}{' '}
                    <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <Separator className="my-2" />

          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span>${totalCost.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onClose} className="w-full" size="lg">
          Done
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderConfirmation;
