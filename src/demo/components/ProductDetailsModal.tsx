/**
 * Modal window showing detailed information about a selected product.
 */
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../base/card';
import { Button } from '../base/button';

interface ProductDetailsModalProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  open: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, open, onClose, onAddToCart }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-xl md:max-w-2xl max-h-[85vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-md mb-4" />
          <CardDescription>{product.description}</CardDescription>
          <p className="text-2xl font-bold mt-4">${product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onAddToCart && <Button onClick={onAddToCart}>Add to Cart</Button>}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductDetailsModal;
