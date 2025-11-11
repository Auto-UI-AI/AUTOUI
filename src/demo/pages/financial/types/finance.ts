export type Transaction = {
  id: number;
  amount: string;
  currency: string;
  category: string;
  note?: string;
  date: string;
};

export type Rule = {
  match: string;
  category: string;
};
