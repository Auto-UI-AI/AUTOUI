import { createContext, useContext } from 'react';
import type { ChatContextType, ChatProviderPropsType } from '../types';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children, value, config }: ChatProviderPropsType) => {
  return <ChatContext.Provider value={{ ...value, config }}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return ctx;
};
