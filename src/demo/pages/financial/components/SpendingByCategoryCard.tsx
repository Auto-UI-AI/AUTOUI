import * as React from 'react';
import { TrendingUpIcon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/demo/base/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/demo/base/select';

import { useFinanceStore } from '@/demo/pages/financial/store/useFinanceStore';
import { mockSummaries } from '@/demo/pages/financial/services/summaries';

export function SpendingByCategoryCard({ period: initialPeriod }: { period?: 7 | 30 | 90 }) {
  const [period, setPeriod] = React.useState<7 | 30 | 90>(initialPeriod || 30);
  const transactions = useFinanceStore((state) => state.transactions);

  const summaries = React.useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }
    return mockSummaries({ transactions, period });
  }, [transactions, period]);

  const totalSources = React.useMemo(() => {
    return summaries.reduce((sum, item) => sum + item.total, 0);
  }, [summaries]);

  const formatCount = (value: number) => {
    return Math.round(value).toLocaleString('en-US');
  };

  return (
    <Card className="@container/card @xl/main:col-span-2 @5xl/main:col-span-2">
      <CardHeader className="relative">
        <CardDescription>Monitoring Sources by Category</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {formatCount(totalSources)} sources
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Select value={period.toString()} onValueChange={(value) => setPeriod(Number(value) as 7 | 30 | 90)}>
            <SelectTrigger className="h-8 w-32 text-xs" aria-label="Select period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        {summaries.length === 0 ? (
          <div className="py-4 text-sm text-muted-foreground">No data available</div>
        ) : (
          <div className="space-y-3">
            {summaries.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.category}</span>
                <span className="font-medium tabular-nums">{formatCount(item.total)} sources</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Top {summaries.length} categories <TrendingUpIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">Monitoring sources for the last {period} days</div>
      </CardFooter>
    </Card>
  );
}
