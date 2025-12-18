import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { initDarkMode } from './demo/hooks';
import './index.css';
import './demo/tailwind.css';

initDarkMode();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

