import * as React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Button } from '@/demo/base/button';
import { useFinanceStore } from '../store/useFinanceStore';
import { markBillAsPaid } from '../services/bills';
import type { Bill } from '../types/finance';

export function UpcomingBillsCard() {
  const navigate = useNavigate();
  const bills = useFinanceStore((state) => state.bills);

  // Filter and sort upcoming bills
  const upcomingBills = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bills
      .filter((bill) => bill.status === 'pending' && new Date(bill.due) >= today)
      .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
      .slice(0, 3);
  }, [bills]);

  const totalPending = React.useMemo(() => {
    return upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
  }, [upcomingBills]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMarkAsPaid = React.useCallback((id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    markBillAsPaid(id);
  }, []);

  const handleViewAll = () => {
    navigate('/demo/financial?tab=bills');
  };

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Upcoming Bills</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {upcomingBills.length > 0 ? formatCurrency(totalPending) : '0'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        {upcomingBills.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground">✅ All caught up — no upcoming bills.</div>
        ) : (
          <>
            {totalPending > 0 && (
              <div className="mb-3 text-xs font-medium text-muted-foreground">
                Total due: {formatCurrency(totalPending)}
              </div>
            )}
            <div className="space-y-2">
              {upcomingBills.map((bill) => (
                <BillRow
                  key={bill.id}
                  bill={bill}
                  onMarkAsPaid={handleMarkAsPaid}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={handleViewAll}>
          View all bills
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function BillRow({
  bill,
  onMarkAsPaid,
  formatCurrency,
  formatDate,
}: {
  bill: Bill;
  onMarkAsPaid: (id: number, event: React.MouseEvent) => void;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
}) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setIsRemoving(true);
    // Wait for animation, then mark as paid
    setTimeout(() => {
      onMarkAsPaid(bill.id, e);
      setIsRemoving(false);
    }, 300);
  };

  return (
    <div
      className={`flex items-center justify-between rounded-md border p-2 text-sm transition-all ${
        isRemoving ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="flex-1">
        <div className="font-medium">{bill.name}</div>
        <div className="text-xs text-muted-foreground">
          due {formatDate(bill.due)} — {formatCurrency(bill.amount)}
        </div>
      </div>
      <button
        onClick={handleClick}
        className="ml-2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary hover:bg-accent"
        aria-label={`Mark ${bill.name} as paid`}
      >
        <CheckCircle2 className="size-5" />
      </button>
    </div>
  );
}
