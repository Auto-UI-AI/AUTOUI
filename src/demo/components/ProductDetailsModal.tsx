/**
 * Modal window showing detailed information about a selected product.
 */
import React from 'react';

interface ProductDetailsModalProps {
  product: { id: string; name: string; description: string; price: number };
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose }) => {
  return (
    <div className="modal">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price.toFixed(2)}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ProductDetailsModal;
