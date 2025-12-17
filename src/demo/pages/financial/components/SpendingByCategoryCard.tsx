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
    <Card className="@container/card h-full bg-[#1A1D23] border-[#2A2F37] shadow-lg">
      <CardHeader className="relative border-b border-[#2A2F37]">
        <CardDescription className="text-[#A9B2C1] text-xs uppercase tracking-wider">
          Monitoring Sources by Category
        </CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-[#00E5FF] mt-2">
          {formatCount(totalSources)} sources
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Select value={period.toString()} onValueChange={(value) => setPeriod(Number(value) as 7 | 30 | 90)}>
            <SelectTrigger
              className="h-8 w-32 text-xs bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:border-[#00E5FF]/50"
              aria-label="Select period"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
              <SelectItem value="7" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                Last 7 days
              </SelectItem>
              <SelectItem value="30" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                Last 30 days
              </SelectItem>
              <SelectItem value="90" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-6 pt-4">
        {summaries.length === 0 ? (
          <div className="py-4 text-sm text-[#A9B2C1]">No data available</div>
        ) : (
          <div className="space-y-3">
            {summaries.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-[#2A2F37]/50 transition-colors"
              >
                <span className="text-[#A9B2C1] font-medium">{item.category}</span>
                <span className="font-semibold tabular-nums text-[#00E5FF]">{formatCount(item.total)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-sm border-t border-[#2A2F37] pt-4">
        <div className="line-clamp-1 flex gap-2 font-medium text-[#F5F7FA]">
          Top {summaries.length} categories <TrendingUpIcon className="size-4 text-[#2AD39B]" />
        </div>
        <div className="text-[#A9B2C1] text-xs">Monitoring sources for the last {period} days</div>
      </CardFooter>
    </Card>
  );
}
