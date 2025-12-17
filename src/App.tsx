import { Routes, Route } from 'react-router-dom';
import { EcommerceDemoPage, FinancialDemoPage, HomePage } from '@/demo/pages';
import PlayGround from './playground/PlayGround';
import Demo3 from './demo/pages/task-manager/Demo3.tsx';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/ecommerce" element={<EcommerceDemoPage />} />
        <Route path="/demo/observability" element={<FinancialDemoPage />} />
        <Route path="/demo/task-manager" element={<Demo3 />} />
      </Routes>
      <PlayGround />
    </>
  );
}

export default App;
