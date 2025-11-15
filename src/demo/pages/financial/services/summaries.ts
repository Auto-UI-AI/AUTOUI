import type { Transaction } from '../types/finance';

export type CategorySummary = {
  category: string;
  total: number;
};

export function mockSummaries({
  transactions,
  period,
}: {
  transactions: Transaction[];
  period: 7 | 30 | 90;
}): CategorySummary[] {
  // Get the most recent date from transactions
  if (transactions.length === 0) {
    return [];
  }

  const referenceDate = new Date(Math.max(...transactions.map((t) => new Date(t.date).getTime())));
  const startDate = new Date(referenceDate);
  startDate.setDate(startDate.getDate() - period);
  startDate.setHours(0, 0, 0, 0);

  // Filter transactions by date and exclude income
  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    date.setHours(0, 0, 0, 0);
    return date >= startDate && transaction.category !== 'Income';
  });

  // Group by category and sum amounts
  const categoryTotals = new Map<string, number>();

  filteredTransactions.forEach((transaction) => {
    const amountStr = transaction.amount.replace(/[$,\s]/g, '');
    const amount = parseFloat(amountStr) || 0;
    const category = transaction.category;

    categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
  });

  // Convert to array, sort by total (descending), and return top 3
  return Array.from(categoryTotals.entries())
    .map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
}

