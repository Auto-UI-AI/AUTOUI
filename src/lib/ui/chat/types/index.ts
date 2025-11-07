import type { AutoUIConfig } from '@lib/types';
import type { InstructionPlan } from '@lib/types/llmTypes';
import type { ComponentType, ReactNode } from 'react';
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
  config: AutoUIConfig
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | ReactNode | ComponentType<any>;
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
export interface ChatProviderPropsType { 
  children: ReactNode;
  value: ChatContextType;
  config: AutoUIConfig;
 }
export interface ChatContextType {
  config: AutoUIConfig;
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
  config: AutoUIConfig;
  title?: string;
  isOpen?: boolean;
  storageKey?: string;
  closeIcon?: any;
  classNames?: ChatClassNames;
  onError?: (err: Error) => void;
  onClose?: () => void;
}

export type ModalChatProps = {
  config: AutoUIConfig;
  portalContainer?: HTMLElement;
} & ChatProps;

export type ActionRef = { __action: string; args?: Record<string, unknown> };
export type UiNode =
  | { t: 'text'; text: string }
  | { t: 'component'; name: string; props?: Record<string, unknown>; children?: UiNode[] }
  | { t: 'fragment'; children?: UiNode[] };

export type SerializedMessage =
  | { id: string; role: 'assistant' | 'user'; kind: 'text'; text: string; ts?: number }
  | { id: string; role: 'assistant'; kind: 'ui'; ui: UiNode; ts?: number };
