import { useFinanceStore } from '../store/useFinanceStore';

export function markBillAsPaid(id: number) {
  const { bills, setBills } = useFinanceStore.getState();
  const updated = bills.map((b) => (b.id === id ? { ...b, status: 'paid' as const } : b));
  setBills(updated);
}
