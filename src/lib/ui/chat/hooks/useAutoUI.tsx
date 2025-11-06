import type { AutoUIConfig } from '@lib/types';
import { useCallback } from 'react';

export function useAutoUi(config:AutoUIConfig) {
  const processMessage = useCallback(async (text: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (text.toLowerCase().includes('product')) {
      return <div style={{ color: 'var(--autoui-accent)' }}>🛍️ Showing product list (mock)...</div>;
    }
    return '🤖 This is a mock assistant response.';
  }, []);

  return { processMessage };
}
