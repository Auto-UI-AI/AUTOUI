/**
 * Displays the order ID, estimated delivery time (ETA), and total cost.
 */
import React from 'react';

interface OrderConfirmationProps {
  orderId: string;
  eta: string;
  totalCost: number;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, eta, totalCost }) => {
  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Order ID: {orderId}</p>
      <p>Estimated Delivery Time: {eta}</p>
      <p>Total Cost: ${totalCost!=0?totalCost.toFixed(2):0}</p>
    </div>
  );
};

export default OrderConfirmation;
