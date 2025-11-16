import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, Rule, Bill } from "../types/finance";

type FinanceStore = {
  transactions: Transaction[];
  budgets: Record<string, number>;
  rules: Rule[];
  bills: Bill[];

  setTransactions: (tx: Transaction[]) => void;
  setBudgets: (b: Record<string, number>) => void;
  setRules: (r: Rule[]) => void;
  setBills: (b: Bill[]) => void;

  addTransaction: (tx: Transaction) => void;
};

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      transactions: [],
      budgets: {},
      rules: [],
      bills: [],

      setTransactions: (transactions) => set({ transactions }),
      setBudgets: (budgets) => set({ budgets }),
      setRules: (rules) => set({ rules }),
      setBills: (bills) => set({ bills }),

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [...state.transactions, tx],
        })),
    }),
    { name: "autoui:demo-financial" }
  )
);
