import type { AutoUIConfig } from '@lib/types';
import {
  addTransaction,
  getSpendingByCategory,
  getUpcomingBills,
  getSourcesByEnvironment,
  markBillAsPaidByName,
  markSourceAsActive,
} from './services/autouiFunctions';
import { CategorySpendingWrapper } from './components/CategorySpendingWrapper';
import { UpcomingBillsWrapper } from './components/UpcomingBillsWrapper';

const proxyUrl = import.meta.env.VITE_BASE_URL;
const sharedSecret = import.meta.env.VITE_AUTOUI_SHARED_SECRET;

export const financialAutouiConfig: AutoUIConfig = {
  /* =========================
   *   APP ID
   * ========================= */
  appId: 'financial-demo',

  /* =========================
   *   METADATA
   * ========================= */
  metadata: {
    appName: 'Monitoring Sources Demo',
    appVersion: '0.1.0',
    description:
      'A monitoring sources management app for tracking infrastructure monitoring endpoints, services, and clusters across different environments.',
    tags: ['demo', 'monitoring', 'infrastructure', 'react', 'autoui'],
  },

  /* =========================
   *   LLM (PROXY ONLY)
   * ========================= */
  llm: {
    proxyUrl,
    sharedSecret,

    appDescriptionPrompt:
      'A monitoring sources management application where users can track monitoring endpoints, services, and infrastructure components across different environments (Production, Staging, Dev, etc.). Users can add monitoring sources with endpoints/ports, view sources by category (Infrastructure, Services, Logs, Traces, etc.), manage pending sources that need setup, and analyze monitoring coverage over time.',
    maxTokens: 2048,
    requestHeaders: {
      'HTTP-Referer': 'https://autoui.dev',
      'X-Title': 'AutoUI Monitoring Sources Demo',
    },
  },

  /* =========================
   *   RUNTIME
   * ========================= */
  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: 'autoui_financial_chat',
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
    addTransaction: {
      prompt:
        'Add a new monitoring source to the system. Extract endpoint/port (as amount), description (source name), optional date (defaults to today), category, environment/cluster (account), and status.',
      params: {
        description:
          'string — monitoring source name/description (e.g., "Kubernetes Cluster - Prod", "API Gateway Metrics")',
        amount: 'number | string — endpoint/port number (e.g., 10255, "9090", "8080")',
        date: 'string (optional) — connection date in YYYY-MM-DD format, defaults to today',
        category:
          'string (optional) — one of: Infrastructure, Services, Logs, Traces, Database, Network, Cloud. Defaults to "Infrastructure"',
        account:
          'string (optional) — environment/cluster name (e.g., "Production", "Staging", "Dev", "EU-Cluster", "US-West-Cluster")',
        status: 'string (optional) — "active" or "pending", defaults to "pending"',
      },
      callFunc: addTransaction,
      returns: '{ success: boolean, transaction: Transaction }',
      exampleUsage:
        'addTransaction({ description: "Kubernetes Cluster - Prod", amount: 10255, category: "Infrastructure", account: "Production" })',
    },

    getSpendingByCategory: {
      prompt:
        'Get monitoring sources breakdown by category for a specific time period. Returns total monitoring sources count and category summaries.',
      params: {
        period: 'number (optional) — 7, 30, or 90 days',
      },
      callFunc: getSpendingByCategory,
      returns: '{ period: number, total: number, categories: Array<{ category: string, total: number }> }',
    },

    getUpcomingBills: {
      prompt:
        'Get all pending monitoring sources (transactions with status "pending"). Returns sources sorted by connection date.',
      params: {},
      callFunc: getUpcomingBills,
      returns:
        '{ sources: Transaction[], count: number } — sources array with id, description, amount, date, category, account, status',
      exampleUsage: 'getUpcomingBills()',
    },

    getSourcesByEnvironment: {
      prompt:
        'Get all monitoring sources filtered by environment/cluster (e.g., "Production", "Staging", "Dev", "EU-Cluster", "US-West-Cluster"). Returns sources in the specified environment. If no environment is provided, returns all sources.',
      params: {
        environment:
          'string (optional) — environment/cluster name to filter by (case-insensitive partial match). Examples: "Production", "Staging", "Dev", "EU-Cluster"',
      },
      callFunc: getSourcesByEnvironment,
      returns:
        '{ sources: Transaction[], count: number, environment: string } — sources array with id, description, amount, date, category, account, status',
      exampleUsage: 'getSourcesByEnvironment({ environment: "Production" })',
    },

    markBillAsPaid: {
      prompt: 'Mark a bill as paid by name or ID.',
      params: {
        billName: 'string (optional)',
        billId: 'number (optional)',
      },
      callFunc: markBillAsPaidByName,
      returns: '{ success: boolean, bill?: Bill, error?: string }',
      exampleUsage: 'markBillAsPaid({ billName: "Spotify" })',
    },

    markSourceAsActive: {
      prompt:
        'Mark a monitoring source as active by searching for it by description (e.g., "Kubernetes Cluster") or by ID. The source status will be updated to "active".',
      params: {
        description:
          'string (optional) — description of the monitoring source to mark as active (case-insensitive partial match)',
        sourceId: 'number | string (optional) — ID of the monitoring source to mark as active',
      },
      callFunc: markSourceAsActive,
      returns: '{ success: boolean, source?: Transaction, error?: string }',
      exampleUsage: 'markSourceAsActive({ description: "Kubernetes Cluster" })',
    },
  },

  /* =========================
   *   COMPONENTS
   * ========================= */
  components: {
    CategorySpending: {
      prompt:
        'Display monitoring sources breakdown by category widget showing total monitoring sources and top categories for a selected time period (7, 30, or 90 days).',
      props: {
        period: 'number (optional) — 7, 30, or 90 days',
      },
      callComponent: CategorySpendingWrapper,
      category: 'analytics',
    },

    UpcomingBills: {
      prompt:
        'Display pending monitoring sources widget showing monitoring sources with status "pending", sorted by connection date. Shows total count and allows marking sources as active.',
      props: {},
      callComponent: UpcomingBillsWrapper,
      category: 'monitoring',
      exampleUsage: '<UpcomingBills />',
    },
  },
};

export default financialAutouiConfig;
