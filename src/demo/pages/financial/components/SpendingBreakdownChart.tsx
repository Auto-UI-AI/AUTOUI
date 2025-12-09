'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/demo/base/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/demo/base/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/demo/base/select';
import { ToggleGroup, ToggleGroupItem } from '@/demo/base/toggleGroup';

const chartConfig = {
  cumulative: {
    label: 'Cumulative Monitoring Sources',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function SpendingBreakdownChart() {
  const transactions = useFinanceStore((state) => state.transactions);
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  // Process transactions to calculate daily monitoring sources added
  const allChartData = React.useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    // Group transactions by date and count monitoring sources added per day
    const dailyCounts = new Map<string, number>();

    transactions.forEach((transaction) => {
      const date = transaction.date;
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    // Convert to array and sort by date
    return Array.from(dailyCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions]);

  // Filter data based on time range and fill missing dates with 0
  const filteredData = React.useMemo(() => {
    if (allChartData.length === 0) {
      return [];
    }

    // Get the most recent date as reference
    const referenceDate = new Date(Math.max(...allChartData.map((item) => new Date(item.date).getTime())));
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    // Create map of all dates in range with counts
    const dateMap = new Map<string, number>();
    const allDates: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= referenceDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      allDates.push(dateStr);
      dateMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in actual monitoring source counts
    allChartData.forEach((item) => {
      const date = new Date(item.date);
      date.setHours(0, 0, 0, 0);
      if (date >= startDate && date <= referenceDate) {
        dateMap.set(item.date, (dateMap.get(item.date) || 0) + item.count);
      }
    });

    // Calculate cumulative count
    let cumulative = 0;
    return allDates.map((dateStr) => {
      cumulative += dateMap.get(dateStr) || 0;
      return {
        date: dateStr,
        cumulative: cumulative,
      };
    });
  }, [allChartData, timeRange]);

  // Format count for display
  const formatCount = (value: number) => {
    return Math.round(value).toLocaleString('en-US');
  };

  if (allChartData.length === 0) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Monitoring Sources Added Over Time</CardTitle>
          <CardDescription>No monitoring sources added yet</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Add monitoring sources to see monitoring sources added over time
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Monitoring Sources Added Over Time</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Cumulative number of monitoring sources connected by date.</span>
          <span className="@[540px]/card:hidden">Cumulative number of monitoring sources connected by date.</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-cumulative)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-cumulative)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return formatCount(value);
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  formatter={(value, name, item) => (
                    <div className="flex w-full flex-wrap items-center gap-2">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-0.5 border bg-[var(--color-cumulative)]" />
                      <div className="flex flex-1 justify-between leading-none items-center">
                        <div className="grid gap-1.5">
                          <span className="text-muted-foreground">Cumulative</span>
                        </div>
                        <span className="text-foreground font-mono font-medium ml-1 tabular-nums">
                          {formatCount(Number(value))} sources
                        </span>
                      </div>
                    </div>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cumulative"
              type="natural"
              fill="url(#fillCumulative)"
              stroke="var(--color-cumulative)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
