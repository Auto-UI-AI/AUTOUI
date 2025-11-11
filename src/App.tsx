import { Routes, Route } from 'react-router-dom';
import { ModalChat } from '@lib';
import { EcommerceDemoPage, FinancialDemoPage, HomePage } from '@/demo/pages';
import { autouiConfig } from '../autoui.config.example.ts';
import PlayGround from './playground/PlayGround';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/ecommerce" element={<EcommerceDemoPage />} />
        <Route path="/demo/financial" element={<FinancialDemoPage />} />
      </Routes>
      <PlayGround />
      <ModalChat config={autouiConfig} />
    </>
  );
}

export default App;
