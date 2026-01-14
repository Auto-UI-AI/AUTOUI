import { Routes, Route } from 'react-router-dom';
import { FinancialDemoPage, HomePage } from '@/demo/pages';
import EcommerceApp from '@/demo/pages/ecommerce/EcommerceApp';
import PlayGround from './playground/PlayGround';
import Demo3 from './demo/pages/task-manager/Demo3.tsx';

export function App() {
  return (
    <>
      <Routes>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/demo/ecommerce/*" element={<EcommerceApp />} />
        <Route path="/demo/observability" element={<FinancialDemoPage />} />
        <Route path="/demo/task-manager" element={<Demo3 />} />
      </Routes>
      <PlayGround />
    </>
  );
}

export default App;
