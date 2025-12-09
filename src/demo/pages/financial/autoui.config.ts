import type { AutoUIConfig } from '@lib/types';
import {
  addTransaction,
  getSpendingByCategory,
  getUpcomingBills,
  markBillAsPaidByName,
} from './services/autouiFunctions';
import { CategorySpendingWrapper } from './components/CategorySpendingWrapper';
import { UpcomingBillsWrapper } from './components/UpcomingBillsWrapper';

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const aiModel = import.meta.env.VITE_AIMODEL_NAME;
const baseUrl = import.meta.env.VITE_BASE_URL;

export const financialAutouiConfig: AutoUIConfig = {
  metadata: {
    appName: 'Financial Demo',
    appVersion: '0.1.0',
    description:
      'A personal finance management app with transactions, bills, spending tracking, and category analysis.',
    tags: ['demo', 'finance', 'react', 'autoui'],
  },

  llm: {
    provider: 'openrouter',
    baseUrl: baseUrl,
    apiKey,
    model: aiModel,
    temperature: 0.2,
    appDescriptionPrompt:
      'A personal finance management application where users can track transactions, manage bills, view spending by category, and analyze their financial data. Users can add transactions, view spending breakdowns, manage upcoming bills, and set budgets.',
    maxTokens: 2048,
    requestHeaders: {
      'HTTP-Referer': 'https://autoui.dev',
      'X-Title': 'AutoUI Financial Demo',
    },
  },

  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: 'autoui_financial_chat',
    enableDebugLogs: true,
    maxSteps: 20,
    errorHandling: { showToUser: true, retryOnFail: false },
  },

  functions: {
    addTransaction: {
      prompt:
        "Add a new transaction to the user's financial records. Extract amount (with or without $), description, optional date (defaults to today), category, account, and status.",
      params: {
        description: 'string — transaction description (e.g., "Starbucks", "Grocery shopping")',
        amount: 'number | string — transaction amount (e.g., 15.50 or "$15.50")',
        date: 'string (optional) — date in YYYY-MM-DD format, defaults to today',
        category:
          'string (optional) — one of: Groceries, Food & Drink, Transport, Bills, Subscriptions, Income, Health, Shopping, Entertainment, Personal Care. Defaults to "Other"',
        account: 'string (optional) — account name (e.g., "Personal", "Business", "Cash", "Bank")',
        status: 'string (optional) — "paid" or "pending", defaults to "pending"',
      },
      callFunc: addTransaction,
      returns: '{ success: boolean, transaction: Transaction }',
      exampleUsage: 'addTransaction({ description: "Starbucks", amount: 15.50, category: "Food & Drink" })',
    },

    getSpendingByCategory: {
      prompt:
        'Get monitoring sources breakdown by category for a specific time period. Returns total monitoring sources count and category summaries.',
      params: {
        period: 'number (optional) — 7, 30, or 90 days. Defaults to 30',
      },
      callFunc: getSpendingByCategory,
      returns: '{ period: number, total: number, categories: Array<{ category: string, total: number }> }',
      exampleUsage: 'getSpendingByCategory({ period: 30 })',
    },

    getUpcomingBills: {
      prompt: 'Get all upcoming bills that are pending and due on or after today. Returns bills sorted by due date.',
      params: {},
      callFunc: getUpcomingBills,
      returns:
        '{ bills: Bill[], totalPending: number, count: number } — bills array with id, name, amount, due date, status',
      exampleUsage: 'getUpcomingBills()',
    },

    markBillAsPaid: {
      prompt:
        'Mark a bill as paid by searching for it by name (e.g., "Spotify") or by ID. The bill status will be updated to "paid".',
      params: {
        billName: 'string (optional) — name of the bill to mark as paid (case-insensitive partial match)',
        billId: 'number (optional) — ID of the bill to mark as paid',
      },
      callFunc: markBillAsPaidByName,
      returns: '{ success: boolean, bill?: Bill, error?: string }',
      exampleUsage: 'markBillAsPaid({ billName: "Spotify" })',
    },
  },

  components: {
    CategorySpending: {
      prompt:
        'Display monitoring sources breakdown by category widget showing total monitoring sources and top categories for a selected time period (7, 30, or 90 days).',
      props: {
        period: 'number (optional) — 7, 30, or 90 days. Defaults to 30',
      },
      callComponent: CategorySpendingWrapper,
      category: 'analytics',
      exampleUsage: '<CategorySpending period={30} />',
    },

    UpcomingBills: {
      prompt:
        'Display upcoming bills widget showing pending bills due on or after today, sorted by due date. Shows total pending amount and allows marking bills as paid.',
      props: {},
      callComponent: UpcomingBillsWrapper,
      category: 'bills',
      exampleUsage: '<UpcomingBills />',
    },
  },
};

export default financialAutouiConfig;
