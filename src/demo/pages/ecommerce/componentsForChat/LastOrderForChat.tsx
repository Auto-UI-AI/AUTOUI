import { OrderConfirmation } from '../components';
import { useEcommerceStore } from '../store/useEcommerceStore';

export default function LastOrderForChat() {
  const lastOrder = useEcommerceStore((s) => s.lastOrder);

  if (!lastOrder) {
    return <div className="text-sm text-muted-foreground">No order yet. Ask me to checkout first.</div>;
  }

  return <OrderConfirmation order={lastOrder} />;
}
