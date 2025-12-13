import { getInstructionPlan } from '@lib/core/llmClient';
import type { AutoUIConfig } from '@lib/types';
import { parseInstructionPlan } from '@lib/utils/parseInstructionPlan';
import { useCallback } from 'react';

export function useAutoUiChat(config: AutoUIConfig) {
  const processMessage = useCallback(
    async (text: string) => {
      let plan = await getInstructionPlan(text, config);
      console.log('📝 Received instruction plan:', plan);
      // NEW: robust parsing
      const parsed = parseInstructionPlan(plan);
      console.log('✅ Parsed plan object:', parsed);

      if (!parsed || typeof parsed !== 'object' || !parsed.type || !parsed.steps) {
        console.error('❌ Invalid plan structure:', parsed);
        throw new Error("Plan must be an object with 'type' and 'steps'.");
      }
      return parsed;
    },
    [config],
  );

  return { processMessage };
}
