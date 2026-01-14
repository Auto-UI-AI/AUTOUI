// src/tests/stepExecutor.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executePlanSteps } from '../lib/runtime/stepExecutor';
import type { InstructionPlan, InstructionStep } from '../lib/types/llmTypes';
import type { AutoUIConfig } from '../lib/types';
import type { SerializedMessage } from '../lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';

// Mock analyzeDataStep to control behavior
vi.mock('../lib/runtime/analyzeDataStep', () => ({
  analyzeDataStep: vi.fn().mockResolvedValue(false),
}));

// Mock runtime schema validator to suppress warnings
vi.mock('@lib/utils/validation/runtimeSchemaValidator', async () => {
  const actual = await vi.importActual<any>('@lib/utils/validation/runtimeSchemaValidator');
  return {
    ...actual,
    getRuntimeSchemaAsync: vi.fn().mockResolvedValue(null),
    validateComponentPropsRuntime: vi.fn(),
    validateFunctionParamsRuntime: vi.fn(),
    parseJsonStringsInProps: vi.fn().mockReturnValue({ props: {}, warnings: [], errors: [] }),
  };
});

describe('executePlanSteps', () => {
  const resolveComponent = vi.fn();
  const setUI = vi.fn();
  const setSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>> = vi.fn();
  const config: AutoUIConfig = { runtime: { validateLLMOutput: true }, functions: {}, components: {} } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes a text step', async () => {
    const plan: InstructionPlan = {
      type: 'sequence',
      steps: [{ type: 'text', text: 'Hello' }] as InstructionStep[],
    };

    await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    expect(setUI).toHaveBeenCalledWith('Hello');
    expect(setSerializedMessages).toHaveBeenCalled();
  });

  it('executes a component step', async () => {
    config.components = {
      Comp: {} as any,
    };
    resolveComponent.mockReturnValue('COMPONENT_NODE');

    const plan: InstructionPlan = {
      type: 'sequence',
      steps: [{ type: 'component', name: 'Comp', props: {} }] as InstructionStep[],
    };

    await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    expect(resolveComponent).toHaveBeenCalledWith('Comp', {});
    expect(setUI).toHaveBeenCalledWith('COMPONENT_NODE');
    expect(setSerializedMessages).toHaveBeenCalled();
  });

  it('stops execution when analyzeDataStep returns true', async () => {
    const analyze = await import('../lib/runtime/analyzeDataStep');
    (analyze.analyzeDataStep as any).mockResolvedValueOnce(true);

    config.functions = {
      test: { canShareDataWithLLM: true, fn: vi.fn().mockResolvedValue({}) } as any,
    };

    const plan: InstructionPlan = {
      type: 'sequence',
      steps: [
        { type: 'function', name: 'test', assign: 'x', hasToShareDataWithLLM: true },
        { type: 'text', text: 'Should not run' },
      ] as InstructionStep[],
    };

    await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    // Другий крок не виконується
    expect(setUI).not.toHaveBeenCalledWith('Should not run');
  });

  it('handles unknown function gracefully', async () => {
    const plan: InstructionPlan = {
      type: 'sequence',
      steps: [{ type: 'function', name: 'unknown' }] as InstructionStep[],
    };

    await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    // Помилка показана через UI / serialized messages
    expect(setUI).toHaveBeenCalled();
    expect(setSerializedMessages).toHaveBeenCalled();
  });

  it('handles component render failure gracefully', async () => {
    resolveComponent.mockImplementation(() => {
      throw new Error('boom');
    });

    const plan: InstructionPlan = {
      type: 'sequence',
      steps: [{ type: 'component', name: 'Comp', props: {} }] as InstructionStep[],
    };

    await executePlanSteps(plan, config, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    expect(setUI).toHaveBeenCalled();
    expect(setSerializedMessages).toHaveBeenCalled();
  });
});
