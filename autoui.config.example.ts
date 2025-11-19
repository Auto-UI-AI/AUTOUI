// autoui.config.example.ts
import type { AutoUIConfig } from './src/lib/types';

// DEMO COMPONENTS (same barrel you used in HomePage)
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

// Optional interactive view shown in HomePage
import { EcommerceDemoPage } from '@/demo/pages';

// DEMO FUNCTIONS (same as HomePage)
import { fetchProducts, addToCart } from '@/demo/pages/ecommerce/functions';

// Optional assets/constants used by some components
import { PLACEHOLDER_IMAGE } from '@/demo/constants';

// Pull model key from Vite env like in your example
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const aiModel = import.meta.env.VITE_AIMODEL_NAME;
const baseUrl = import.meta.env.VITE_BASE_URL;
export const autouiConfig: AutoUIConfig = {
  /* =========================
   *   METADATA
   * ========================= */
  metadata: {
    appName: 'AutoUI Demo',
    appVersion: '0.1.0',
    author: 'AutoUI Dev Team',
    createdAt: new Date().toISOString(),
    description: 'Config derived from HomePage: registers demo e-commerce components and mock functions.',
    tags: ['demo', 'ecommerce', 'react', 'autoui'],
  },

  /* =========================
   *   LLM
   * ========================= */
  llm: {
    provider: 'openrouter',
    baseUrl: baseUrl,
    apiKey,
    model: aiModel,
    temperature: 0.2,
    appDescriptionPrompt: 'A demo e-commerce app with product listing, cart, checkout and wishlists.',
    maxTokens: 2048,
    requestHeaders: {
      'HTTP-Referer': 'https://autoui.dev',
      'X-Title': 'AutoUI Demo',
    },
  },

  /* =========================
   *   RUNTIME
   * ========================= */
  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: 'autoui_demo_chat',
    enableDebugLogs: true,
    maxSteps: 20,
    errorHandling: { showToUser: true, retryOnFail: false },
  },

  /* =========================
   *   FUNCTIONS
   * ========================= */
  functions: {
    fetchProducts: {
      prompt: 'Fetch a list of products filtered optionally by color, category, or query text.',
      params: {
        color: 'string (optional) — color filter',
        category: 'string (optional) — product category',
        q: 'string (optional) — search query',
      },
      callFunc: fetchProducts,
      returns: 'Product[] — array of products with id, name, description, price, image, color, category',
    },

    addToCart: {
      prompt: 'Add a product to the cart with a certain quantity.',
      params: {
        productId: 'string — product unique id',
        quantity: 'number — how many items to add (default 1)',
      },
      callFunc: addToCart,
      returns: '{ ok: boolean, productId: string, quantity: number }',
    },
  },

  /* =========================
   *   COMPONENTS
   * ========================= */
  components: {
    // ---- Interactive view bucket (from HomePage)
    InteractiveDemo: {
      prompt: 'An interactive end-to-end e-commerce showcase combining gallery, cart and checkout flow.',
      props: {},
      callComponent: EcommerceDemoPage,
      category: 'interactive',
    },

    // ---- Product display
    ProductCard: {
      prompt: 'A single product card with image, name, price and an Add to Cart button.',
      props: {
        product: 'Product — { id, name, description?, price, image } required for render',
        onAddToCart: 'function(productId: string) — called when user adds item to cart',
      },
      defaults: {
        product: {
          id: '1',
          name: 'Beige Coat',
          description: 'A stylish beige coat for modern fashion.',
          price: 89.99,
          image: PLACEHOLDER_IMAGE,
        },
      },
      callComponent: ProductCard,
      category: 'product-display',
      exampleUsage: '<ProductCard product={p} onAddToCart={(id)=>{}} />',
    },

    ProductGallery: {
      prompt: 'A responsive gallery of ProductCard items with optional onAddToCart handler.',
      props: {
        products: 'Product[] — list of products to render',
        onAddToCart: 'function(productId: string) — add a specific product to cart',
      },
      defaults: {
        products: [
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
        ],
      },
      callComponent: ProductGallery,
      category: 'product-display',
      exampleUsage: '<ProductGallery products={list} onAddToCart={(id)=>{}} />',
    },

    // ---- Cart / Checkout
    CartSummary: {
      prompt: 'Shows cart items with quantities and total; triggers checkout when requested.',
      props: {
        items: 'CartItem[] — { id, name, price, quantity } lines to display in cart',
        onCheckout: 'function() — proceed to checkout',
      },
      defaults: {
        items: [
          { id: '1', name: 'Beige Coat', price: 89.99, quantity: 2 },
          { id: '2', name: 'Denim Jacket', price: 69.99, quantity: 1 },
        ],
      },
      callComponent: CartSummary,
      category: 'checkout',
    },

    CheckoutForm: {
      prompt: 'Form that collects shipping/billing data and submits an order for checkout.',
      props: { onSubmit: 'function(formData) — submit checkout payload' },
      callComponent: CheckoutForm,
      category: 'checkout',
    },

    OrderConfirmation: {
      prompt: 'A simple confirmation screen showing order id, delivery ETA and total cost.',
      props: {
        orderId: 'string — order identifier',
        eta: 'string — estimated delivery time description',
        totalCost: 'number — final order total',
      },
      defaults: { orderId: '1234567890', eta: '2 days', totalCost: 100 },
      callComponent: OrderConfirmation,
      category: 'checkout',
    },

    // ---- Detail / Filters / Search / Wishlist
    ProductDetailsModal: {
      prompt: 'Modal showing detailed product info with a close action and optional add to cart.',
      props: {
        product: 'Product — { id, name, description, price, image? } to display',
        onClose: 'function() — close the modal',
      },
      defaults: {
        product: {
          id: '1',
          name: 'Product 1',
          description: 'Product 1 description',
          price: 100,
        },
      },
      callComponent: ProductDetailsModal,
      category: 'product-display',
    },

    SearchBar: {
      prompt: 'Input that triggers search via provided onSearch callback; useful to call fetchProducts.',
      props: {
        onSearch: 'function(query: string) — perform a search (typically calls fetchProducts)',
        placeholder: 'string (optional) — input placeholder',
      },
      defaults: { placeholder: 'Search products...' },
      callComponent: SearchBar,
      category: 'filters',
    },

    CategoryFilter: {
      prompt: 'Pills or list to toggle a current category; invokes onSelect with chosen category.',
      props: {
        categories: "string[] — available categories (e.g., ['All','Tops','Bottoms'])",
        selected: 'string — currently selected category',
        onSelect: 'function(category: string) — selection handler (can call fetchProducts)',
      },
      defaults: {
        categories: ['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'],
        selected: 'All',
      },
      callComponent: CategoryFilter,
      category: 'filters',
    },

    SizeFilter: {
      prompt: 'Simple size filter control that emits chosen size(s) through onFilter.',
      props: {
        sizes: "string[] — size options (e.g., ['S','M','L','XL'])",
        onFilter: 'function(selected: string | string[])',
      },
      defaults: { sizes: ['S', 'M', 'L', 'XL'] },
      callComponent: SizeFilter,
      category: 'filters',
    },

    WishlistPanel: {
      prompt: "Panel showing the user's wishlist items with basic metadata and actions.",
      props: {
        wishlist: 'Array<{ id: string; name: string; price: number }> — items saved by user',
      },
      defaults: {
        wishlist: [
          { id: '1', name: 'Product 1', price: 100 },
          { id: '2', name: 'Product 2', price: 200 },
        ],
      },
      callComponent: WishlistPanel,
      category: 'account',
    },
  },
};

export default autouiConfig;
