import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ModalChatContext, ModalChatContextValue } from '../types';
import type { AutoUIConfig } from '@lib/types';
export interface ModalChatProviderProps {
  config: AutoUIConfig;
  children: ReactNode;
}
const ChatContext = createContext<ModalChatContext | undefined>(undefined);

export const ModalChatProvider = ({ config, children }: ModalChatProviderProps) => {
  const [value, setValue] = useState<ModalChatContextValue>({ isOpen: false });

  const contextValue = useMemo(() => ({ value, setValue, config }), [value, setValue, config]);

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
};

export const useModalChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useModalChatContext must be used within a ModalChatProvider');
  }
  return ctx;
};
