import React, { useEffect, useRef } from 'react';
import { ChatMessageListItem } from './ChatMessageListItem';
import type { ChatMessageListProps } from '../types';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';

export const ChatMessageList: React.FC<ChatMessageListProps> = () => {
  const { messages, classNames, isOpen } = useChatContext();
  const chatRef = useRef<HTMLDivElement>(null)
     const scrollToBottom = () => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };
    useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 0);
    }
  }, [isOpen]);
  
  return (
    <div ref={chatRef} className={clsx('autoui-chat-messages', classNames?.messageList)} role="messageList" aria-live="polite">
      {messages.map((msg) => (
        <ChatMessageListItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};
