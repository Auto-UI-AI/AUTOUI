import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import type { AutoUIConfig } from '../types';
import { resolveProps } from '../utils/formatting/resolveProps';
import type { SerializedMessage } from '@lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import { updateSerializedMessages } from './updateSerializedMessages';
import { invokeFunction } from './invokeFunction';
import { analyzeDataStep } from './analyzeDataStep';

export type ResolveComponent = (name: string, props: any) => React.ReactNode;
export type SetUI = (ui: React.ReactNode | string) => void;

export async function executePlanSteps(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string,
  prevMessagesForContext: string,
  contextVars?: Record<string, any>,
) {
  console.log("Running instruction plan:", plan, "userMessage: ",userMessage);
  const ctx: Record<string, any> = contextVars ?? {};
  for (const step of plan.steps) {
    await runStep(
      step,
      ctx,
      config,
      resolveComponent,
      setUI,
      setSerializedMessages,
      userMessage,
      prevMessagesForContext,
      plan,
    );
  }
  return ctx;
}

async function runStep(
  step: InstructionStep,
  ctx: Record<string, any>,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string,
  prevMessagesForContext: string,
  plan: InstructionPlan,
) {
 
  if (step.type === 'function') {
    const fCfg = config.functions[step.name];
    if (!fCfg) throw new Error(`Unknown function: ${step.name}`);

    let out = await invokeFunction(fCfg, step);
    
    if (fCfg.canShareDataWithLLM && step.hasToShareDataWithLLM) {
      const assignKey = (step as any).assign;
      const currentIndex = plan.steps.indexOf(step);
      const nextStep = plan.steps[currentIndex + 1];

      await analyzeDataStep(config, out, assignKey, step, currentIndex, nextStep, userMessage, prevMessagesForContext, ctx, plan, resolveComponent, setUI, setSerializedMessages);
    } else {
      if ((step as any).assign) ctx[(step as any).assign] = out;
    }
    return;
  }
  if (step.type === 'component') {
    const props = resolveProps(step.props ?? {}, ctx, config);
    const node = resolveComponent(step.name, props);
    setUI(node);
    updateSerializedMessages(setSerializedMessages, props, step);
    return;
  }

  if (step.type === 'text') {
    const s = step as unknown as { type: 'text'; text: string };
    setSerializedMessages((prev) => {
      return [...prev, { id: `${Date.now()}-a`, role: 'assistant', kind: 'text', text: s.text }];
    });
    setUI(s.text ?? '');
    return;
  }

  const result: never = step;
  return result;
}


