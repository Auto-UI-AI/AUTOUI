import { useState, useEffect } from 'react';
import {
  fetchProducts,
  fetchCategories,
  addToCart,
  getRecommendations,
  removeFromCart,
  applyCoupon,
  getWishlist,
  submitOrder,
  summarizeCart,
  toggleWishlistItem,
  type Product,
  type CartItem,
} from './functions';
import { SearchBar, CategoryFilter, ProductGallery, CartSummary, ProductCard, CheckoutForm, WishlistPanel } from './components';
import { ModalChat, autouiRegisterComponentPropsSchema, autouiRegisterFunctionParamsSchema } from '@lib';
import type { AutoUIConfig } from '@lib/types';

autouiRegisterComponentPropsSchema(ProductGallery);
autouiRegisterComponentPropsSchema(CartSummary);
autouiRegisterComponentPropsSchema(ProductCard);
autouiRegisterComponentPropsSchema(SearchBar);
autouiRegisterComponentPropsSchema(CategoryFilter);
autouiRegisterComponentPropsSchema(CheckoutForm);
autouiRegisterComponentPropsSchema(WishlistPanel);

autouiRegisterFunctionParamsSchema(fetchProducts);
autouiRegisterFunctionParamsSchema(addToCart);
autouiRegisterFunctionParamsSchema(removeFromCart);
autouiRegisterFunctionParamsSchema(fetchCategories);
autouiRegisterFunctionParamsSchema(getRecommendations);
autouiRegisterFunctionParamsSchema(applyCoupon);
autouiRegisterFunctionParamsSchema(getWishlist);
autouiRegisterFunctionParamsSchema(submitOrder);
autouiRegisterFunctionParamsSchema(summarizeCart);
autouiRegisterFunctionParamsSchema(toggleWishlistItem);

