import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/utils/formatting/resolveProps', () => ({
  resolveProps: (props: any, ctx: any) => {
    return { v: ctx.x };
  },
}));

import { executePlanSteps } from '../lib/runtime/stepExecutor';

describe('executePlanSteps (integration)', () => {
  it('function → component', async () => {
    const setUI = vi.fn();
    const setSerializedMessages = vi.fn();
    const resolveComponent = vi.fn().mockReturnValue('<UI />');

    const config = {
      functions: {
        test: {
          callFunc: vi.fn().mockResolvedValue('value'),
          canShareDataWithLLM: false,
        },
      },
    };

    const plan = {
      type: 'sequence',
      steps: [
        { type: 'function', name: 'test', assign: 'x' },
        { type: 'component', name: 'Comp', props: { v: '{x}' } },
      ],
    };

    await executePlanSteps(plan as any, config as any, resolveComponent, setUI, setSerializedMessages, 'msg', '');

    expect(resolveComponent).toHaveBeenCalledWith('Comp', { v: 'value' });
  });
});
