import type { AutoUIConfig } from '../types';
import type { InstructionPlan } from '@lib/types/llmTypes';
import { executePlanSteps, type ResolveComponent, type SetUI } from './stepExecutor';
import type { SerializedMessage } from '@lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';

export type RunOptions = { validate?: boolean };

function validateInstructionPlan(plan: InstructionPlan): void {
  if (typeof plan !== 'object' || plan === null) {
    throw new Error('Plan must be an object.');
  }
  if (plan.type !== 'sequence') {
    throw new Error('Plan.type must be "sequence".');
  }
  if (!Array.isArray(plan.steps)) {
    throw new Error('Plan.steps must be an array.');
  }

  const allowed = new Set(['function', 'component', 'text']);

  plan.steps.forEach((step: any, i: number) => {
    if (typeof step !== 'object' || step === null) {
      throw new Error(`Step[${i}] must be an object.`);
    }
    if (!allowed.has(step.type)) {
      throw new Error(`Step[${i}].type must be one of "function" | "component" | "text".`);
    }

    if (step.type === 'function') {
      if (typeof step.name !== 'string' || !step.name) {
        throw new Error(`Step[${i}].name (function) must be a non-empty string.`);
      }
      if (step.params !== undefined && typeof step.params !== 'object') {
        throw new Error(`Step[${i}].params (function) must be an object if provided.`);
      }
      if (step.assign !== undefined && typeof step.assign !== 'string') {
        throw new Error(`Step[${i}].assign (function) must be a string if provided.`);
      }
    }

    if (step.type === 'component') {
      if (typeof step.name !== 'string' || !step.name) {
        throw new Error(`Step[${i}].name (component) must be a non-empty string.`);
      }
      if (step.props !== undefined && typeof step.props !== 'object') {
        throw new Error(`Step[${i}].props (component) must be an object if provided.`);
      }
    }

    if (step.type === 'text') {
      if (typeof step.text !== 'string') {
        throw new Error(`Step[${i}].text (text) must be a string.`);
      }
    }
  });
}

export async function runInstructionPlan(
  plan: InstructionPlan,
  config: AutoUIConfig,
  resolveComponent: ResolveComponent,
  setUI: SetUI,
  setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>>,
  userMessage: string,
  lastNMessages: string, 
  opts?: RunOptions,
 
) {
 
  const shouldValidate = opts?.validate ?? config.runtime?.validateLLMOutput ?? true;
  if (shouldValidate) {
    validateInstructionPlan(plan);
  }
  return await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, userMessage, lastNMessages);
}
