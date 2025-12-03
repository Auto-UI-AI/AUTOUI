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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/ecommerce" element={<EcommerceDemoPage />} />
        <Route path="/demo/financial" element={<FinancialDemoPage />} />
      </Routes>
      <PlayGround />
      <ModalChat config={config} />
    </>
  );
}

export default App;
