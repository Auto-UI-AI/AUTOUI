import { CartSummary } from '../components';
import { useEcommerceStore } from '../store/useEcommerceStore';

export default function CartForChat() {
  const cart = useEcommerceStore((s) => s.cart);
  const products = useEcommerceStore((s) => s.products);
  const setCartItemQuantity = useEcommerceStore((s) => s.setCartItemQuantity);
  const removeFromCart = useEcommerceStore((s) => s.removeFromCart);

  const productImageById = (id: string) => products.find((p) => p.id === id)?.image;

  return (
    <CartSummary
      cart={cart}
      onQuantityChange={(id, qty) => setCartItemQuantity(id, qty)}
      onRemove={(id) => removeFromCart(id)}
      getItemImage={productImageById}
    />
  );
}
