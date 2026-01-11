// tests/runtimeEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInstructionPlan } from '../lib/runtime/runtimeEngine';
import { executePlanSteps } from '../lib/runtime/stepExecutor';
import type { InstructionPlan, InstructionStep } from '../lib/types/llmTypes';
import type { AutoUIConfig } from '../lib/types';
import type { SerializedMessage } from '../lib/components/chat/types';
import type { Dispatch, SetStateAction } from 'react';

vi.mock('../lib/runtime/stepExecutor', () => ({
  executePlanSteps: vi.fn().mockResolvedValue({ result: true }),
}));

describe('runInstructionPlan', () => {
  const mockResolveComponent = vi.fn();
  const mockSetUI = vi.fn();
  const mockSetSerializedMessages: Dispatch<SetStateAction<SerializedMessage[]>> = vi.fn();

  const baseArgs = {
    resolveComponent: mockResolveComponent,
    setUI: mockSetUI,
    setSerializedMessages: mockSetSerializedMessages,
  };

  const config: AutoUIConfig = { runtime: { validateLLMOutput: true } } as any;

  const validPlan: InstructionPlan = {
    type: 'sequence',
    steps: [{ type: 'text', text: 'Hello' } as InstructionStep],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes a valid plan with validation', async () => {
    const result = await runInstructionPlan(
      validPlan,
      config,
      baseArgs.resolveComponent,
      baseArgs.setUI,
      baseArgs.setSerializedMessages,
      'user message',
      '',
    );

    expect(executePlanSteps).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ result: true });
  });

  it('skips validation if opts.validate=false', async () => {
    const invalidPlan = { type: 'wrong', steps: [] } as any;

    await runInstructionPlan(
      invalidPlan,
      config,
      baseArgs.resolveComponent,
      baseArgs.setUI,
      baseArgs.setSerializedMessages,
      'msg',
      '',
      { validate: false },
    );

    expect(executePlanSteps).toHaveBeenCalledTimes(1);
  });

  it('throws validation errors for wrong plan structure', async () => {
    const invalidPlans = [
      null,
      42,
      { type: 'sequence', steps: 'not-array' },
      { type: 'sequence', steps: [{}] },
      { type: 'sequence', steps: [{ type: 'unknown' }] },
      { type: 'sequence', steps: [{ type: 'function', name: '' }] },
      { type: 'sequence', steps: [{ type: 'component', name: '' }] },
      { type: 'sequence', steps: [{ type: 'text', text: 123 }] },
    ];

    for (const plan of invalidPlans) {
      await expect(
        runInstructionPlan(
          plan as InstructionPlan,
          config,
          baseArgs.resolveComponent,
          baseArgs.setUI,
          baseArgs.setSerializedMessages,
          'msg',
          '',
        ),
      ).rejects.toThrow();
    }
  });

  it('respects runtime.validateLLMOutput=false when opts.validate is undefined', async () => {
    const localConfig: AutoUIConfig = { runtime: { validateLLMOutput: false } } as any;
    const invalidPlan = { type: 'wrong', steps: [] } as any;

    await runInstructionPlan(
      invalidPlan,
      localConfig,
      baseArgs.resolveComponent,
      baseArgs.setUI,
      baseArgs.setSerializedMessages,
      'msg',
      '',
    );

    expect(executePlanSteps).toHaveBeenCalledTimes(1);
  });
});
