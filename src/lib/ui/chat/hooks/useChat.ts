import { useCallback, useEffect, useState } from 'react';
import type { ChatContextType, ChatMessage, ChatProps } from '../types';
import { useAutoUi } from './useAutoUI';

export function useChat({
  onError,
  onClose,
  storageKey = 'autoui_chat_history',
  title,
  classNames,
  isOpen,
}: ChatProps): ChatContextType {
  const { processMessage, setUIRenderer } = useAutoUi();
 useEffect(() => {
  setUIRenderer((ui) => {
    const id = `${Date.now()}-ui`;
    setMessages((prev) => [...prev, { id, role: "assistant", content: ui }]); 
  });
}, [setUIRenderer]);

const [messages, setMessages] = useState<ChatMessage[]>(() => {
  try {
    const raw = localStorage.getItem(storageKey);
    const arr = raw ? (JSON.parse(raw) as { id: string; role: ChatMessage["role"]; content: string }[]) : [];
    return arr.map((m) => ({ ...m, content: m.content })); 
  } catch {
    return [];
  }
});

useEffect(() => {
  const serializable = messages.map((m) => {
    if (typeof m.content === "string") return m;

    return { ...m, content: "[UI component]" };

  }).filter(Boolean);
  localStorage.setItem(storageKey, JSON.stringify(serializable));
}, [messages, storageKey]);
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
        console.error('AutoUI Chat error:', err); 
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
