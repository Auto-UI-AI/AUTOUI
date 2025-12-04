import { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchCategories,
  addToCart,
  getRecommendations,
  type Product,
  type CartItem,
} from './pages/ecommerce/functions';
import { SearchBar, CategoryFilter, ProductGallery, CartSummary } from './pages/ecommerce/components';

export function InteractiveDemo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        q: searchQuery || undefined,
      });
      setProducts(fetchedProducts);
      setLoading(false);
    };
    loadProducts();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (cart.length > 0) {
        const recs = await getRecommendations({ cart });
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    };
    loadRecommendations();
  }, [cart]);

  const handleAddToCart = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    await addToCart({ productId });
    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
      setCart(cart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const handleCheckout = () => {
    alert(
      `Checkout with ${cart.length} items. Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}`,
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchBar onSearch={setSearchQuery} placeholder="Search products..." />
        <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : (
            <ProductGallery products={products} onAddToCart={handleAddToCart} />
          )}
        </div>

        <div className="lg:col-span-1">
          <CartSummary items={cart} onCheckout={handleCheckout} />
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended for You</h3>
          <ProductGallery products={recommendations} onAddToCart={handleAddToCart} />
        </div>
      )}
    </div>
  );
}
