import { getInstructionPlan } from '@lib/core/llmClient';
import type { AutoUIConfig } from '@lib/types';
import { useCallback } from 'react';
export function useAutoUiChat(config: AutoUIConfig) {
  const processMessage = useCallback(
    async (text: string, lastNMessages:string) => {
      
      let plan = await getInstructionPlan(text, config, lastNMessages);
      console.log('RAW PLAN FROM LLM:', plan);

      if (typeof plan === 'string') {
        try {
          plan = JSON.parse(plan);
        } catch {
          console.error('❌ Failed to parse plan JSON:', plan);
          throw new Error('Invalid plan format: could not parse JSON');
        }
      }

      if (!plan || typeof plan !== 'object' || !plan.type || !plan.steps) {
        console.error('❌ Invalid plan structure:', plan);
        throw new Error("Plan must be an object with 'type' and 'steps'.");
      }

      return plan;
    },
    [config],
  );

  return { processMessage };
}
