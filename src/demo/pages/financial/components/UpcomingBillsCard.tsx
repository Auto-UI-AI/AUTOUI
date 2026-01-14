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

  // Calculate total pending count
  const totalPending = React.useMemo(() => {
    return transactions.filter((transaction) => transaction.status === 'pending').length;
  }, [transactions]);

  // Filter and sort pending monitoring sources (limit display to 3)
  const pendingSources = React.useMemo(() => {
    return transactions
      .filter((transaction) => transaction.status === 'pending')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [transactions]);

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
    navigate('/demo/observability');
  };

  return (
    <Card className="@container/card h-full bg-[#1A1D23] border-[#2A2F37] shadow-lg">
      <CardHeader className="relative border-b border-[#2A2F37]">
        <CardDescription className="text-[#A9B2C1] text-xs uppercase tracking-wider">
          Pending Monitoring Sources
        </CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-[#FFC043] mt-2">
          {totalPending} {totalPending === 1 ? 'source' : 'sources'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-4">
        {pendingSources.length === 0 ? (
          <div className="py-4 text-sm text-[#2AD39B]">✓ All monitoring sources are active.</div>
        ) : (
          <>
            {totalPending > 0 && (
              <div className="mb-3 text-xs font-medium text-[#A9B2C1]">
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
      <CardFooter className="flex-col items-start gap-1 text-sm border-t border-[#2A2F37] pt-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium text-[#00E5FF] hover:text-[#00B8D4] hover:bg-transparent"
          onClick={handleViewAll}
        >
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
      className={`flex items-center justify-between rounded-lg border border-[#2A2F37] bg-[#0E0F13] p-3 text-sm transition-all ${
        isRemoving ? 'opacity-0 -translate-x-4' : 'opacity-100 translate-x-0'
      } hover:border-[#00E5FF]/30 hover:bg-[#1A1D23]`}
    >
      <div className="flex-1">
        <div className="font-medium text-[#F5F7FA]">{transaction.description}</div>
        <div className="text-xs text-[#A9B2C1] mt-0.5">
          connected {formatDate(transaction.date)} — {transaction.amount}
        </div>
      </div>
      <button
        onClick={handleClick}
        className="ml-2 rounded-full p-1.5 text-[#A9B2C1] transition-all hover:text-[#2AD39B] hover:bg-[#2AD39B]/10 hover:shadow-[0_0_8px_rgba(42,211,155,0.3)]"
        aria-label={`Mark ${transaction.description} as active`}
      >
        <CheckCircle2 className="size-5" />
      </button>
    </div>
  );
}
