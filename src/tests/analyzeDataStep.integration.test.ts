import { describe, it, expect, vi } from 'vitest';
import { analyzeDataStep } from '../lib/runtime/analyzeDataStep';

vi.mock('@lib/core/extraDataAnalyzingWithLLM', () => ({
  extraAnalysisWithLLM: vi.fn().mockResolvedValue({
    data: { a: 1 },
    newInstructionPlan: null,
  }),
}));

describe('analyzeDataStep (integration)', () => {
  it('stores normalized ctx data', async () => {
    const ctx: any = {};

    const plan = {
      type: 'sequence',
      steps: [{ type: 'function', name: 'test', assign: 'key' }],
    };

    const result = await analyzeDataStep(
      {} as any,
      { raw: true },
      'key',
      plan.steps[0] as any,
      0,
      undefined as any,
      '',
      '',
      ctx,
      plan as any,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    );

    expect(ctx.key).toBeDefined();
    expect(result).toBe(false);
  });
});
