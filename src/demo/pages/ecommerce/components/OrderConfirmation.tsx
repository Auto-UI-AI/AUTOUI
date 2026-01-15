import React from 'react';

import { Badge } from '@/demo/base/badge';
import { Button } from '@/demo/base/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';

import type { OrderReceipt } from '../types';

interface OrderConfirmationProps {
  order: OrderReceipt;
  onContinueShopping?: () => void;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, onContinueShopping }) => {
  return (
    <Card className="border-0 bg-card/60 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Order confirmed</span>
          <Badge variant="secondary">Paid</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Order ID</span>
          <span className="font-medium">{order.orderId}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">ETA</span>
          <span className="font-medium">{order.eta}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">
            ${Number.isFinite(order.totalCost) ? order.totalCost.toFixed(2) : '0.00'}
          </span>
        </div>
      </CardContent>
      {onContinueShopping && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={onContinueShopping}>
            Continue shopping
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default OrderConfirmation;
