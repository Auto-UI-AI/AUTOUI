import type { AutoUIConfig } from '@lib/types';

import EcommerceForChat from './componentsForChat/EcommerceForChat';
import {
  addToCart,
  checkout,
  clearCart,
  getCartSummary,
  getWishlist,
  listCategories,
  removeFromCart,
  searchProducts,
  setCartItemQuantity,
  toggleWishlistItem,
} from './services/autouiFunctions';

const proxyUrl = import.meta.env.VITE_BASE_URL;
const sharedSecret = import.meta.env.VITE_AUTOUI_SHARED_SECRET;

export const ecommerceAutouiConfig: AutoUIConfig = {
  appId: 'app_1768424109198_mrvnzkn',

  metadata: {
    appName: 'Ecommerce Store Demo',
    appVersion: '0.1.0',
    description: 'A minimal storefront demo with products, cart, wishlist, and checkout.',
    tags: ['demo', 'ecommerce', 'storefront', 'react', 'autoui'],
  },

  llm: {
    proxyUrl,
    sharedSecret,
    maxTokens: 2048,
    appDescriptionPrompt:
      'You are an assistant for an ecommerce storefront. IMPORTANT: the chat UI can only reliably render ONE component per assistant message. Always render a single <Ecommerce /> component (never multiple). Use <Ecommerce view="products" /> for browsing, <Ecommerce view="cart" /> for cart, <Ecommerce view="wishlist" /> for wishlist, <Ecommerce view="checkout" /> to collect name/email/address via the form (do NOT fabricate user details), and <Ecommerce view="lastOrder" /> to show the last receipt. You can still call functions to modify state; after state changes, render exactly one <Ecommerce ... />.',
    requestHeaders: {
      'HTTP-Referer': 'https://autoui.dev',
      'X-Title': 'AutoUI Ecommerce Demo',
    },
  },

  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: 'autoui_ecommerce_chat',
    enableDebugLogs: true,
    maxSteps: 15,
    errorHandling: {
      showToUser: true,
      retryOnFail: false,
    },
  },

  functions: {
    listCategories: {
      prompt: 'List product categories for filtering. Also updates the in-memory demo store categories.',
      params: {},
      callFunc: listCategories,
      returns: '{ categories: string[] }',
    },

    searchProducts: {
      prompt:
        'Search products in the storefront by optional category and/or search query. Also updates the in-memory demo store products list.',
      params: {
        category: 'string (optional) — category name, e.g. "Tops", "Shoes"',
        q: 'string (optional) — search query',
      },
      callFunc: searchProducts,
      returns: '{ products: Product[], count: number, category: string, q: string }',
      exampleUsage: 'searchProducts({ category: "Shoes", q: "boot" })',
    },

    addToCart: {
      prompt:
        'Add a product to the cart by productId. Product must exist in current catalog (run searchProducts first).',
      params: {
        productId: 'string — product id',
      },
      callFunc: addToCart,
      returns: '{ ok: boolean, error?: string }',
      exampleUsage: 'addToCart({ productId: "1" })',
    },

    removeFromCart: {
      prompt: 'Remove a product from cart by productId.',
      params: {
        productId: 'string — product id',
      },
      callFunc: removeFromCart,
      returns: '{ ok: boolean }',
    },

    setCartItemQuantity: {
      prompt: 'Set quantity for a cart item (min 1).',
      params: {
        productId: 'string — product id',
        quantity: 'number — quantity (min 1)',
      },
      callFunc: setCartItemQuantity,
      returns: '{ ok: boolean }',
    },

    toggleWishlistItem: {
      prompt:
        'Toggle product in wishlist by productId. Product must exist in current catalog (run searchProducts first).',
      params: {
        productId: 'string — product id',
      },
      callFunc: toggleWishlistItem,
      returns: '{ ok: boolean, error?: string }',
    },

    getWishlist: {
      prompt: 'Get current wishlist items.',
      params: {},
      callFunc: getWishlist,
      returns: '{ wishlist: Array<{id:string,name:string,price:number}>, count: number }',
    },

    getCartSummary: {
      prompt: 'Summarize the cart items and total.',
      params: {},
      callFunc: getCartSummary,
      returns: '{ summary: string, total: number, itemCount: number, distinctItems: number }',
    },

    clearCart: {
      prompt: 'Clear the cart.',
      params: {},
      callFunc: clearCart,
      returns: '{ ok: boolean }',
    },

    checkout: {
      prompt:
        'Checkout the current cart using explicitly provided user info. Do NOT fabricate name/email/address; if missing, ask the user or render <Checkout />. Creates an order receipt, saves it as lastOrder, and clears the cart.',
      params: {
        name: 'string — customer name',
        email: 'string — customer email',
        address: 'string — shipping address',
      },
      callFunc: checkout,
      returns:
        '{ ok: boolean, order?: { orderId: string, eta: string, totalCost: number, createdAtIso: string }, error?: string }',
      exampleUsage: 'checkout({ name: "Jane Doe", email: "jane@example.com", address: "NYC" })',
    },
  },

  components: {
    Ecommerce: {
      prompt:
        'Render the ecommerce UI. IMPORTANT: the host chat renderer supports only one component per assistant message, so use only this component. Use view to switch between products/cart/wishlist/checkout/lastOrder. For products view, render products as a vertical list (cart-like rows) because it displays more reliably than a grid in the chat container. You may pass initial category/q/size.',
      props: {
        view: '"products" | "cart" | "wishlist" | "checkout" | "lastOrder" (optional) — default "products"',
        category: 'string (optional) — initial category (products view)',
        q: 'string (optional) — initial search query (products view)',
        size: 'string (optional) — initial size filter (products view)',
      },
      callComponent: EcommerceForChat,
      category: 'store',
      exampleUsage: '<Ecommerce view="checkout" />',
    },
  },
};

export default ecommerceAutouiConfig;
