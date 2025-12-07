import React from 'react';

interface WishlistPanelProps {
  wishlist: { id: string; name: string; price: number }[];
}

const WishlistPanel: React.FC<WishlistPanelProps> = ({ wishlist }) => {
  return (
    <div className="wishlist-panel">
      <h2>Wishlist</h2>
      <ul>
        {wishlist.map((item) => (
          <li key={item.id}>
            {item.name} - ${item.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WishlistPanel;
