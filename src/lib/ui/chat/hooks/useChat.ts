import { useCallback, useEffect, useState } from 'react';
import { useAutoUi } from './useAutoUi';
import type { ChatContextType, ChatMessage, ChatProps } from '../types';

export function useChat({
  onError,
  onClose,
  storageKey = 'autoui_chat_history',
  title,
  classNames,
  isOpen,
}: ChatProps): ChatContextType {
  const { processMessage } = useAutoUi();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);

      try {
        setIsLoading(true);
        const response = await processMessage(text);
        const assistantMsg: ChatMessage = {
          id: `${Date.now()}-a`,
          role: 'assistant',
          content: response ?? '🤖 No response.',
        };
        setMessages((prev) => [...prev, assistantMsg]);
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
