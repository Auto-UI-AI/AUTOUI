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

  // Filter transactions by date
  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    date.setHours(0, 0, 0, 0);
    return date >= startDate;
  });

  // Group by category and count monitoring sources
  const categoryCounts = new Map<string, number>();

  filteredTransactions.forEach((transaction) => {
    const category = transaction.category;
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  });

  // Convert to array, sort by count (descending), and return top 5
  return Array.from(categoryCounts.entries())
    .map(([category, total]) => ({
      category,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}
