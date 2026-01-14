import type { AutoUIConfig } from '@lib/types';

import CartForChat from './componentsForChat/CartForChat';
import LastOrderForChat from './componentsForChat/LastOrderForChat';
import ProductsForChat from './componentsForChat/ProductsForChat';
import WishlistForChat from './componentsForChat/WishlistForChat';
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
  appId: 'ecommerce-demo',

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
      'You are an assistant for an ecommerce storefront. Users can browse products, filter by category, search, add/remove items from cart, adjust quantities, manage wishlist, and checkout. When useful, render UI components such as Products, Cart, Wishlist, and LastOrder.',
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
        'Checkout the current cart using provided user info. Creates an order receipt, saves it as lastOrder, and clears the cart.',
      params: {
        name: 'string — customer name',
        email: 'string — customer email',
        address: 'string — shipping address',
      },
      callFunc: checkout,
      returns: '{ ok: boolean, order: { orderId: string, eta: string, totalCost: number, createdAtIso: string } }',
      exampleUsage: 'checkout({ name: "Jane Doe", email: "jane@example.com", address: "NYC" })',
    },
  },

  components: {
    Products: {
      prompt:
        'Render a storefront product grid with search, category filter, and size filter. Users can open details, add to cart, and toggle wishlist.',
      props: {
        category: 'string (optional) — initial category',
        q: 'string (optional) — initial search query',
        size: 'string (optional) — initial size filter (XS, S, M, L, XL)',
      },
      callComponent: ProductsForChat,
      category: 'store',
      exampleUsage: '<Products category="Shoes" q="boot" />',
    },

    Cart: {
      prompt: 'Render the current cart with items, quantities, subtotal, and remove controls.',
      props: {},
      callComponent: CartForChat,
      category: 'checkout',
      exampleUsage: '<Cart />',
    },

    Wishlist: {
      prompt: 'Render the current wishlist with actions to remove items or add them to cart.',
      props: {},
      callComponent: WishlistForChat,
      category: 'store',
      exampleUsage: '<Wishlist />',
    },

    LastOrder: {
      prompt: 'Render the most recent order receipt if it exists.',
      props: {},
      callComponent: LastOrderForChat,
      category: 'checkout',
      exampleUsage: '<LastOrder />',
    },
  },
};

export default ecommerceAutouiConfig;
