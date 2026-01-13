import { describe, it, expect, vi } from 'vitest';
import { invokeFunction } from '../lib/runtime/invokeFunction';

describe('invokeFunction', () => {
  it('calls function with args', async () => {
    const fn = vi.fn().mockResolvedValue(3);

    const res = await invokeFunction({ callFunc: fn, params: [] } as any, { args: [1, 2] } as any);

    expect(fn).toHaveBeenCalledWith(1, 2);
    expect(res).toBe(3);
  });

  it('calls function with params object', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    const res = await invokeFunction({ callFunc: fn } as any, { params: { a: 1 } } as any);

    expect(fn).toHaveBeenCalledWith({ a: 1 });
    expect(res).toBe('ok');
  });
});
