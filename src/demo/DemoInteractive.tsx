// Interactive Demo Component
import { useEffect, useMemo, useState } from 'react';
import {
  fetchProducts,
  fetchCategories,
  addToCart,
  getRecommendations,
  getWishlist,
  toggleWishlistItem,
  type Product,
} from './functions';
import {
  SearchBar,
  CategoryFilter,
  ProductGallery,
  CartSummary,
  CheckoutForm,
  OrderConfirmation,
  SizeFilter,
  WishlistPanel,
  ProductDetailsModal,
} from './components';
import { useCart } from './hooks/useCart';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'One Size', '8', '9', '10', '11', '12'];

export function InteractiveDemo() {
  const { items: cartItems, addItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [allSizes, setAllSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      const sizesSet = new Set<string>();
      fetchedProducts.forEach((p) => p.sizes?.forEach((size) => sizesSet.add(size)));
      setAllSizes(Array.from(sizesSet));
      setWishlist(getWishlist());
      setLoading(false);
    };
    loadData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        q: searchQuery || undefined,
        sizes: selectedSizes.length ? selectedSizes : undefined,
      });
      setProducts(fetchedProducts);
      setLoading(false);
    };
    loadProducts();
  }, [selectedCategory, searchQuery, selectedSizes]);

  // Load recommendations when cart changes
  useEffect(() => {
    const loadRecommendations = async () => {
      if (cartItems.length > 0) {
        const recs = await getRecommendations({ cart: cartItems });
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    };
    loadRecommendations();
  }, [cartItems]);

  const handleAddToCart = async (productId: string, size?: string) => {
    const product = products.find((p) => p.id === productId) || wishlist.find((p) => p.id === productId);
    if (!product) return;

    await addToCart({ productId });
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size,
    });
  };

  const handleToggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId) || wishlist.find((p) => p.id === productId);
    if (!product) return;

    const { items } = toggleWishlistItem({ product });
    setWishlist(items);
  };

  const handleCheckout = () => {
    setIsCheckout(true);
  };

  const handleOrderSubmit = () => {
    const generatedOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`;
    setOrderId(generatedOrderId);
    setIsOrderConfirmed(true);
    setIsCheckout(false);
  };

  const handleOrderClose = () => {
    clearCart();
    setIsOrderConfirmed(false);
    setOrderId('');
  };

  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId) || wishlist.find((p) => p.id === activeProductId) || null,
    [activeProductId, products, wishlist],
  );

  const availableSizes = useMemo(() => {
    if (allSizes.length) return allSizes;
    return DEFAULT_SIZES;
  }, [allSizes]);

  return (
    <div className="space-y-6 p-4">
      <div className="grid gap-4 lg:grid-cols-3 lg:items-center">
        <SearchBar onSearch={setSearchQuery} placeholder="Search products..." />
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        <SizeFilter sizes={availableSizes} selected={selectedSizes} onChange={setSelectedSizes} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(320px,1.4fr)]">
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : (
            <ProductGallery
              products={products}
              onAddToCart={handleAddToCart}
              onViewDetails={setActiveProductId}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlist.map((item) => item.id)}
            />
          )}

          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended for You</h3>
              <ProductGallery
                products={recommendations}
                onAddToCart={handleAddToCart}
                onViewDetails={setActiveProductId}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlist.map((item) => item.id)}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isCheckout && !isOrderConfirmed && <CartSummary onCheckout={handleCheckout} />}
          {isCheckout && !isOrderConfirmed && <CheckoutForm onSubmit={handleOrderSubmit} submitLabel="Place Order" />}
          {isOrderConfirmed && <OrderConfirmation orderId={orderId} onClose={handleOrderClose} />}

          <WishlistPanel
            items={wishlist}
            onToggle={(product: Product) => handleToggleWishlist(product.id)}
            onSelect={(product: Product) => setActiveProductId(product.id)}
            onAddToCart={(product: Product, size?: string) => handleAddToCart(product.id, size)}
          />
        </div>
      </div>

      {activeProduct && (
        <ProductDetailsModal
          product={activeProduct}
          open={Boolean(activeProduct)}
          onClose={() => setActiveProductId(null)}
          onAddToCart={(size?: string) => handleAddToCart(activeProduct.id, size)}
        />
      )}
    </div>
  );
}
