import { getInstructionPlan } from '@lib/core/llmClient';
import { autouiConfig } from '../../../../../autoui.config.example';
import { useCallback } from 'react';
export function useAutoUi() {
  const processMessage = useCallback(async (text: string) => {
    let response = await getInstructionPlan(text, autouiConfig)
    // await new Promise((r) => setTimeout(r, 500));
    // if (text.toLowerCase().includes('product')) {
    //   return <div style={{ color: 'var(--autoui-accent)' }}>🛍️ Showing product list (mock)...</div>;
    // }
    // return '🤖 This is a mock assistant response.';
    return response
  }, []);

  return { processMessage };
}
