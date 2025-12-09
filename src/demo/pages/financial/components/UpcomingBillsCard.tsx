import * as React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Button } from '@/demo/base/button';
import { useFinanceStore } from '../store/useFinanceStore';
import { markTransactionAsActive } from '../services/transactions';
import type { Transaction } from '../types/finance';

export function UpcomingBillsCard() {
  const navigate = useNavigate();
  const transactions = useFinanceStore((state) => state.transactions);

  // Filter and sort pending monitoring sources
  const pendingSources = React.useMemo(() => {
    return transactions
      .filter((transaction) => transaction.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [transactions]);

  const totalPending = React.useMemo(() => {
    return pendingSources.length;
  }, [pendingSources]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMarkAsActive = React.useCallback((id: number | string, event: React.MouseEvent) => {
    event.stopPropagation();
    markTransactionAsActive(id);
  }, []);

  const handleViewAll = () => {
    navigate('/demo/financial');
  };

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Pending Monitoring Sources</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {totalPending} {totalPending === 1 ? 'source' : 'sources'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        {pendingSources.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground">✅ All monitoring sources are active.</div>
        ) : (
          <>
            {totalPending > 0 && (
              <div className="mb-3 text-xs font-medium text-muted-foreground">
                {totalPending} {totalPending === 1 ? 'source' : 'sources'} pending setup
              </div>
            )}
            <div className="space-y-2">
              {pendingSources.map((transaction) => (
                <SourceRow
                  key={transaction.id}
                  transaction={transaction}
                  onMarkAsActive={handleMarkAsActive}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <Button variant="ghost" size="sm" className="h-auto p-0 font-medium" onClick={handleViewAll}>
          View all sources
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function SourceRow({
  transaction,
  onMarkAsActive,
  formatDate,
}: {
  transaction: Transaction;
  onMarkAsActive: (id: number | string, event: React.MouseEvent) => void;
  formatDate: (dateString: string) => string;
}) {
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    setIsRemoving(true);
    // Wait for animation, then mark as active
    setTimeout(() => {
      onMarkAsActive(transaction.id, e);
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
        <div className="font-medium">{transaction.description}</div>
        <div className="text-xs text-muted-foreground">
          connected {formatDate(transaction.date)} — {transaction.amount}
        </div>
      </div>
      <button
        onClick={handleClick}
        className="ml-2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary hover:bg-accent"
        aria-label={`Mark ${transaction.description} as active`}
      >
        <CheckCircle2 className="size-5" />
      </button>
    </div>
  );
}
