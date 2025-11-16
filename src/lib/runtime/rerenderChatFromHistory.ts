import type { ChatMessage, SerializedMessage } from '@lib/ui/chat/types';
import type { ResolveComponent, SetUI } from './stepExecutor';

export const rerenderChatFromHistory = (
  chatHistory: SerializedMessage[],
  resolveComponent: ResolveComponent,
  setUI: SetUI,
) => {
  let messagesArray: ChatMessage[] = [];
  for (let message of chatHistory) {
    if (message.kind == 'ui') {
      let node;
      const { t } = message.ui;
      if (!t) {
        setUI('unsuccessful rerender');
        messagesArray.push({ id: message.id, role: message.role, content: node });
        return;
      }
      node = t == 'component' ? resolveComponent(message.ui.name, message.ui.props) : 'unsuccessful rerender';
      if (node) setUI(node);
    }
    if (message.kind == 'text') {
      setUI(message.text);
      messagesArray.push({ id: message.id, role: message.role, content: message.text });
    }
  }
  return messagesArray;
};
