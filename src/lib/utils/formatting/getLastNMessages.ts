import type { SerializedMessage } from "@lib/components/chat/types";

const USER_MESSAGES_TO_GET = 8;
const ASSISTANT_MESSAGES_TO_GET = 7;

export const getLastNMessages = (
  messages: SerializedMessage[]
): string => {
  if (!messages?.length) return '';

  // Keep original index so we can restore order later
  const indexed = messages.map((m, index) => ({ m, index }));

  const lastUserMessages = indexed
    .filter(({ m }) => m.role === 'user')
    .slice(-USER_MESSAGES_TO_GET);

  const lastAssistantMessages = indexed
    .filter(({ m }) => m.role === 'assistant')
    .slice(-ASSISTANT_MESSAGES_TO_GET);

  const combined = [...lastUserMessages, ...lastAssistantMessages]
    .sort((a, b) => a.index - b.index)
    .map(({ m }, i) => {
      const from = m.role === 'user' ? 'from user' : 'from ai assistant';

      if (m.kind === 'text') {
        return `${i}. ${from} text: ${m.text}`;
      }

      const ui = m.ui;

      if (!ui) {
        return `${i}. ${from} ui`;
      }

      if (ui.t === 'component') {
        const props = ui.props ? Object.keys(ui.props).join(',') : '';
        const children = ui.children?.length ?? 0;

        return (
          `${i}. ${from} ui: component ${ui.name}` +
          (props ? ` props:${props}` : '') +
          (children ? ` children:${children}` : '')
        );
      }

      if (ui.t === 'fragment') {
        return `${i}. ${from} ui: fragment children:${ui.children?.length ?? 0}`;
      }

      return `${i}. ${from} ui: text`;
    });

  return combined.join('\n');
};
