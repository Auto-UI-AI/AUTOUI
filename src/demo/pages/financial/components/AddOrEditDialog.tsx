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
  'Infrastructure',
  'Service / API',
  'Logs',
  'Traces',
  'Database',
  'Cloud Resource',
  'Synthetic',
  'Custom Metric Source',
] as const;

const ACCOUNTS = ['Production', 'Staging', 'Dev', 'EU-Cluster', 'US-West-Cluster'] as const;

const STATUSES = ['Active', 'Pending Setup', 'Disabled', 'Maintenance Mode'] as const;

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
      toast.error('Monitoring Target Name is required');
      return;
    }
    if (!formData.amount.trim()) {
      toast.error('Endpoint / Port is required');
      return;
    }
    if (!formData.date) {
      toast.error('Connection Start Date is required');
      return;
    }
    if (!formData.category) {
      toast.error('Monitoring Category is required');
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
          tooltip="Connect Monitoring"
          className="min-w-8 bg-[#00E5FF] text-[#0E0F13] duration-200 ease-linear hover:bg-[#00B8D4] hover:text-[#0E0F13] active:bg-[#00B8D4] active:text-[#0E0F13] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
        >
          <PlusCircleIcon />
          <span>Connect Monitoring</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1A1D23] border-[#2A2F37] text-[#F5F7FA]">
        <DialogHeader>
          <DialogTitle className="text-[#F5F7FA]">Connect Monitoring Source</DialogTitle>
          <DialogDescription className="text-[#A9B2C1]">
            Configure a new monitoring connection to collect metrics, logs, and traces. All fields marked * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="description" className="text-[#F5F7FA]">
                Monitoring Target Name <span className="text-[#FF5C81]">*</span>
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g., api-service-prod"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] placeholder:text-[#A9B2C1] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="amount" className="text-[#F5F7FA]">
                  Endpoint / Port <span className="text-[#FF5C81]">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="text"
                  placeholder="8080"
                  value={formData.amount}
                  onChange={(e) => {
                    // Allow only numbers and decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData({ ...formData, amount: value });
                  }}
                  className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] placeholder:text-[#A9B2C1] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="date" className="text-[#F5F7FA]">
                  Connection Start Date <span className="text-[#FF5C81]">*</span>
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="category" className="text-[#F5F7FA]">
                  Monitoring Category <span className="text-[#FF5C81]">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger
                    id="category"
                    className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                    {CATEGORIES.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status" className="text-[#F5F7FA]">
                  Connection Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger
                    id="status"
                    className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                    {STATUSES.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="account" className="text-[#F5F7FA]">
                Environment / Cluster
              </Label>
              <Select
                value={formData.account || '__none__'}
                onValueChange={(value) => setFormData({ ...formData, account: value })}
              >
                <SelectTrigger
                  id="account"
                  className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                >
                  <SelectValue placeholder="Select account (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                  <SelectItem value="__none__" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    None
                  </SelectItem>
                  {ACCOUNTS.map((account) => (
                    <SelectItem key={account} value={account} className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#2A2F37] hover:text-[#F5F7FA]"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[#00E5FF] text-[#0E0F13] hover:bg-[#00B8D4] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            >
              Start Monitoring
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
