import { describe, it, expect, vi } from 'vitest';
import { resolveProps } from '../lib/utils/formatting/resolveProps';

describe('resolveProps', () => {
  const config: any = {
    functions: {
      onSubmit: {
        callFunc: vi.fn().mockResolvedValue('ok'),
      },
    },
  };

  it('returns null/undefined as is', () => {
    expect(resolveProps(null, {}, config)).toBeNull();
    expect(resolveProps(undefined, {}, config)).toBeUndefined();
  });

  it('resolves {{var}} from ctx', () => {
    const ctx = { x: 123 };
    expect(resolveProps('{{x}}', ctx, config)).toBe(123);
  });

  it('keeps normal strings untouched', () => {
    expect(resolveProps('hello', {}, config)).toBe('hello');
  });

  it('resolves nested object props', () => {
    const ctx = { value: 'test' };
    const input = {
      a: '{{value}}',
      b: {
        c: '{{value}}',
      },
    };

    expect(resolveProps(input, ctx, config)).toEqual({
      a: 'test',
      b: { c: 'test' },
    });
  });

  it('resolves arrays recursively', () => {
    const ctx = { x: 'X' };
    const input = ['{{x}}', { y: '{{x}}' }];

    expect(resolveProps(input, ctx, config)).toEqual(['X', { y: 'X' }]);
  });

  it('binds event handler to function from config', async () => {
    const input = {
      onClick: 'onSubmit',
    };

    const out = resolveProps(input, {}, config);

    expect(typeof out.onClick).toBe('function');

    await out.onClick(1, 2);

    expect(config.functions.onSubmit.callFunc).toHaveBeenCalledWith({
      args: [1, 2],
    });
  });

  it('returns other primitives as is', () => {
    expect(resolveProps(42, {}, config)).toBe(42);
    expect(resolveProps(true, {}, config)).toBe(true);
  });
});
