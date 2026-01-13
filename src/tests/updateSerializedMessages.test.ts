import { describe, it, expect, vi } from 'vitest';
import { updateSerializedMessages } from '../lib/runtime/updateSerializedMessages';

describe('updateSerializedMessages', () => {
  it('adds component message', () => {
    const setState = vi.fn((cb) => cb([]));

    updateSerializedMessages(setState as any, { a: 1 }, { name: 'TestComponent' } as any);

    expect(setState).toHaveBeenCalled();
  });
});
