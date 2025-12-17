import { useFinanceStore } from '../store/useFinanceStore';
import { mockSummaries } from './summaries';
import { markBillAsPaid } from './bills';
import { markTransactionAsActive } from './transactions';
import type { Transaction } from '../types/finance';

/**
 * Add a new transaction to the finance store
 */
export async function addTransaction(params: {
  description: string;
  amount: number | string;
  date?: string;
  category?: string;
  account?: string;
  status?: string;
}) {
  const { addTransaction: addTx } = useFinanceStore.getState();

  // Format amount to string with $ if needed
  let amountStr = params.amount.toString();
  if (!amountStr.startsWith('$')) {
    amountStr = `$${amountStr}`;
  }

  // Get max ID from existing transactions
  const transactions = useFinanceStore.getState().transactions;
  const maxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) : 0;

  const newTransaction: Transaction = {
    id: maxId + 1,
    description: params.description,
    amount: amountStr,
    date: params.date || new Date().toISOString().split('T')[0],
    category: params.category || 'Other',
    account: params.account || '',
    status: params.status || 'pending',
  };

  addTx(newTransaction);
  return { success: true, transaction: newTransaction };
}

/**
 * Get monitoring sources breakdown by category for a specific period
 */
export async function getSpendingByCategory(params: { period?: 7 | 30 | 90 }) {
  const transactions = useFinanceStore.getState().transactions;
  const period = params.period || 30;

  const summaries = mockSummaries({ transactions, period });
  const total = summaries.reduce((sum, item) => sum + item.total, 0);

  return {
    period,
    total,
    categories: summaries,
  };
}

/**
 * Get all pending monitoring sources (transactions with status 'pending')
 */
export async function getUpcomingBills() {
  const transactions = useFinanceStore.getState().transactions;

  const pending = transactions
    .filter((transaction) => transaction.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    sources: pending,
    count: pending.length,
  };
}

/**
 * Get monitoring sources by environment/cluster
 */
export async function getSourcesByEnvironment(params: { environment?: string }) {
  const transactions = useFinanceStore.getState().transactions;
  const environment = params.environment || '';

  if (!environment) {
    return {
      sources: transactions,
      count: transactions.length,
      environment: 'all',
    };
  }

  // Case-insensitive partial match for environment
  const filtered = transactions.filter((transaction) =>
    transaction.account.toLowerCase().includes(environment.toLowerCase()),
  );

  return {
    sources: filtered,
    count: filtered.length,
    environment: environment,
  };
}

/**
 * Mark a bill as paid by name or ID
 */
export async function markBillAsPaidByName(params: { billName?: string; billId?: number }) {
  const bills = useFinanceStore.getState().bills;

  let billToMark;
  if (params.billId) {
    billToMark = bills.find((b) => b.id === params.billId);
  } else if (params.billName) {
    billToMark = bills.find((b) => b.name.toLowerCase().includes(params.billName!.toLowerCase()));
  }

  if (!billToMark) {
    return { success: false, error: 'Bill not found' };
  }

  markBillAsPaid(billToMark.id);
  return { success: true, bill: { ...billToMark, status: 'paid' as const } };
}

/**
 * Mark a monitoring source as active by description or ID
 */
export async function markSourceAsActive(params: { description?: string; sourceId?: number | string }) {
  const transactions = useFinanceStore.getState().transactions;

  let sourceToMark;
  if (params.sourceId) {
    sourceToMark = transactions.find((t) => t.id === params.sourceId);
  } else if (params.description) {
    sourceToMark = transactions.find((t) => t.description.toLowerCase().includes(params.description!.toLowerCase()));
  }

  if (!sourceToMark) {
    return { success: false, error: 'Monitoring source not found' };
  }

  markTransactionAsActive(sourceToMark.id);
  return { success: true, source: { ...sourceToMark, status: 'active' } };
}
