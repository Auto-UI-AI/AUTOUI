import { createContext, useContext, type ReactNode } from 'react';
import type { ChatContextType } from '../types';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children, value }: { children: ReactNode; value: ChatContextType }) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return ctx;
};
