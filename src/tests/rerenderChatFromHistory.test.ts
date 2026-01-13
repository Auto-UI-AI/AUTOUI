import { describe, it, expect, vi } from 'vitest';
import { rerenderChatFromHistory } from '../lib/runtime/rerenderChatFromHistory';

describe('rerenderChatFromHistory', () => {
  it('renders text and ui messages', () => {
    const setUI = vi.fn();
    const resolveComponent = vi.fn().mockReturnValue('<UI />');

    const history = [
      { id: '1', role: 'assistant', kind: 'text', text: 'hi' },
      { id: '2', role: 'assistant', kind: 'ui', ui: { t: 'component', name: 'C', props: {} } },
    ];

    const result = rerenderChatFromHistory(history as any, resolveComponent, setUI);

    expect(result.length).toBe(2);
    expect(resolveComponent).toHaveBeenCalled();
  });
});
