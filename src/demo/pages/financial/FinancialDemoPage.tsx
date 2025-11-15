import React, { useEffect, useMemo } from 'react';
import { AppSidebar, SidebarInset, SidebarProvider, SiteHeader, SectionCards, ChartAreaInteractive } from '@/demo/base';
import data from './mockData/transactions.json';
import { DataTable } from './components';
import { useFinanceStore } from './store/useFinanceStore';

export function FinancialDemoPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const setTransactions = useFinanceStore((state) => state.setTransactions);

  // Initialize store with mock data if empty
  useEffect(() => {
    if (transactions.length === 0) {
      setTransactions(data);
    }
  }, [transactions.length, setTransactions]);

  // Use store transactions if available, otherwise fall back to mock data
  const rawData = transactions.length > 0 ? transactions : data;

  // Sort transactions by date (most recent first)
  const displayData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [rawData]);

  return (
    <>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={displayData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
