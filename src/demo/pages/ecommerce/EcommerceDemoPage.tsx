import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CategoryFilter, ProductDetailsModal, ProductGallery, SizeFilter } from './components';
import { fetchCategories, fetchProducts, getRecommendations, type Product } from './functions';
import { useEcommerceStore } from './store/useEcommerceStore';

export default function EcommerceDemoPage() {
  const [searchParams] = useSearchParams();

  const products = useEcommerceStore((s) => s.products);
  const categories = useEcommerceStore((s) => s.categories);
  const cart = useEcommerceStore((s) => s.cart);
  const wishlist = useEcommerceStore((s) => s.wishlist);

  const setProducts = useEcommerceStore((s) => s.setProducts);
  const setCategories = useEcommerceStore((s) => s.setCategories);
  const addToCartStore = useEcommerceStore((s) => s.addToCart);
  const toggleWishlist = useEcommerceStore((s) => s.toggleWishlist);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [detailsProductId, setDetailsProductId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    void loadData();
  }, [setCategories, setProducts]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (cart.length > 0) {
        const recs = await getRecommendations({ cart });
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    };
    void loadRecommendations();
  }, [cart]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.name} ${p.description} ${p.category ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedSize && p.sizes && p.sizes.length > 0 && !p.sizes.includes(selectedSize)) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedSize]);

  const detailsProduct = useMemo(() => {
    return detailsProductId ? products.find((p) => p.id === detailsProductId) : undefined;
  }, [detailsProductId, products]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
        <p className="text-sm text-muted-foreground">Modern essentials with a glassy, minimal vibe.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div
            id="products"
            className="sticky top-24 space-y-6 rounded-2xl border-0 bg-card/50 p-4 shadow-sm backdrop-blur"
          >
            <div className="space-y-2">
              <div className="text-sm font-medium">Categories</div>
              <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Size</div>
              <SizeFilter sizes={['XS', 'S', 'M', 'L', 'XL']} selected={selectedSize} onFilter={setSelectedSize} />
            </div>

            {(selectedCategory !== 'All' || selectedSize) && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedSize(undefined);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading…' : `${filteredProducts.length} products`}
              {searchQuery ? ` for “${searchQuery}”` : ''}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading products…</div>
          ) : (
            <ProductGallery
              products={filteredProducts}
              onAddToCart={(productId) => {
                const p = products.find((x) => x.id === productId);
                if (!p) return;
                addToCartStore({ id: p.id, name: p.name, price: p.price });
              }}
              onOpenDetails={(productId) => setDetailsProductId(productId)}
              onToggleWishlist={(productId) => {
                const p = products.find((x) => x.id === productId);
                if (!p) return;
                toggleWishlist({ id: p.id, name: p.name, price: p.price });
              }}
              isWishlisted={(productId) => wishlist.some((w) => w.id === productId)}
            />
          )}

          {recommendations.length > 0 && (
            <div className="mt-10 space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">Recommended for you</h3>
                <span className="text-sm text-muted-foreground">Based on your cart</span>
              </div>
              <ProductGallery
                products={recommendations}
                onAddToCart={(productId) => {
                  const p = recommendations.find((x) => x.id === productId) || products.find((x) => x.id === productId);
                  if (!p) return;
                  addToCartStore({ id: p.id, name: p.name, price: p.price });
                }}
                onOpenDetails={(productId) => setDetailsProductId(productId)}
                onToggleWishlist={(productId) => {
                  const p = recommendations.find((x) => x.id === productId) || products.find((x) => x.id === productId);
                  if (!p) return;
                  toggleWishlist({ id: p.id, name: p.name, price: p.price });
                }}
                isWishlisted={(productId) => wishlist.some((w) => w.id === productId)}
              />
            </div>
          )}
        </section>
      </div>
      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsProductId(null)}
          onAddToCart={(productId) => {
            const p = products.find((x) => x.id === productId);
            if (!p) return;
            addToCartStore({ id: p.id, name: p.name, price: p.price });
          }}
          onToggleWishlist={(productId) => {
            const p = products.find((x) => x.id === productId);
            if (!p) return;
            toggleWishlist({ id: p.id, name: p.name, price: p.price });
          }}
          isWishlisted={wishlist.some((w) => w.id === detailsProduct.id)}
        />
      )}
    </main>
  );
}
