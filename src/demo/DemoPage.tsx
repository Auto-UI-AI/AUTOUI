'use client';
import React, { useState } from 'react';
import { Button, ScrollArea, Separator, Card, CardHeader, CardTitle, CardContent } from './base';
import {
  ProductDetailsModal,
  ProductCard,
  ProductGallery,
  CartSummary,
  SearchBar,
  CategoryFilter,
  CheckoutForm,
  OrderConfirmation,
  SizeFilter,
  WishlistPanel,
} from './components';
import { fetchProducts, addToCart } from './functions';
import { InteractiveDemo } from './DemoInteractive';
import { useDarkMode } from './hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';

type ComponentDemo = {
  name: string;
  component: React.ReactNode;
};

type ComponentCategory = {
  name: string;
  components: ComponentDemo[];
};

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const sampleProducts = [
  {
    id: '1',
    name: 'Beige Trench Coat',
    description: 'Lightweight trench for everyday layering.',
    price: 129.99,
    image: img('photo-1521572163474-6864f9cf17ab'),
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: '2',
    name: 'Indigo Denim Jacket',
    description: 'Classic denim with a modern cut.',
    price: 92.0,
    image: img('photo-1521572267360-ee0c2909d518'),
    sizes: ['M', 'L', 'XL'],
  },
  {
    id: '3',
    name: 'White Leather Sneakers',
    description: 'Minimal sneakers with cushioned sole.',
    price: 119.99,
    image: img('photo-1512436991641-6745cdb1723f'),
    sizes: ['8', '9', '10', '11'],
  },
];

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'Interactive Views',
    components: [
      {
        name: 'E-commerce Flow',
        component: <InteractiveDemo />,
      },
    ],
  },
  {
    name: 'Components',
    components: [
      {
        name: 'ProductCard',
        component: <ProductCard product={sampleProducts[0]} onViewDetails={() => {}} onToggleWishlist={() => {}} />,
      },
      {
        name: 'ProductGallery',
        component: (
          <ProductGallery
            products={sampleProducts}
            onAddToCart={async (productId) => {
              await addToCart({ productId });
              console.log('Added to cart:', productId);
            }}
          />
        ),
      },
      {
        name: 'CartSummary',
        component: <CartSummary onCheckout={() => {}} />,
      },
      {
        name: 'SearchBar',
        component: (
          <SearchBar
            onSearch={async (query) => {
              const results = await fetchProducts({ q: query });
              console.log('Search results:', results);
            }}
            placeholder="Search products..."
          />
        ),
      },
      {
        name: 'CategoryFilter',
        component: (
          <CategoryFilter
            categories={['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories']}
            selected="All"
            onSelect={async (category) => {
              const results = await fetchProducts({ category: category === 'All' ? undefined : category });
              console.log('Filtered results:', results);
            }}
          />
        ),
      },
      {
        name: 'SizeFilter',
        component: <SizeFilter sizes={['S', 'M', 'L', 'XL']} selected={['M']} onChange={() => {}} />,
      },
      {
        name: 'CheckoutForm',
        component: <CheckoutForm onSubmit={() => {}} />,
      },
      {
        name: 'OrderConfirmation',
        component: <OrderConfirmation orderId="1234567890" onClose={() => {}} />,
      },
      {
        name: 'ProductDetailsModal',
        component: <ProductDetailsModal product={sampleProducts[0]} open onClose={() => {}} onAddToCart={() => {}} />,
      },
      {
        name: 'WishlistPanel',
        component: <WishlistPanel />, // purely visual preview
      },
    ],
  },
];

function DemoStorybook() {
  const { isDark, toggle } = useDarkMode();
  const [selectedComponent, setSelectedComponent] = useState<{
    category: string;
    name: string;
  } | null>(null);

  const renderPreview = () => {
    if (!selectedComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">Select a component from the sidebar to preview.</p>
        </div>
      );
    }

    const category = COMPONENT_CATEGORIES.find((cat) => cat.name === selectedComponent.category);
    const component = category?.components.find((comp) => comp.name === selectedComponent.name);

    if (!component) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500 dark:text-red-400">Component not found.</p>
        </div>
      );
    }

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{component.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Live preview of {component.name}</p>
        </CardHeader>
        <CardContent>{component.component}</CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Component Gallery</p>
            <h1 className="text-2xl font-semibold">Auto UI Demo</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Explore interactive e-commerce building blocks—cards, galleries, checkout, wishlist, and more. All
              components are responsive so they also look good when rendered inside chat.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9" aria-label="Toggle theme">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-2xl border bg-white/80 p-4 shadow-sm dark:bg-neutral-900/70 dark:border-neutral-800">
          <ScrollArea className="h-[70vh] pr-2">
            {COMPONENT_CATEGORIES.map((category) => (
              <div key={category.name} className="mb-5 last:mb-0">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{category.name}</h3>
                <div className="space-y-2">
                  {category.components.map((component) => {
                    const isSelected =
                      selectedComponent?.name === component.name && selectedComponent?.category === category.name;

                    return (
                      <Button
                        key={component.name}
                        variant={isSelected ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedComponent({ category: category.name, name: component.name })}
                      >
                        {component.name}
                      </Button>
                    );
                  })}
                </div>
                <Separator className="my-4" />
              </div>
            ))}
          </ScrollArea>
        </aside>

        <main className="space-y-6">
          <div className="rounded-2xl border bg-white/90 p-6 shadow-sm dark:bg-neutral-900/80 dark:border-neutral-800">
            {renderPreview()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DemoStorybook;
