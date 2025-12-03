import { useFinanceStore } from '../store/useFinanceStore';
import { mockSummaries } from './summaries';
import { markBillAsPaid } from './bills';
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
 * Get spending breakdown by category for a specific period
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
 * Get all upcoming bills (pending bills with due date >= today)
 */
export async function getUpcomingBills() {
  const bills = useFinanceStore.getState().bills;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bills
    .filter((bill) => bill.status === 'pending' && new Date(bill.due) >= today)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const totalPending = upcoming.reduce((sum, bill) => sum + bill.amount, 0);

  return {
    bills: upcoming,
    totalPending,
    count: upcoming.length,
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
