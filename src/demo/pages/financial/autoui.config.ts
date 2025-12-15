import type { AutoUIConfig } from '@lib/types';
import {
  addTransaction,
  getSpendingByCategory,
  getUpcomingBills,
  markBillAsPaidByName,
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
    appName: 'Financial Demo',
    appVersion: '0.1.0',
    description:
      'A personal finance management app with transactions, bills, spending tracking, and category analysis.',
    tags: ['demo', 'finance', 'react', 'autoui'],
  },

  /* =========================
   *   LLM (PROXY ONLY)
   * ========================= */
  llm: {
    proxyUrl,
    sharedSecret,

    appDescriptionPrompt:
      'A personal finance management application where users can track transactions, manage bills, view spending by category, and analyze financial data.',

    temperature: 0.2,
    maxTokens: 2048,
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
        'Add a new transaction to the user’s financial records. Extract amount, description, optional date, category, account, and status.',
      params: {
        description: 'string — transaction description',
        amount: 'number | string — transaction amount',
        date: 'string (optional) — YYYY-MM-DD',
        category: 'string (optional) — transaction category',
        account: 'string (optional) — account name',
        status: 'string (optional) — paid | pending',
      },
      callFunc: addTransaction,
      returns: '{ success: boolean, transaction: Transaction }',
    },

    getSpendingByCategory: {
      prompt: 'Get spending breakdown by category for a given period.',
      params: {
        period: 'number (optional) — 7, 30, or 90 days',
      },
      callFunc: getSpendingByCategory,
      returns: '{ period: number, total: number, categories: Array<{ category: string, total: number }> }',
    },

    getUpcomingBills: {
      prompt: 'Get all upcoming unpaid bills sorted by due date.',
      params: {},
      callFunc: getUpcomingBills,
      returns: '{ bills: Bill[], totalPending: number, count: number }',
    },

    markBillAsPaid: {
      prompt: 'Mark a bill as paid by name or ID.',
      params: {
        billName: 'string (optional)',
        billId: 'number (optional)',
      },
      callFunc: markBillAsPaidByName,
      returns: '{ success: boolean, bill?: Bill, error?: string }',
    },
  },

  /* =========================
   *   COMPONENTS
   * ========================= */
  components: {
    CategorySpending: {
      prompt: 'Widget showing spending breakdown by category for a selected time period.',
      props: {
        period: 'number (optional) — 7, 30, or 90 days',
      },
      callComponent: CategorySpendingWrapper,
      category: 'analytics',
    },

    UpcomingBills: {
      prompt: 'Widget showing upcoming bills and allowing marking them as paid.',
      props: {},
      callComponent: UpcomingBillsWrapper,
      category: 'bills',
    },
  },
};

export default financialAutouiConfig;
