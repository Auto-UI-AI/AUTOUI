import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/demo/base/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/demo/base/dialog';
import { Input } from '@/demo/base/input';
import { ScrollArea } from '@/demo/base/scrollArea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/demo/base/sheet';
import { useDarkMode } from '@/demo/hooks/useDarkMode';

import { Heart, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react';

import { ModalChat } from '@lib/components';

import { ecommerceAutouiConfig } from '../autoui.config';
import CartSummary from '../components/CartSummary';
import CheckoutForm from '../components/CheckoutForm';
import OrderConfirmation from '../components/OrderConfirmation';
import WishlistPanel from '../components/WishlistPanel';
import { submitOrder } from '../functions/submitOrder';
import { useEcommerceStore } from '../store/useEcommerceStore';

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === '/demo/ecommerce'}
      className={({ isActive }) =>
        [
          'text-sm font-medium transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  );
}

export default function EcommerceLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDark, toggle } = useDarkMode();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const cartCount = useEcommerceStore((s) => s.cart.reduce((sum, i) => sum + i.quantity, 0));
  const wishlistCount = useEcommerceStore((s) => s.wishlist.length);

  const cart = useEcommerceStore((s) => s.cart);
  const products = useEcommerceStore((s) => s.products);
  const setCartItemQuantity = useEcommerceStore((s) => s.setCartItemQuantity);
  const removeFromCart = useEcommerceStore((s) => s.removeFromCart);
  const clearCart = useEcommerceStore((s) => s.clearCart);

  const wishlist = useEcommerceStore((s) => s.wishlist);
  const removeFromWishlist = useEcommerceStore((s) => s.removeFromWishlist);

  const lastOrder = useEcommerceStore((s) => s.lastOrder);
  const setLastOrder = useEcommerceStore((s) => s.setLastOrder);

  const cartSubtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);

  const urlQuery = searchParams.get('q') ?? '';
  const [headerQuery, setHeaderQuery] = useState<string>(urlQuery);

  useEffect(() => {
    setHeaderQuery(urlQuery);
  }, [urlQuery]);

  const commitSearch = (nextQuery: string) => {
    const q = nextQuery.trim();
    const next = q ? `/demo/ecommerce?q=${encodeURIComponent(q)}` : '/demo/ecommerce';
    navigate(next);
  };

  useEffect(() => {
    // Keep URL query in sync *only on the Shop page*.
    // This prevents "jumping back" to Shop when navigating to other pages.
    if (location.pathname !== '/demo/ecommerce') return;

    const handle = window.setTimeout(() => {
      const q = headerQuery.trim();
      const next = q ? `/demo/ecommerce?q=${encodeURIComponent(q)}` : '/demo/ecommerce';
      const current = location.search || '';
      const desired = q ? `?q=${encodeURIComponent(q)}` : '';
      if (current !== desired) navigate(next, { replace: true });
    }, 250);

    return () => window.clearTimeout(handle);
  }, [headerQuery, location.pathname, location.search, navigate]);

  useEffect(() => {
    document.documentElement.classList.add('ecommerce-app');
    document.body.classList.add('ecommerce-app');
    return () => {
      document.body.classList.remove('ecommerce-app');
      document.documentElement.classList.remove('ecommerce-app');
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const productImageById = (id: string) => products.find((p) => p.id === id)?.image;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background: subtle gradients + glassy noise, scoped to ecommerce */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-90 motion-safe:animate-[ecom-bg_18s_ease-in-out_infinite] [background:radial-gradient(circle_at_15%_10%,hsl(var(--ecom-primary)/0.34),transparent_42%),radial-gradient(circle_at_80%_20%,hsl(var(--ecom-accent)/0.26),transparent_45%),radial-gradient(circle_at_40%_95%,hsl(var(--ecom-primary)/0.18),transparent_52%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.02))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.25))]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.10] dark:opacity-[0.12] [background:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_35%_20%,black,transparent_70%)]"
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 shadow-sm shadow-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/demo/ecommerce" className="text-base font-semibold tracking-tight">
              AUTOUI Atelier
            </Link>
            <nav className="hidden items-center gap-4 md:flex">
              <NavItem to="/demo/ecommerce/shipping" label="Shipping & Returns" />
              <NavItem to="/demo/ecommerce/contact" label="Contact" />
              <NavItem to="/demo/ecommerce/about" label="About" />
            </nav>
          </div>

          <div className="hidden w-full max-w-md md:block">
            <div className="relative" aria-label="Search">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitSearch(headerQuery);
                }}
                placeholder="Search…"
                className="border-0 bg-card/50 pl-9 pr-9 shadow-sm backdrop-blur"
              />
              {headerQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setHeaderQuery('');
                    if (location.pathname === '/demo/ecommerce') commitSearch('');
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="border-0 bg-background/35 backdrop-blur hover:bg-background/45"
              onClick={toggle}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="relative border-0 bg-background/35 backdrop-blur hover:bg-background/45"
                  aria-label="Open wishlist"
                  title="Wishlist"
                >
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
                      {wishlistCount}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-screen max-w-[100vw] overflow-x-hidden border-0 bg-background/40 backdrop-blur-xl sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your wishlist</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 pt-0">
                    <WishlistPanel wishlist={wishlist} onRemove={(id) => removeFromWishlist(id)} />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="relative border-0 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  aria-label="Open cart"
                  title="Cart"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 text-[11px] font-semibold leading-none text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-screen max-w-[100vw] overflow-x-hidden border-0 bg-background/40 backdrop-blur-xl sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Your cart</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="p-4 pt-0">
                    <CartSummary
                      cart={cart}
                      onQuantityChange={(productId, quantity) => setCartItemQuantity(productId, quantity)}
                      onRemove={(productId) => removeFromCart(productId)}
                      getItemImage={productImageById}
                      onCheckout={() => setCheckoutOpen(true)}
                    />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 pb-3 md:hidden">
          <div className="mb-3">
            <div className="relative" aria-label="Search">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={headerQuery}
                onChange={(e) => setHeaderQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitSearch(headerQuery);
                }}
                placeholder="Search…"
                className="border-0 bg-card/50 pl-9 pr-9 shadow-sm backdrop-blur"
              />
              {headerQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setHeaderQuery('');
                    if (location.pathname === '/demo/ecommerce') commitSearch('');
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <NavItem to="/demo/ecommerce" label="Shop" />
            <NavItem to="/demo/ecommerce/about" label="About" />
            <NavItem to="/demo/ecommerce/shipping" label="Shipping & Returns" />
            <NavItem to="/demo/ecommerce/contact" label="Contact" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto bg-background/25 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">AUTOUI Atelier</div>
              <div className="mt-2 text-sm text-muted-foreground">Demo apparel shop UI with AutoUI chat.</div>
            </div>
            <div className="grid gap-2 text-sm">
              <Link className="text-muted-foreground hover:text-foreground" to="/demo/ecommerce/about">
                About
              </Link>
              <Link className="text-muted-foreground hover:text-foreground" to="/demo/ecommerce/shipping">
                Shipping & Returns
              </Link>
              <Link className="text-muted-foreground hover:text-foreground" to="/demo/ecommerce/contact">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Note</div>
              <div className="mt-2">This is a demo. Products, prices and policies are mock.</div>
            </div>
          </div>

          <div className="mt-8 text-xs text-muted-foreground">
            © {new Date().getFullYear()} AUTOUI Atelier — Demo storefront.
          </div>
        </div>
      </footer>

      <ModalChat config={ecommerceAutouiConfig} />

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="border-0 bg-background/55 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl bg-muted/30 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">${cartSubtotal.toFixed(2)}</span>
            </div>
          </div>
          <CheckoutForm
            isSubmitting={isSubmittingOrder}
            submitLabel={cart.length > 0 ? `Place order · $${cartSubtotal.toFixed(2)}` : 'Place order'}
            onSubmit={async (data) => {
              try {
                setIsSubmittingOrder(true);
                const receipt = submitOrder({ user: data, cart });
                setLastOrder(receipt);
                clearCart();
                setCheckoutOpen(false);
                setOrderOpen(true);
              } finally {
                setIsSubmittingOrder(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="border-0 bg-background/55 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Order confirmed</DialogTitle>
          </DialogHeader>
          {lastOrder ? <OrderConfirmation order={lastOrder} onContinueShopping={() => setOrderOpen(false)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
