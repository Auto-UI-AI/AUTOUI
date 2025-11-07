import { getInstructionPlan } from '@lib/core/llmClient';
import { runInstructionPlan } from '@lib/runtime/runtimeEngine';
import type { AutoUIConfig } from '@lib/types';
import type { InstructionPlan } from '@lib/types/llmTypes';
import { useCallback, useRef, type ComponentType, type ReactNode } from 'react';

export function useAutoUi(config:AutoUIConfig) {
   const uiRendererRef = useRef<null | ((node: React.ReactNode | string | ComponentType<any>) => void)>(null);

  const setUIRenderer = useCallback((fn: (node: React.ReactNode | string | ComponentType<any>) => void) => {
    uiRendererRef.current = fn;
  }, []);

  const resolveComponent = useCallback((name: string, props: any):ReactNode => {
    const entry = config?.components?.[name];
    if (!entry?.callComponent) throw new Error(`Unknown component: ${name}`);
    const Comp = entry.callComponent as React.ComponentType<any>;
    return <Comp {...props} />;
  }, []);

  const setUI = useCallback((ui: React.ReactNode | string) => {
  console.log("setUI called with:", ui);
  uiRendererRef.current?.(ui);
}, []);
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

  return { processMessage, setUIRenderer, resolveComponent, setUI };
}
