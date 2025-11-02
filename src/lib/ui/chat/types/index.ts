import type React from 'react';

export type BtnOpenChatProps = {
  isOpen?: boolean;
  onOpenChange?: () => void;
  className?: string;
};
export interface ModalChatContextValue {
  isOpen: boolean;
}

export interface ModalChatContext {
  value: ModalChatContextValue;
  setValue: React.Dispatch<React.SetStateAction<ModalChatContextValue>>;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | React.ReactNode;
}

interface ChatClassNames {
  header?: string;
  body?: string;
  footer?: string;
  title?: string;
  closeButton?: string;
  base?: string;
  inputWrapper?: string;
  input?: string;
  inputButton?: string;
  messageList?: string;
  message?: string;
}

export interface ChatContextType {
  isOpen?: boolean;
  title?: string;
  classNames?: ChatClassNames;
  messages: ChatMessage[];
  isLoading: boolean;
  closeIcon?: any;
  handleSend: (text: string) => Promise<void>;
  handleClear: () => void;
  getChatInputProps: () => {
    onSend: (text: string) => Promise<void>;
    disabled: boolean;
  };
  getChatHeaderProps: () => {
    title: string;
    onClose?: () => void;
  };
  getMessageListProps: () => {
    messages: ChatMessage[];
  };
  onClose?: () => void;
}

export interface ChatMessageListProps {}

export interface ChatProps {
  title?: string;
  isOpen?: boolean;
  storageKey?: string;
  closeIcon?: any;
  classNames?: ChatClassNames;
  onError?: (err: Error) => void;
  onClose?: () => void;
}

export type ModalChatProps = {
  portalContainer?: HTMLElement;
} & ChatProps;
