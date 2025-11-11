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
} from './components';
import { fetchProducts, addToCart } from './functions';
import { InteractiveDemo } from './DemoInteractive';
import { PLACEHOLDER_IMAGE } from './constants';
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
            items={[
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
        component: <OrderConfirmation orderId="1234567890" eta="2 days" totalCost={100} />,
      },
      {
        name: 'ProductDetailsModal',
        component: (
          <ProductDetailsModal
            product={{
              id: '1',
              name: 'Product 1',
              description: 'Product 1 description',
              price: 100,
              image: PLACEHOLDER_IMAGE,
            }}
            onClose={() => {}}
          />
        ),
      },
    ],
  },
];

export default function DemoStorybook() {
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
  );
}
