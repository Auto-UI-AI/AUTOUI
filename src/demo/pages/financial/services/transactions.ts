import { useFinanceStore } from '../store/useFinanceStore';
import type { Transaction } from '../types/finance';

type AddTransactionInput = Omit<Transaction, 'id'>;

export function addTransaction(tx: AddTransactionInput) {
  const { addTransaction } = useFinanceStore.getState();

  addTransaction({
    ...tx,
    id: crypto.randomUUID(),
  });
}

export function markTransactionAsActive(id: number | string) {
  const { transactions, setTransactions } = useFinanceStore.getState();
  const updated = transactions.map((t) => (t.id === id ? { ...t, status: 'active' } : t));
  setTransactions(updated);
}
