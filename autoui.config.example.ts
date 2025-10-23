import type { AutoUIConfig } from "./src/lib/types";
import ExampleComp from "./src/demo/ExampleComp";
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
// 👇 prototype config for “SmartSport” — e-commerce fashion demo
export const autouiConfig: AutoUIConfig = {
    /**
   * 🧩 METADATA
   * Optional metadata used for analytics, debugging, or LLM context.
   */
    metadata: {
    appName: "SmartSport",
    appVersion: "0.1.0",
    author: "AutoUI Dev Team",
    createdAt: new Date().toISOString(),
    description:
      "Example AutoUI config for e-commerce store with React components and mock functions.",
    tags: ["ecommerce", "react", "autoui", "demo"],
  },
  /**
   * 🧠 LLM SECTION
   * Describes how AutoUI talks to the LLM provider.
   */
  llm: {
    provider: "openrouter", // "openai" | "anthropic" | "openrouter" | etc.
    apiKey: apiKey, // or use apiProxyUrl
    apiProxyUrl: undefined, // optional proxy endpoint for server-side key safety
    model: "openai/gpt-5-chat", // any valid model supported by provider
    temperature: 0.2, // creativity vs. determinism
    appDescriptionPrompt:
      "This app is an e-commerce store selling sport clothes worldwide with delivery and user accounts.",
    maxTokens: 2048, // optional upper bound for LLM calls
    requestHeaders: {
      // optional — forwarded headers like OpenRouter ranking, etc.
      "HTTP-Referer": "https://autoui.dev",
      "X-Title": "AutoUI Example App",
    },
  },

  /**
   * ⚙️ RUNTIME SECTION
   * Controls internal AutoUI runtime behavior.
   */
  runtime: {
    validateLLMOutput: true, // validate JSON via zod before executing
    storeChatToLocalStorage: true, // persist chat between reloads
    localStorageKey: "autoui_chat_history", // optional key override
    enableDebugLogs: true, // optional — log runtime steps
    maxSteps: 20, // limit number of steps executed in one plan
    errorHandling: {
      showToUser: true,
      retryOnFail: false,
    },
  },

  /**
   * 🧰 FUNCTIONS SECTION
   * These are backend or client functions AutoUI can call.
   * Each has a human-readable prompt for the LLM.
   */
  functions: {
    fetchProducts: {
      prompt:
        "Fetch list of products filtered optionally by color, category, or query text.",
      params: {
        color: "string (optional) — color filter",
        category: "string (optional) — product category",
        q: "string (optional) — search term",
      },
      callFunc: async ({
        color,
        category,
        q,
      }: {
        color?: string;
        category?: string;
        q?: string;
      }) => {
        const all = [
          { id: "1", name: "Red Tee", price: 19, color: "red", category: "tops" },
          { id: "2", name: "Blue Shorts", price: 25, color: "blue", category: "bottoms" },
          { id: "3", name: "Green Hoodie", price: 39, color: "green", category: "tops" },
        ];
        return all.filter(
          (p) =>
            (!color || p.color === color) &&
            (!category || p.category === category) &&
            (!q || p.name.toLowerCase().includes(q.toLowerCase()))
        );
      },
      returns: `Product[ { id: "3", name: "Green Hoodie", price: 39, color: "green", category: "tops" }, ...] — list of filtered product objects`,
    },

    addToCart: {
      prompt: "Add a product to cart with quantity.",
      params: {
        productId: "string — product unique id",
        quantity: "number — how many items to add",
      },
      callFunc: async ({
        productId,
        quantity,
      }: {
        productId: string;
        quantity: number;
      }) => {
        console.log(`Added product ${productId} ×${quantity} to cart`);
        return { ok: true, productId, quantity };
      },
      returns: "{ ok: boolean, productId: string, quantity: number }",
    },

    fetchRecommendations: {
      prompt: "Return recommended products based on cart or browsing history.",
      params: {
        userId: "string (optional) — user ID to personalize results",
      },
      callFunc: async ({ userId }: { userId?: string }) => {
        console.log("Fetching recommendations for user:", userId);
        return [
          { id: "4", name: "Black Sneakers", price: 59 },
          { id: "5", name: "Gray Sweatpants", price: 45 },
        ];
      },
      returns: "Product[] — recommended products",
    },
  },

  /**
   * 🧱 COMPONENTS SECTION
   * UI building blocks the LLM can use when constructing instruction plans.
   */
  components: {
    ProductList: {
      prompt: "A grid of products with optional onAddToCart button handler.",
      params: {
        products: "Product[] — array of product data",
        onAddToCart: "function(productId: string) — handler for add to cart",
      },
      callComponent: ExampleComp,
      defaults: {
        products: [],
      },
      category: "product-display", // optional grouping
      exampleUsage:
        "<ProductList products={mockProducts} onAddToCart={(id)=>{}} />",
    },

    ProductCard: {
      prompt: "Card showing product image, name, price, and add button.",
      params: {
        product: "Product — object containing id, name, price, image",
        onAddToCart: "function(productId: string)",
      },
      callComponent: ExampleComp,
      category: "product-display"
    },

    CartSummary: {
      prompt: "Displays list of items currently in the shopping cart.",
      params: {
        items: "CartItem[] — list of items with name, price, qty",
        onCheckout: "function() — proceed to checkout",
      },
      callComponent: ExampleComp,
      category: "checkout"
    },
  },

  
};
