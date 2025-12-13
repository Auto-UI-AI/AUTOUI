import React, { memo } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessageList } from './ChatMessageList';
import '../styles/index.css';
import type { ChatProps } from '../types';
import { useChat } from '../hooks/useChat';
import { ChatHeader } from './ChatHeader';
import { ChatProvider } from '../context/chatContext';
import clsx from 'clsx';
import { useTheme } from '../hooks/useTheme';

export const Chat: React.FC<ChatProps> = memo(
  ({ config, title = 'AutoUI Chat', isOpen = true, classNames, onClose, onError, closeIcon }) => {
    const { theme, mode, setTheme } = useTheme();
    const context = useChat({ config, title, isOpen, classNames, closeIcon, onClose, theme, mode, setTheme, onError });

    if (!isOpen) return null;

    return (
      <ChatProvider config={config} value={context}>
        <section role={'base'} className={clsx('autoui-chat', classNames?.base)} aria-label="Chat">
          <ChatHeader />
          <ChatMessageList />
          <ChatInput />
        </section>
      </ChatProvider>
    );
  },
);
