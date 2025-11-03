import { getInstructionPlan } from "@lib/core/llmClient";
import { autouiConfig } from "../../../../../autoui.config.example";
import { useCallback, useRef } from "react";
import { runInstructionPlan } from "@lib/runtime/runtimeEngine";
import type React from "react";
import type { InstructionPlan } from "@lib/types/llmTypes";

export function useAutoUi() {
  const uiRendererRef = useRef<null | ((node: React.ReactNode | string) => void)>(null);

  const setUIRenderer = useCallback((fn: (node: React.ReactNode | string) => void) => {
    uiRendererRef.current = fn;
  }, []);

  const resolveComponent = useCallback((name: string, props: any) => {
    const entry = autouiConfig?.components?.[name];
    if (!entry?.callComponent) throw new Error(`Unknown component: ${name}`);
    const Comp = entry.callComponent as React.ComponentType<any>;
    return <Comp {...props} />;
  }, []);

  const setUI = useCallback((ui: React.ReactNode | string) => {
  console.log("🔹 setUI called with:", ui);
  uiRendererRef.current?.(ui);
}, []);


  const processMessage = useCallback(async (text: string) => {
    let plan = await getInstructionPlan(text, autouiConfig);
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

    await runInstructionPlan(plan as InstructionPlan, autouiConfig, resolveComponent, setUI, { validate: true });
    return null;
  }, [resolveComponent, setUI]);

  return { processMessage, setUIRenderer };
}
