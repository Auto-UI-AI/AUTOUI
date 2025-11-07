import { useCallback, useEffect, useState } from 'react';
import { type ChatContextType, type ChatMessage, type ChatProps, type SerializedMessage } from '../types';
import { useAutoUi } from './useAutoUI';
import { runInstructionPlan } from '@lib/runtime/runtimeEngine';
import { rerenderChatFromHistory } from '@lib/runtime/rerenderChatFromHistory';

export function useChat({
  config,
  onError,
  onClose,
  storageKey = 'autoui_chat_history',
  title,
  classNames,
  isOpen,
}: ChatProps): ChatContextType {
  const { processMessage, setUIRenderer, resolveComponent, setUI } = useAutoUi(config);
  useEffect(() => {
  setUIRenderer((ui) => {
    const id = `${Date.now()}-ui`;
    setMessages((prev) => [...prev, { id, role: "assistant", content: ui }]); 
  });
}, [setUIRenderer]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {

  try {
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    const parsed: SerializedMessage[] = JSON.parse(stored);
    return rerenderChatFromHistory(parsed, resolveComponent, setUI);
  }else{
    return []
  }
  
  } catch {
      return [];
    }
  });
  const [serializedMessages, setSerializedMessages] = useState<SerializedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(serializedMessages));
    // console.log("serializedMessages:",serializedMessages)
  }, [messages, storageKey, serializedMessages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);

      try {
        setIsLoading(true);
        const plan = await processMessage(text);

        await runInstructionPlan(plan, config, resolveComponent, setUI, setSerializedMessages, { validate: true });

        // const assistantMsg: ChatMessage = {
        //   id: `${Date.now()}-a`,
        //   role: 'assistant',
        //   content: JSON.stringify(plan) ?? '🤖 No response.',

        // };
        // setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-e`,
            role: 'assistant',
            content: '⚠️ Something went wrong.',
          },
        ]);
        onError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [processMessage, onError],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const getChatInputProps = useCallback(
    () => ({
      onSend: handleSend,
      disabled: isLoading,
    }),
    [handleSend, isLoading],
  );

  const getChatHeaderProps = useCallback(
    () => ({
      title: 'AutoUI Chat',
      onClose,
    }),
    [onClose],
  );

  const getMessageListProps = useCallback(
    () => ({
      messages,
    }),
    [messages],
  );

  return {
    config,
    isOpen,
    title,
    classNames,
    messages,
    isLoading,
    handleSend,
    onClose,
    handleClear,
    getChatInputProps,
    getChatHeaderProps,
    getMessageListProps,
  };
}

export type UseChatReturn = ReturnType<typeof useChat>;