export function EcommerceDemoPage() {
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

  const proxyUrl = import.meta.env.VITE_BASE_URL;
  const sharedSecret = import.meta.env.VITE_AUTOUI_SHARED_SECRET_ECOMMERCE || import.meta.env.VITE_AUTOUI_SHARED_SECRET;

  const EcommerceAppConfig: AutoUIConfig = {
    /* =========================
     *   APP ID (IMPORTANT)
     * ========================= */
    appId: 'app_1768313360453_dbptv83',

    /* =========================
     *   METADATA
     * ========================= */
    metadata: {
      appName: 'AutoUI E-commerce Demo',
      appVersion: '0.1.0',
      author: 'AutoUI Dev Team',
      createdAt: new Date().toISOString(),
      description:
        'E-commerce demo app with product browsing, cart management, wishlist, and checkout. Users can search products, filter by category, add items to cart, and complete purchases.',
      tags: ['demo', 'ecommerce', 'shopping', 'react', 'autoui'],
    },

    /* =========================
     *   LLM (PROXY-FIRST)
     * ========================= */
    llm: {
      proxyUrl,
      sharedSecret,
      /**
       * High-level context for the assistant
       */
      appDescriptionPrompt:
        'An e-commerce application where users can browse products, search by name or category, add items to cart, manage wishlist, apply coupons, and complete checkout. Always respond politely and helpfully.',

      /**
       * Soft hints (proxy may override)
       */
      temperature: 0.2,
      maxTokens: 2048,
    },

    /* =========================
     *   RUNTIME
     * ========================= */
    runtime: {
      validateLLMOutput: true,
      storeChatToLocalStorage: true,
      localStorageKey: 'autoui_ecommerce_demo_chat',
      enableDebugLogs: true,
      maxSteps: 20,
      errorHandling: {
        showToUser: true,
        retryOnFail: false,
      },
    },

    /* =========================
     *   FUNCTIONS
     * ========================= */
    functions: {
      fetchProducts: {
        prompt: 'Fetch a list of products filtered optionally by category or search query.',
        callFunc: fetchProducts,
        returns: 'Product[] — array of products with id, name, description, price, image, category',
        canShareDataWithLLM: true,
      },

      addToCart: {
        prompt: 'Add a product to the shopping cart by product ID.',
        callFunc: addToCart,
        returns: '{ ok: boolean, message?: string }',
      },

      removeFromCart: {
        prompt: 'Remove a product from the shopping cart by product ID.',
        callFunc: removeFromCart,
        returns: '{ ok: boolean, message?: string }',
      },

      fetchCategories: {
        prompt: 'Get a list of all available product categories.',
        callFunc: fetchCategories,
        returns: 'string[] — array of category names',
      },

      getRecommendations: {
        prompt: 'Get product recommendations based on items currently in the cart.',
        callFunc: getRecommendations,
        returns: 'Product[] — array of recommended products',
      },

      applyCoupon: {
        prompt: 'Apply a discount coupon code to the cart.',
        callFunc: applyCoupon,
        returns: '{ ok: boolean, discount?: number, message?: string }',
      },

      getWishlist: {
        prompt: 'Get the current user\'s wishlist of saved products.',
        callFunc: getWishlist,
        returns: 'Product[] — array of wishlisted products',
      },

      submitOrder: {
        prompt: 'Submit the current cart as an order and proceed to checkout.',
        callFunc: submitOrder,
        returns: '{ ok: boolean, orderId?: string, message?: string }',
      },

      summarizeCart: {
        prompt: 'Get a summary of the current cart including total items and price.',
        callFunc: summarizeCart,
        returns: '{ itemCount: number, total: number, items: CartItem[] }',
      },

      toggleWishlistItem: {
        prompt: 'Add or remove a product from the wishlist.',
        callFunc: toggleWishlistItem,
        returns: '{ ok: boolean, inWishlist: boolean, message?: string }',
      },
    },

    /* =========================
     *   COMPONENTS
     * ========================= */
    components: {
      ProductGallery: {
        prompt: 'Display a grid of product cards in a gallery layout.',
        defaults: {
          products,
        },
        callbacks: {
          onAddToCart: {
            description: 'Adds a product to the shopping cart when user clicks add to cart button',
            callFunc: handleAddToCart,
          },
        },
        callComponent: ProductGallery,
        category: 'display',
        exampleUsage: '<ProductGallery products={products} onAddToCart={handleAddToCart} />',
      },

      CartSummary: {
        prompt: 'Display a summary of cart items with quantities, prices, and checkout button.',
        defaults: {
          items: cart,
        },
        callbacks: {
          onCheckout: {
            description: 'Proceeds to checkout when user clicks checkout button',
            callFunc: handleCheckout,
          },
        },
        callComponent: CartSummary,
        category: 'cart',
        exampleUsage: '<CartSummary items={cart} onCheckout={handleCheckout} />',
      },

      ProductCard: {
        prompt: 'Display a single product card with image, name, description, price, and action button. The action can be dynamically set via onAction prop or callbacks field.',
        callbacks: {
          addToCart: {
            description: 'Adds the product to the shopping cart',
            whenToUse: 'When user wants to purchase or add item to cart',
            example: 'Use callbacks: { "onAction": "addToCart" } or props: { "onAddToCart": "addToCart" }',
            callFunc: handleAddToCart,
          },
          onAddToCart: {
            description: 'Direct callback for adding product to cart (alternative to addToCart)',
            callFunc: handleAddToCart,
          },
        },
        callComponent: ProductCard,
        category: 'product',
        exampleUsage: '<ProductCard product={product} onAddToCart={handleAddToCart} /> or <ProductCard product={product} onAction="addToCart" />',
      },

      SearchBar: {
        prompt: 'A search input field for filtering products by name or description.',
        callbacks: {
          onSearch: {
            description: 'Updates the search query when user types in the search bar',
            callFunc: setSearchQuery,
          },
        },
        callComponent: SearchBar,
        category: 'input',
        exampleUsage: '<SearchBar onSearch={setSearchQuery} placeholder="Search products..." />',
      },

      CategoryFilter: {
        prompt: 'Display category filter buttons to filter products by category.',
        defaults: {
          categories,
        },
        callbacks: {
          onSelect: {
            description: 'Updates the selected category filter when user clicks a category button',
            callFunc: setSelectedCategory,
          },
        },
        callComponent: CategoryFilter,
        category: 'filter',
        exampleUsage: '<CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />',
      },

      CheckoutForm: {
        prompt: 'Display a checkout form for entering shipping and payment information.',
        callbacks: {
          onSubmit: {
            description: 'Submits the checkout form with user information',
            callFunc: handleCheckout,
          },
        },
        callComponent: CheckoutForm,
        category: 'form',
        exampleUsage: '<CheckoutForm onSubmit={handleCheckout} />',
      },

      WishlistPanel: {
        prompt: 'Display a panel showing the user\'s wishlisted products.',
        callComponent: WishlistPanel,
        category: 'display',
        exampleUsage: '<WishlistPanel items={wishlistItems} />',
      },
    },
  };

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <SearchBar onSearch={setSearchQuery} placeholder="Search products..." />
          <CategoryFilter categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : (
              <ProductGallery products={products}/>
            )}
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <CartSummary items={cart} onCheckout={handleCheckout} />
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended for You</h3>
            <ProductGallery products={recommendations} />
          </div>
        )}
      </div>
      <ModalChat config={EcommerceAppConfig} />
    </>
  );
}
