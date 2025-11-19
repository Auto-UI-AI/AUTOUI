import { Routes, Route, useLocation } from 'react-router-dom';
import { ModalChat } from '@lib';
import { EcommerceDemoPage, FinancialDemoPage, HomePage } from '@/demo/pages';
import { autouiConfig } from '../autoui.config.example.ts';
import { financialAutouiConfig } from '@/demo/pages/financial';
import PlayGround from './playground/PlayGround';

export function App() {
  const { pathname } = useLocation();
  const config = pathname.startsWith('/demo/financial') ? financialAutouiConfig : autouiConfig;

  return (
    <>
      <DemoPage />
      <PlayGround />
      <ModalChat config={autouiConfig} />
    </>
  );
}

export default App;
