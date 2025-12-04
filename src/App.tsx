import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import PlayGround from './playground/PlayGround';
import DemoPage from './demo/DemoPage';
import { ModalChat } from '@lib';
import { autouiConfig } from '../autoui.config.example.ts';
import { InteractiveDemo } from './demo/DemoInteractive.tsx';
import { CartProvider } from './demo/context/CartContext.tsx';
import { useDarkMode } from './demo/hooks/useDarkMode.ts';
import { Moon, Sun } from 'lucide-react';

function App() {
  const { isDark, toggle } = useDarkMode();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'text-gray-700 dark:text-gray-200'
    }`;

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50">
          <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Auto UI Demo</span>
                <nav className="flex items-center gap-1">
                  <NavLink to="/interactive" className={navLinkClass}>
                    Interactive Demo
                  </NavLink>
                  <NavLink to="/components" className={navLinkClass}>
                    Component Gallery
                  </NavLink>
                </nav>
              </div>
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/interactive" replace />} />
              <Route path="/interactive" element={<InteractiveDemo />} />
              <Route path="/components" element={<DemoPage />} />
              <Route path="/playground" element={<PlayGround />} />
            </Routes>
          </main>

          <ModalChat config={autouiConfig} />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
