import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import type { AutoUIConfig } from '../types';
import { resolveProps } from '../utils/resolveProps';
import type { SerializedMessage } from '@lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';
import type React from 'react';
import { extraAnalysisWithLLM } from '@lib/core/extraDataAnalyzingWithLLM';

export type ResolveComponent = (name: string, props: any) => React.ReactNode;
export type SetUI = (ui: React.ReactNode | string) => void;

export async function executePlanSteps(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string, 
) {
  const ctx: Record<string, any> = {};
  for (const step of plan.steps) {
    await runStep(step, ctx, config, resolveComponent, setUI, setSerializedMessages, userMessage, plan);
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
  plan: InstructionPlan,
) {
  const isPlainObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

  // --- inside runStep ---
  if (step.type === 'function') {
    const fCfg = config.functions[step.name];
    if (!fCfg) throw new Error(`Unknown function: ${step.name}`);

 
  const fn = fCfg.callFunc as any;

    // The plan may provide either .args (positional) or .params (object).
    const anyStep = step as any;
  const hasArgs = Array.isArray(anyStep.args);
  const hasParamsObj = !!anyStep.params && typeof anyStep.params === 'object';

  let out: any;

  if (hasArgs) {
    let args = anyStep.args as unknown[];
    if (
      args.length === 1 &&
      isPlainObject(args[0]) &&
      Array.isArray(fCfg.params) &&
      fCfg.params.length > 0
    ) {
      const obj = args[0] as Record<string, unknown>;
      args = (fCfg.params as string[]).map((k) => obj[k]);
    }
    try {
      out = await (fn as (...a: unknown[]) => any)(...args);
    } catch {
      out = await (fn as (a?: unknown[]) => any)(args);
    }
  } else if (hasParamsObj) {
    out = await (fn as (p?: any) => any)(anyStep.params);
  } else {
    out = await fn();
  }
  
  if(fCfg.canShareDataWithLLM && step.hasToShareDataWithLLM ){
    console.log("This function is allowed to share data with LLM and LLM says that this step requires data to be shared with LLM");
    const dataToShare = await extraAnalysisWithLLM(out, config, userMessage, plan, step.name);
    console.log("Data received back from LLM after extra analysis: ", dataToShare);
    if ((step as any).assign) ctx[(step as any).assign] = dataToShare;
  }
  else{
    if ((step as any).assign) ctx[(step as any).assign] = out;
  }
  return;
}
  if (step.type === 'component') {
    console.log(
      'component step already includes the context of the instructionPlan, so here it is:',
      JSON.stringify(ctx),
    );
    const props = resolveProps(step.props ?? {}, ctx, config);
    const node = resolveComponent(step.name, props);

    setUI(node);
    setSerializedMessages((prev) => {
      if (props?.children)
        return [
          ...prev,
          { id: `${Date.now()}-a`, role: 'assistant', kind: 'ui', ui: { t: 'fragment', children: props.children } },
        ];
      else
        return [
          ...prev,
          {
            id: `${Date.now()}-a`,
            role: 'assistant',
            kind: 'ui',
            ui: { t: 'component', name: step.name, props: props },
          },
        ];
    });
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
