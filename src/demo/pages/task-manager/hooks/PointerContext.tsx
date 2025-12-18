import React, { createContext, useContext, useEffect, useRef } from 'react';

export interface PointerContextType {
  pointTo: (dataGuideAttr: string) => void;
}

export const PointerContext = createContext<PointerContextType | undefined>(undefined);

export const PointerContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const highlightedElRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearHighlight = () => {
    if (highlightedElRef.current) {
      highlightedElRef.current.classList.remove('autoui-highlight');
      highlightedElRef.current = null;
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pointTo = (dataGuideAttr: string) => {
    try {
      clearHighlight();

      const el = document.querySelector(`[data-guide-id="${dataGuideAttr}"]`) as HTMLElement | null;

      console.log('Received guide id:', dataGuideAttr);

      if (!el) {
        console.warn(`Element with data-guide-id="${dataGuideAttr}" not found`);
        return;
      }

      console.log('Found element:', el);

      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      el.classList.add('autoui-highlight');
      highlightedElRef.current = el;

      const durationMs = 2000;
      timeoutRef.current = window.setTimeout(() => {
        clearHighlight();
      }, durationMs);
    } catch (e) {
      console.error('pointTo error:', e);
    }
  };

  useEffect(() => {
    return () => {
      clearHighlight();
    };
  }, []);

  return <PointerContext.Provider value={{ pointTo }}>{children}</PointerContext.Provider>;
};

export const usePointerContext = () => {
  const ctx = useContext(PointerContext);
  if (!ctx) {
    throw new Error('usePointerContext must be used within PointerContextProvider');
  }
  return ctx;
};
