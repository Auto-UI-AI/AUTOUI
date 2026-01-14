import React, { useEffect, useMemo } from 'react';
import { AppSidebar, SidebarInset, SidebarProvider, SiteHeader } from '@/demo/base';
import transactionsData from './mockData/transactions.json';
import billsData from './mockData/bills.json';
import { DataTable, SpendingBreakdownChart } from './components';
import { useFinanceStore } from './store/useFinanceStore';
import { InsightCards } from './components/InsightCards';
import type { Bill } from './types/finance';
import { ModalChat, autouiRegisterComponentPropsSchema, autouiRegisterFunctionParamsSchema } from '@autoai-ui/autoui';
import {
  addTransaction,
  getSpendingByCategory,
  getUpcomingBills,
  getSourcesByEnvironment,
  markBillAsPaidByName,
  markSourceAsActive,
} from './services/autouiFunctions';
import { CategorySpendingWrapper } from './components/CategorySpendingWrapper';
import { UpcomingBillsWrapper } from './components/UpcomingBillsWrapper';
import financialAutouiConfig from './autoui.config';

// Register component props schemas
autouiRegisterComponentPropsSchema(CategorySpendingWrapper);
autouiRegisterComponentPropsSchema(UpcomingBillsWrapper);

// Register function params schemas
autouiRegisterFunctionParamsSchema(addTransaction);
autouiRegisterFunctionParamsSchema(getSpendingByCategory);
autouiRegisterFunctionParamsSchema(getUpcomingBills);
autouiRegisterFunctionParamsSchema(getSourcesByEnvironment);
autouiRegisterFunctionParamsSchema(markBillAsPaidByName);
autouiRegisterFunctionParamsSchema(markSourceAsActive);

export function FinancialDemoPage() {
  const transactions = useFinanceStore((state) => state.transactions);
  const setTransactions = useFinanceStore((state) => state.setTransactions);
  const bills = useFinanceStore((state) => state.bills);
  const setBills = useFinanceStore((state) => state.setBills);

  // Ensure config always has appId
  const config = useMemo(() => {
    const baseConfig = financialAutouiConfig;
    if (!baseConfig.appId) {
      console.warn('[FinancialDemoPage] appId missing from config, using default');
      return { ...baseConfig, appId: 'app_1768157856796_sppwztm' };
    }
    return baseConfig;
  }, []);

  // Debug: Log config in dev mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[FinancialDemoPage] Config check:', {
        appId: config.appId,
        hasProxyUrl: !!config.llm?.proxyUrl,
        hasSharedSecret: !!config.llm?.sharedSecret,
        proxyUrl: config.llm?.proxyUrl,
      });
    }
  }, [config]);

  // Initialize store with mock data if empty
  useEffect(() => {
    if (transactions.length === 0) {
      setTransactions(transactionsData);
    }
    if (bills.length === 0) {
      // Type assertion for bills data to ensure status is 'pending' | 'paid'
      setBills(billsData as Bill[]);
    }
  }, [transactions.length, setTransactions, bills.length, setBills]);

  // Add class to body for financial app-specific styling
  useEffect(() => {
    document.body.classList.add('financial-app');
    return () => {
      document.body.classList.remove('financial-app');
    };
  }, []);

  // Use store transactions if available, otherwise fall back to mock data
  const rawData = transactions.length > 0 ? transactions : transactionsData;

  // Sort transactions by date (most recent first)
  const displayData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [rawData]);

  return (
    <div className="dark min-h-screen bg-[#0E0F13]">
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
          <div className="flex flex-1 flex-col bg-[#0E0F13]">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <InsightCards />
                <div className="px-4 lg:px-6">
                  <SpendingBreakdownChart />
                </div>
                <DataTable data={displayData} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <ModalChat config={config} />
    </div>
  );
}
