import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import type { AutoUIConfig } from '../types';
import { resolveProps } from '../utils/resolveProps';

export type ResolveComponent = (name: string, props: any) => React.ReactNode;
export type SetUI = (ui: React.ReactNode | string) => void;

export async function executePlanSteps(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
) {
  const ctx: Record<string, any> = {};
  for (const step of plan.steps) {
    await runStep(step, ctx, config, resolveComponent, setUI);
  }
  return ctx;
}

async function runStep(
  step: InstructionStep,
  ctx: Record<string, any>,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
) {
  if (step.type === 'function') {
    const f = config.functions[step.name];
    if (!f) throw new Error(`Unknown function: ${step.name}`);
    const out = await f.callFunc(step.params ?? {});
    if (step.assign) ctx[step.assign] = out;
    return;
  }

  if (step.type === 'component') {
    const props = resolveProps(step.props ?? {}, ctx, config);
    const node = resolveComponent(step.name, props);
    setUI(node);
    return;
  }

  if (step.type === 'text') {
    const s = step as unknown as { type: 'text'; text: string };
    setUI(s.text ?? '');
    return;
  }

  const _never: never = step;
  return _never;
}
