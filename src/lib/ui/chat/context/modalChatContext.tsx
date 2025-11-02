import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ModalChatContext, ModalChatContextValue } from '../types';

const ChatContext = createContext<ModalChatContext | undefined>(undefined);

export const ModalChatProvider = ({ children }: { children: ReactNode }) => {
  const [value, setValue] = useState<ModalChatContextValue>({ isOpen: false });

  return <ChatContext.Provider value={{ value, setValue }}>{children}</ChatContext.Provider>;
};

export const useModalChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useModalChatContext must be used within a ModalChatProvider');
  }
  return ctx;
};
