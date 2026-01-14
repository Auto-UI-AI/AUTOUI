import type { ComponentType } from 'react';

export interface AutoUIConfig {
  appId: string;

  llm: LLMConfig;
  runtime: RuntimeConfig;
  functions: Record<string, AutoUIFunction>;
  components: Record<string, AutoUIComponent>;
  metadata?: AutoUIMetadata;
}
export interface LLMConfig {
  /** 🔐 Backend proxy URL */
  proxyUrl: string;

  /** Shared secret for proxy auth */
  sharedSecret?: string;

  /** Sampling temperature (hint only) */
  temperature?: number;

  /** Max tokens (hint only) */
  maxTokens?: number;

  /** App description context */
  appDescriptionPrompt?: string;

  /** Optional headers forwarded to proxy */
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

  /** Path to runtime schema file (relative to project root or absolute URL) */
  /** Default: '.autoui-runtime-schema.json' */
  runtimeSchemaPath?: string;
}

export interface AutoUIFunction {
  /** Prompt used by the LLM to decide when/how to call this function */
  prompt: string;

  /** Descriptive list of parameters (for documentation & LLM guidance) */
  params?: Record<string, string>;

  /** Description of the expected return type */
  returns?: string;

  /** The actual callable implementation (may be mocked) */
  callFunc: Function;

  /** Optional example usage or notes for LLM context */
  exampleUsage?: string;

  /** Optional tags for organization */
  tags?: string[];

  /* This field defines whether the function can share the data with the LLM, so that this data could be analyzed by LLM*/
  canShareDataWithLLM?: boolean;
  /** Then remember that we have to make sure that this is not a void function, and it actually returns something */
}

export interface AutoUICallback {
  /** Description of what this callback does */
  description: string;
  /** When to use this callback */
  whenToUse?: string;
  /** Example usage */
  example?: string;
  /** The actual callback function implementation */
  callFunc: Function;
}

export interface AutoUIComponent {
  /** Prompt describing what the component does (for LLM) */
  prompt: string;

  /** Human-readable parameter descriptions */
  props?: Record<string, string>;

  /** Actual React component reference */
  callComponent: ComponentType<any>;

  /** Default prop values for runtime or mock previews */
  defaults?: Record<string, any>;

  /** Callback definitions with handlers - combines metadata and implementation
   */
  callbacks?: Record<string, AutoUICallback | Function>;

  /** Example JSX usage (string literal for docs) */
  exampleUsage?: string;

  /** Optional category (product-display, checkout, etc.) */
  category?: string;

  /** Optional tags for search or grouping */
  tags?: string[];
}

export interface AutoUIMetadata {
  appName: string;
  appVersion?: string;
  author?: string;
  createdAt?: string;
  description?: string;
  tags?: string[];
}

export type {
  StepExecutionError,
  ErrorHandlingRequest,
  ErrorHandlingResponse,
} from './errorHandlingTypes';