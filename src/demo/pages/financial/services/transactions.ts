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
