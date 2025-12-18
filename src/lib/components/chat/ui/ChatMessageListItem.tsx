import React, { type ReactNode } from 'react';
import type { ChatMessage } from '../types';
import { useChatContext } from '../context/chatContext';
import clsx from 'clsx';

export interface ChatMessageListItemProps {
  message: ChatMessage;
}

export const ChatMessageListItem: React.FC<ChatMessageListItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { classNames } = useChatContext();

  const isContentString = typeof message.content === 'string' || message.content instanceof String;

  return (
    <div
      role="message"
      className={clsx('autoui-chat-message', isUser ? 'user' : 'assistant', classNames?.message)}
      aria-label={isUser ? 'User message' : 'Assistant message'}
    >
      <div
        className={`autoui-chat-bubble ${isContentString ? 'autoui-chat-bubble--string' : 'autoui-chat-bubble--react-node'}`}
      >
        {message.content as ReactNode}
      </div>
    </div>
  );
};
