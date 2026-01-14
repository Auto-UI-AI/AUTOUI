import { Route, Routes } from 'react-router-dom';

import EcommerceLayout from './layout/EcommerceLayout';
import EcommerceDemoPage from './EcommerceDemoPage';
import { AboutPage, ContactPage, ShippingReturnsPage } from './pages';

export default function EcommerceApp() {
  return (
    <Routes>
      <Route element={<EcommerceLayout />}>
        <Route index element={<EcommerceDemoPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="shipping" element={<ShippingReturnsPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
