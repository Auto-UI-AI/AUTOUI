import { getInstructionPlan } from '@lib/core/llmClient';
import type { AutoUIConfig } from '@lib/types';
import { useCallback} from 'react';
import { useRendering } from './useRendering';

export function useAutoUi(config:AutoUIConfig) {
  const {resolveComponent, setUI} = useRendering(config)
  const processMessage = useCallback(async (text: string) => {
    let plan = await getInstructionPlan(text, config);
    console.log("Returned plan:", plan, typeof plan);

    if (typeof plan === "string") {
      try {
        plan = JSON.parse(plan);
      } catch (err) {
        console.error("❌ Failed to parse plan JSON:", plan);
        throw new Error("Invalid plan format: could not parse JSON");
      }
    }

    if (!plan || typeof plan !== "object" || !plan.type || !plan.steps) {
      console.error("❌ Invalid plan structure:", plan);
      throw new Error("Plan must be an object with 'type' and 'steps'.");
    }

    // await runInstructionPlan(plan as InstructionPlan, config, resolveComponent, setUI, { validate: true });
    return plan;
  }, [resolveComponent, setUI]);

  return { processMessage};
}
