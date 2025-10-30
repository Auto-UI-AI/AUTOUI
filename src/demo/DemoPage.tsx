'use client';
import React, { useState } from 'react';
import { Button } from './base/button';
import { ScrollArea } from './base/scroll-area';
import { Separator } from './base/separator';
import { Card, CardHeader, CardTitle, CardContent } from './base/card';

// Demo Components
import ProductDetailsModal from './components/ProductDetailsModal';
import SizeFilter from './components/SizeFilter';
import CheckoutForm from './components/CheckoutForm';
import OrderConfirmation from './components/OrderConfirmation';
import WishlistPanel from './components/WishlistPanel';

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
    name: 'components',
    components: [
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

export default function DemoStorybook() {
  const [selectedComponent, setSelectedComponent] = useState<{
    category: string;
    name: string;
  } | null>(null);

  const renderPreview = () => {
    if (!selectedComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Select a component from the sidebar to preview.</p>
        </div>
      );
    }

    const category = COMPONENT_CATEGORIES.find((cat) => cat.name === selectedComponent.category);
    const component = category?.components.find((comp) => comp.name === selectedComponent.name);

    if (!component) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">Component not found.</p>
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4">
        <h2 className="text-lg font-semibold mb-4">Smart Fashion UI</h2>
        <ScrollArea className="h-[calc(100vh-5rem)] pr-2">
          {COMPONENT_CATEGORIES.map((category) => (
            <div key={category.name} className="mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{category.name}</h3>
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
