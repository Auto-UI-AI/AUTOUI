import { useEffect, useMemo, useState } from 'react';

import { CategoryFilter, ProductDetailsModal, ProductGallery, SearchBar, SizeFilter } from '../components';
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

      <ProductGallery
        products={filtered}
        onAddToCart={(productId) => {
          const product = products.find((p) => p.id === productId);
          if (!product) return;
          addToCart({ id: product.id, name: product.name, price: product.price });
        }}
        onOpenDetails={(productId) => setDetailsId(productId)}
        onToggleWishlist={(productId) => {
          const product = products.find((p) => p.id === productId);
          if (!product) return;
          toggleWishlist({ id: product.id, name: product.name, price: product.price });
        }}
        isWishlisted={(productId) => wishlist.some((w) => w.id === productId)}
      />

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
