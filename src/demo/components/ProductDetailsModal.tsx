/**
 * Modal window showing detailed information about a selected product.
 */
import React, { useState } from 'react';
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
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button onClick={handleOpen}>View Details</Button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-md mb-4" />
              <CardDescription>{product.description}</CardDescription>
              <p className="text-2xl font-bold mt-4">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button>Add to Cart</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default ProductDetailsModal;
