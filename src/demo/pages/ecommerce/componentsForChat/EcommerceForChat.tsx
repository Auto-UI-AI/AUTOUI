import CartForChat from './CartForChat';
import CheckoutForChat from './CheckoutForChat';
import LastOrderForChat from './LastOrderForChat';
import ProductsForChat from './ProductsForChat';
import WishlistForChat from './WishlistForChat';

type EcommerceView = 'products' | 'cart' | 'wishlist' | 'checkout' | 'lastOrder';

export default function EcommerceForChat(props: {
  view?: EcommerceView;
  category?: string;
  q?: string;
  size?: string;
}) {
  const view = props.view ?? 'products';

  switch (view) {
    case 'cart':
      return <CartForChat />;
    case 'wishlist':
      return <WishlistForChat />;
    case 'checkout':
      return <CheckoutForChat />;
    case 'lastOrder':
      return <LastOrderForChat />;
    case 'products':
    default:
      return <ProductsForChat category={props.category} q={props.q} size={props.size} />;
  }
}
