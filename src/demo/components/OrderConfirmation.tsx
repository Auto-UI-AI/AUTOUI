/**
 * Displays the order ID, estimated delivery time (ETA), and total cost.
 */
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '../base/card';
import { Button } from '../base/button';
import { Separator } from '../base/separator';

interface OrderConfirmationProps {
  orderId: string;
  eta?: string;
  totalCost: number;
  className?: string;
  onClose?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, eta, totalCost, className = '', onClose }) => {
  const formattedTotal = typeof totalCost === 'number' ? `$${totalCost.toFixed(2)}` : '-';

  return (
    <Card className={`w-full max-w-md border shadow-sm rounded-xl ${className}`}>
      <CardHeader>
        <CardTitle>✅ Order Confirmed</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs">Order ID</div>
            <div className="font-mono text-sm mt-1">{orderId}</div>
          </div>

          {eta && (
            <div>
              <div className="text-xs">Estimated delivery</div>
              <div className="mt-1">{eta}</div>
            </div>
          )}

          <div>
            <div className="text-xs">Total</div>
            <div className="font-medium mt-1">{formattedTotal}</div>
          </div>

          <Separator className="my-2" />

          <div className="text-sm">Thank you for your purchase! We'll email you updates about your order.</div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderConfirmation;
