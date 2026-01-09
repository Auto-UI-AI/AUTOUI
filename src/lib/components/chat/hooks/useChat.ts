import { useCallback, useMemo, useState } from 'react';
import type { ChatContextType, ChatProps, SerializedMessage } from '../types';
import { useAutoUiChat } from './useAutoUiChat';
import { runInstructionPlan } from '@lib/runtime/runtimeEngine';
import { useChatState } from './useChatState';
import { useRendering } from './useRendering';
import { getLastNMessages } from '@lib/utils/getLastNMessages';

export function useChat({
  config,
  theme,
  mode,
  setTheme,
  onError,
  onClose,
  storageKey = 'autoui_chat_history',
  title,
  classNames,
  isOpen,
}: ChatProps): ChatContextType {
  const { messages, serializedMessages, setSerializedMessages } = useChatState(storageKey, config);

  const { processMessage } = useAutoUiChat(config);
  const { resolveComponent, setUI } = useRendering(config);

  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const now = Date.now().toString();
      const serializedUserMessage: SerializedMessage = {
        id: now,
        role: 'user',
        kind: 'text',
        text,
        ts: Date.now(),
      };
      setSerializedMessages((prev) => [...prev, serializedUserMessage]);

      try {
        setIsLoading(true);
        let lastNMessages = serializedMessages?getLastNMessages(serializedMessages):''
        const plan = await processMessage(text, lastNMessages);

        await runInstructionPlan(plan, config, resolveComponent, setUI, setSerializedMessages, text, lastNMessages,  {
          validate: true,
        });
      } catch (err) {
        setSerializedMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-e`,
            role: 'assistant',
            kind: 'text',
            text: '⚠️ Something went wrong.',
            ts: Date.now(),
          },
        ]);
        onError?.(err as any);
      } finally {
        setIsLoading(false);
      }
    },
    [processMessage, config, resolveComponent, setUI, setSerializedMessages, onError],
  );

  const handleClear = useCallback(() => {
    setSerializedMessages([]);

    sessionStorage.removeItem(storageKey);
  }, [setSerializedMessages, storageKey]);

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

  const contextValue = useMemo(
    () => ({
      config,
      isOpen,
      title,
      theme,
      mode,
      classNames,
      messages,
      isLoading,
      setTheme,
      handleSend,
      onClose,
      handleClear,
      getChatInputProps,
      getChatHeaderProps,
      getMessageListProps,
    }),
    [
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
    ],
  );

  return contextValue;
}

export type UseChatReturn = ReturnType<typeof useChat>;
