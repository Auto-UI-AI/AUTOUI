import { useState } from 'react';

import { CartSummary, CheckoutForm, OrderConfirmation } from '../components';
import { checkout } from '../services/autouiFunctions';
import { useEcommerceStore } from '../store/useEcommerceStore';

export default function CheckoutForChat() {
  const cart = useEcommerceStore((s) => s.cart);
  const products = useEcommerceStore((s) => s.products);
  const lastOrder = useEcommerceStore((s) => s.lastOrder);
  const setCartItemQuantity = useEcommerceStore((s) => s.setCartItemQuantity);
  const removeFromCart = useEcommerceStore((s) => s.removeFromCart);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productImageById = (id: string) => products.find((p) => p.id === id)?.image;

  const hasCart = cart.length > 0;

  return (
    <div className="space-y-3">
      {hasCart ? (
        <CartSummary
          cart={cart}
          onQuantityChange={(id, qty) => setCartItemQuantity(id, qty)}
          onRemove={(id) => removeFromCart(id)}
          getItemImage={productImageById}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-card/40 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
          Your cart is empty. Add a few items first, then come back here to checkout.
        </div>
      )}

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {hasCart ? (
        <CheckoutForm
          isSubmitting={isSubmitting}
          onSubmit={async (userInfo) => {
            setError(null);
            setIsSubmitting(true);
            try {
              const result = await checkout(userInfo);
              if (!result.ok) {
                setError(result.error ?? 'Checkout failed.');
              }
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Checkout failed.');
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      ) : lastOrder ? (
        <OrderConfirmation order={lastOrder} />
      ) : null}
    </div>
  );
}
