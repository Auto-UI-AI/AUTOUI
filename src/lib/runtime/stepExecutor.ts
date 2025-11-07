import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import type { AutoUIConfig } from '../types';
import { resolveProps } from '../utils/resolveProps';
import type { SerializedMessage } from '@lib/ui/chat/types';
import type { Dispatch, SetStateAction } from 'react';

export type ResolveComponent = (name: string, props: any) => React.ReactNode;
export type SetUI = (ui: React.ReactNode | string) => void;

export async function executePlanSteps(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
) {
  const ctx: Record<string, any> = {};
  for (const step of plan.steps) {
    await runStep(step, ctx, config, resolveComponent, setUI, setSerializedMessages);
  }
  return ctx;
}

async function runStep(
  step: InstructionStep,
  ctx: Record<string, any>,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>
) {
  if (step.type === 'function') {
    const f = config.functions[step.name];
    if (!f) throw new Error(`Unknown function: ${step.name}`);
    const out = await f.callFunc(step.params ?? {});
    if (step.assign) ctx[step.assign] = out;
    return;
  }

  if (step.type === 'component') {
    console.log("component step already includes the context of the instructionPlan, so here it is:", JSON.stringify(ctx))
    const props = resolveProps(step.props ?? {}, ctx, config);
    const node = resolveComponent(step.name, props);
    
    setUI(node);
    setSerializedMessages((prev)=>{
      if(props?.children) return [...prev, {id: `${Date.now()}-a`, role: 'assistant', kind: "ui", ui: {t:"fragment", children: props.children}}]
      else return [...prev, {id: `${Date.now()}-a`, role: 'assistant', kind: "ui", ui: {t:"component", name: step.name, props: props}}]
    })
    return;
  }

  if (step.type === 'text') {
    const s = step as unknown as { type: 'text'; text: string };
    setSerializedMessages((prev)=>{
      return [...prev, {id: `${Date.now()}-a`, role: 'assistant', kind: "text", text:s.text}]
    })
    setUI(s.text ?? '');
    return;
  }

  const _never: never = step;
  return _never;
}
