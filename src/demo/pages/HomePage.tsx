import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button, ScrollArea, Separator, Card, CardHeader, CardTitle, CardContent } from '@/demo/base';
import {
  ProductDetailsModal,
  ProductCard,
  ProductGallery,
  CartSummary,
  SearchBar,
  CategoryFilter,
  SizeFilter,
  CheckoutForm,
  OrderConfirmation,
  WishlistPanel,
} from '@/demo/pages/ecommerce/components';
import { useDarkMode } from '@/demo/hooks';
import { fetchProducts, addToCart } from '@/demo/pages/ecommerce/functions';
import { PLACEHOLDER_IMAGE } from '@/demo/constants';

type ComponentDemo = {
  name: string;
  component?: React.ReactNode; // Only needed for preview items (not route-based)
  route?: string; // If provided, button will be a link instead of showing preview
};

type ComponentCategory = {
  name: string;
  components: ComponentDemo[];
};

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'Demos',
    components: [
      {
        name: 'E-commerce Flow',
        route: '/demo/ecommerce',
      },
      {
        name: 'Observability Copilot',
        route: '/demo/observability',
      },
      {
        name: 'Task Manager',
        route: '/demo/task-manager',
      },
    ],
  },
  {
    name: 'components',
    components: [
      {
        name: 'ProductCard',
        component: (
          <div className="w-64">
            <ProductCard
              product={{
                id: '1',
                name: 'Beige Coat',
                description: 'A stylish beige coat for modern fashion.',
                price: 89.99,
                image: PLACEHOLDER_IMAGE,
              }}
              onAddToCart={() => {}}
            />
          </div>
        ),
      },
      {
        name: 'ProductGallery',
        component: (
          <ProductGallery
            products={[
              {
                id: '1',
                name: 'Beige Coat',
                description: 'A stylish beige coat for modern fashion.',
                price: 89.99,
                image: PLACEHOLDER_IMAGE,
              },
              {
                id: '2',
                name: 'Denim Jacket',
                description: 'Classic denim jacket for everyday wear.',
                price: 69.99,
                image: PLACEHOLDER_IMAGE,
              },
              {
                id: '3',
                name: 'Black Jeans',
                description: 'Comfortable black jeans with modern fit.',
                price: 49.99,
                image: PLACEHOLDER_IMAGE,
              },
            ]}
            onAddToCart={async (productId) => {
              await addToCart({ productId });
              console.log('Added to cart:', productId);
            }}
          />
        ),
      },
      {
        name: 'CartSummary',
        component: (
          <CartSummary
            cart={[
              { id: '1', name: 'Beige Coat', price: 89.99, quantity: 2 },
              { id: '2', name: 'Denim Jacket', price: 69.99, quantity: 1 },
            ]}
            onCheckout={() => {}}
          />
        ),
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
        name: 'CheckoutForm',
        component: <CheckoutForm onSubmit={() => {}} />,
      },
      {
        name: 'OrderConfirmation',
        component: (
          <OrderConfirmation
            order={{
              orderId: '1234567890',
              eta: '2 days',
              totalCost: 100,
              createdAtIso: new Date().toISOString(),
            }}
          />
        ),
      },
      {
        name: 'ProductDetailsModal',
        component: (
          <ProductDetailsModal
            product={{ id: '1', name: 'Product 1', description: 'Product 1 description', price: 100 }}
            onClose={() => {}}
          />
        ),
      },
      {
        name: 'SizeFilter',
        component: <SizeFilter sizes={['S', 'M', 'L', 'XL']} onFilter={() => {}} />,
      },
      {
        name: 'WishlistPanel',
        component: (
          <WishlistPanel
            wishlist={[
              { id: '1', name: 'Product 1', price: 100 },
              { id: '2', name: 'Product 2', price: 200 },
            ]}
          />
        ),
      },
    ],
  },
];

export default function HomePage() {
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

    if (component.route || !component.component) {
      return null;
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
    <>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold dark:text-gray-100">Auto UI Demo</h2>
            <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-5rem)] pr-2">
            {COMPONENT_CATEGORIES.map((category) => (
              <div key={category.name} className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{category.name}</h3>
                <div className="space-y-1">
                  {category.components.map((component) => {
                    const isSelected =
                      selectedComponent?.name === component.name && selectedComponent?.category === category.name;

                    // If route is provided, render as Link; otherwise as Button
                    if (component.route) {
                      return (
                        <Button
                          key={component.name}
                          variant={isSelected ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to={component.route} target="_blank">
                            {component.name}
                          </Link>
                        </Button>
                      );
                    }

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
                <Separator className="my-3" />
              </div>
            ))}
          </ScrollArea>
        </aside>
        {/* Preview Pane */}
        <main className="flex-1 overflow-y-auto p-10">{renderPreview()}</main>
      </div>
    </>
  );
}
