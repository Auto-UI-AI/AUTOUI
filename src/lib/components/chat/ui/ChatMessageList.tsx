import React, { useEffect, useRef } from 'react';
import { ChatMessageListItem } from './ChatMessageListItem';
import type { ChatMessageListProps } from '../types';
import { useChatContext } from '../context/chatContext';
import { Virtuoso } from 'react-virtuoso';
import { clsx } from '@lib/utils/clsx';
import { Spinner } from '@lib/components/spinner';

export const ChatMessageList: React.FC<ChatMessageListProps> = () => {
  const { messages, classNames, isOpen, isLoading } = useChatContext();
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  const length = messages?.length ?? 1;

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 0);
    }
  }, [isOpen]);

  return (
    <div className={clsx('autoui-chat-messages', classNames?.messageList)}>
      <Virtuoso
        data={messages}
        overscan={100}
        followOutput="smooth"
        initialTopMostItemIndex={length - 1}
        itemContent={(_, message) => <ChatMessageListItem key={message.id} message={message} />}
      />
      {isLoading && <Spinner variant="dots" color="red" />}
    </div>
  );
};
