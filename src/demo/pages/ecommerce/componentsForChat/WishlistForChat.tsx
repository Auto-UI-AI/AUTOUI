import { WishlistPanel } from '../components';
import { useEcommerceStore } from '../store/useEcommerceStore';

export default function WishlistForChat() {
  const wishlist = useEcommerceStore((s) => s.wishlist);
  const removeFromWishlist = useEcommerceStore((s) => s.removeFromWishlist);
  const products = useEcommerceStore((s) => s.products);
  const addToCart = useEcommerceStore((s) => s.addToCart);

  return (
    <WishlistPanel
      wishlist={wishlist}
      onRemove={(id) => removeFromWishlist(id)}
      onAddToCart={(id) => {
        const p = products.find((x) => x.id === id);
        if (!p) return;
        addToCart({ id: p.id, name: p.name, price: p.price });
      }}
    />
  );
}
