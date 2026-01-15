import { useEffect, useMemo, useState } from 'react';

import { Heart, ShoppingBag } from 'lucide-react';

import { Button } from '@/demo/base/button';

import { CategoryFilter, ProductDetailsModal, SearchBar, SizeFilter } from '../components';
import { fetchCategories, fetchProducts } from '../functions';
import { useEcommerceStore } from '../store/useEcommerceStore';

export default function ProductsForChat(props: { category?: string; q?: string; size?: string }) {
  const { category, q, size } = props;
  const [selectedCategory, setSelectedCategory] = useState<string>(category ?? 'All');
  const [searchQuery, setSearchQuery] = useState<string>(q ?? '');
  const [selectedSize, setSelectedSize] = useState<string | undefined>(size);

  const products = useEcommerceStore((s) => s.products);
  const categories = useEcommerceStore((s) => s.categories);
  const wishlist = useEcommerceStore((s) => s.wishlist);
  const addToCart = useEcommerceStore((s) => s.addToCart);
  const toggleWishlist = useEcommerceStore((s) => s.toggleWishlist);
  const setProducts = useEcommerceStore((s) => s.setProducts);
  const setCategories = useEcommerceStore((s) => s.setCategories);

  const [detailsId, setDetailsId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (categories.length <= 1) {
        const fetchedCategories = await fetchCategories();
        if (!cancelled) setCategories(fetchedCategories);
      }
      if (products.length === 0) {
        const fetchedProducts = await fetchProducts({});
        if (!cancelled) setProducts(fetchedProducts);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [categories.length, products.length, setCategories, setProducts]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const hay = `${p.name} ${p.description} ${p.category ?? ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      if (selectedSize && p.sizes && p.sizes.length > 0 && !p.sizes.includes(selectedSize)) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedSize]);

  const detailsProduct = detailsId ? products.find((p) => p.id === detailsId) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar onSearch={setSearchQuery} placeholder="Search products…" />
        <SizeFilter sizes={['XS', 'S', 'M', 'L', 'XL']} selected={selectedSize} onFilter={setSelectedSize} />
      </div>

      <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="space-y-4 rounded-2xl border-0 bg-card/45 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Products</div>
            <div className="text-xs text-muted-foreground">{filtered.length} results</div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">No products found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const isWishlisted = wishlist.some((w) => w.id === p.id);
              return (
                <div key={p.id} className="rounded-2xl bg-muted/20 p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background/40">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>${p.price.toFixed(2)}</span>
                        {p.category ? <span>• {p.category}</span> : null}
                        {p.sizes?.length ? <span>• sizes: {p.sizes.join(', ')}</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-0 sm:justify-end">
                    <Button type="button" variant="secondary" className="h-9" onClick={() => setDetailsId(p.id)}>
                      Details
                    </Button>

                    <Button
                      type="button"
                      className="h-9"
                      onClick={() => addToCart({ id: p.id, name: p.name, price: p.price })}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Add
                    </Button>

                    <Button
                      type="button"
                      variant={isWishlisted ? 'default' : 'ghost'}
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => toggleWishlist({ id: p.id, name: p.name, price: p.price })}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsId(null)}
          onAddToCart={(productId) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return;
            addToCart({ id: product.id, name: product.name, price: product.price });
          }}
          onToggleWishlist={(productId) => {
            const product = products.find((p) => p.id === productId);
            if (!product) return;
            toggleWishlist({ id: product.id, name: product.name, price: product.price });
          }}
          isWishlisted={wishlist.some((w) => w.id === detailsProduct.id)}
        />
      )}
    </div>
  );
}
