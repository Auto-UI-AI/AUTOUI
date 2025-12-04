import React, { useState } from 'react';
import { Button } from '@/demo/base/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/demo/base/dialog';
import { Input } from '@/demo/base/input';
import { Label } from '@/demo/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/demo/base/select';
import { useFinanceStore } from '../store/useFinanceStore';
import { toast } from 'sonner';
import { SidebarMenuButton } from '@/demo/base/sidebar';
import { PlusCircleIcon } from 'lucide-react';

const CATEGORIES = [
  'Groceries',
  'Food & Drink',
  'Transport',
  'Bills',
  'Subscriptions',
  'Income',
  'Health',
  'Shopping',
  'Entertainment',
  'Personal Care',
] as const;

const ACCOUNTS = ['Personal', 'Business', 'Cash', 'Bank'] as const;

const STATUSES = ['paid', 'pending'] as const;

type TransactionFormData = {
  description: string;
  amount: string;
  date: string;
  category: string;
  account: string;
  status: string;
};

const initialFormData: TransactionFormData = {
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  category: '',
  account: '',
  status: 'pending',
};

export function AddOrEditDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const transactions = useFinanceStore((state) => state.transactions);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.amount.trim()) {
      toast.error('Amount is required');
      return;
    }
    if (!formData.date) {
      toast.error('Date is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }

    // Format amount with $ if not already present
    const formattedAmount = formData.amount.startsWith('$') ? formData.amount : `$${formData.amount}`;

    // Generate new ID (max existing ID + 1)
    const maxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id || 0)) : 0;
    const newId = maxId + 1;

    // Create transaction object matching the schema
    // Convert "__none__" special value to empty string for account
    const accountValue = formData.account === '__none__' ? '' : formData.account;

    const newTransaction = {
      id: newId,
      description: formData.description.trim(),
      amount: formattedAmount,
      date: formData.date,
      category: formData.category,
      account: accountValue,
      status: formData.status,
    };

    addTransaction(newTransaction);
    toast.success('Transaction added successfully');

    // Reset form and close dialog
    setFormData(initialFormData);
    setOpen(false);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset form when dialog closes
      setFormData({
        ...initialFormData,
        date: new Date().toISOString().split('T')[0], // Reset to today's date
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <SidebarMenuButton
          tooltip="Add Transaction"
          className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
        >
          <PlusCircleIcon />
          <span>Add Transaction</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details for your new transaction. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g., Groceries at Lidl"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  placeholder="23.40"
                  value={formData.amount}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, amount: value });
                  }}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="account">Account</Label>
              <Select
                value={formData.account || '__none__'}
                onValueChange={(value) => setFormData({ ...formData, account: value })}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {ACCOUNTS.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
