export type Transaction = {
  id: any;
  description: string;
  amount: string;
  date: string;
  category: string;
  account: string;
  status: string;
};

export type Rule = {
  match: string;
  category: string;
};

export type Bill = {
  id: number;
  name: string;
  amount: number;
  due: string;
  status: 'pending' | 'paid';
};
