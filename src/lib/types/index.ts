import type { ComponentType } from 'react';

export interface AutoUIConfig {
  llm: LLMConfig;
  runtime: RuntimeConfig;
  functions: Record<string, AutoUIFunction>;
  components: Record<string, AutoUIComponent>;
  metadata?: AutoUIMetadata;
}
export interface LLMConfig {
  /** Provider name (e.g., openai, openrouter, anthropic, azure) */
  provider: string;

  /** Direct API key (client-side) */
  apiKey?: string;
  baseUrl?: string;
  /** Backend proxy endpoint (safer for production) */
  apiProxyUrl?: string;

  /** Model identifier (e.g., openai/gpt-5-chat) */
  model: string;

  /** Sampling temperature */
  temperature?: number;

  /** Max tokens per request */
  maxTokens?: number;

  /** App description for context (“this app is about…”) */
  appDescriptionPrompt?: string;

  /** Optional request headers (forwarded to provider) */
  requestHeaders?: Record<string, string>;
}

export interface RuntimeConfig {
  /** Whether to validate LLM JSON output */
  validateLLMOutput?: boolean;

  /** Whether to store chat history to localStorage */
  storeChatToLocalStorage?: boolean;

  /** Key used for saving chat history */
  localStorageKey?: string;

  /** Enable internal debug logging */
  enableDebugLogs?: boolean;

  /** Maximum instruction steps allowed */
  maxSteps?: number;

  /** Error-handling policy */
  errorHandling?: {
    showToUser?: boolean;
    retryOnFail?: boolean;
  };
}

export interface AutoUIFunction {
  /** Prompt used by the LLM to decide when/how to call this function */
  prompt: string;

  /** Descriptive list of parameters (for documentation & LLM guidance) */
  params?: Record<string, string>;

  /** Description of the expected return type */
  returns?: string;

  /** The actual callable implementation (may be mocked) */
  callFunc: Function

  /** Optional example usage or notes for LLM context */
  exampleUsage?: string;

  /** Optional tags for organization */
  tags?: string[];

  /* This field defines whether the function can share the data with the LLM, so that this data could be analyzed by LLM*/
  canShareDataWithLLM?: boolean;
  /** Then remember that we have to make sure that this is not a void function, and it actually returns something */
}

// ===============================================
// COMPONENT DESCRIPTORS
// ===============================================

export interface AutoUIComponent {
  /** Prompt describing what the component does (for LLM) */
  prompt: string;

  /** Human-readable parameter descriptions */
  props?: Record<string, string>;

  /** Actual React component reference */
  callComponent: ComponentType<any>;
  
  /** Default prop values for runtime or mock previews */
  defaults?: Record<string, any>;

  /** Example JSX usage (string literal for docs) */
  exampleUsage?: string;

  /** Optional category (product-display, checkout, etc.) */
  category?: string;

  /** Optional tags for search or grouping */
  tags?: string[];
}

// ===============================================
// METADATA (optional informational block)
// ===============================================

export interface AutoUIMetadata {
  appName: string;
  appVersion?: string;
  author?: string;
  createdAt?: string;
  description?: string;
  tags?: string[];
}
