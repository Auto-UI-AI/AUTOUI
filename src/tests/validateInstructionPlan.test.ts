import { describe, it, expect } from 'vitest';
import { runInstructionPlan } from '../lib/runtime/runtimeEngine';

describe('validateInstructionPlan', () => {
  it('accepts valid plan', async () => {
    const plan = {
      type: 'sequence',
      steps: [{ type: 'text', text: 'hi' }],
    };

    await expect(
      runInstructionPlan(
        plan as any,
        {} as any,
        () => null,
        () => {},
        () => {},
        '',
        '',
      ),
    ).resolves.not.toThrow();
  });

  it('throws on invalid step type', async () => {
    const plan = {
      type: 'sequence',
      steps: [{ type: 'invalid' }],
    };

    await expect(
      runInstructionPlan(
        plan as any,
        {} as any,
        () => null,
        () => {},
        () => {},
        '',
        '',
      ),
    ).rejects.toThrow();
  });
});
