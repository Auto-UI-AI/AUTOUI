import { getInstructionPlan } from '@lib/core/llmClient';
import type { AutoUIConfig } from '@lib/types';
import { useCallback } from 'react';

export function useAutoUi(config:AutoUIConfig) {
  const processMessage = useCallback(async (text: string) => {
    // await new Promise((r) => setTimeout(r, 500));
    // if (text.toLowerCase().includes('product')) {
    //   return <div style={{ color: 'var(--autoui-accent)' }}>🛍️ Showing product list (mock)...</div>;
    // }
    // return '🤖 This is a mock assistant response.';

    const instructionPlan = await getInstructionPlan(text, config)
    // console.log(JSON.stringify(instructionPlan))
    
    return JSON.stringify(instructionPlan)
  }, []);

  return { processMessage };
}
