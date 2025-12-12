import React, { useEffect, useRef } from 'react';
import { ChatMessageListItem } from './ChatMessageListItem';
import type { ChatMessageListProps } from '../types';
import { useChatContext } from '../context/chatContext';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { clsx } from '@lib/utils/clsx';
import { Spinner } from '@lib/components/spinner';

export const ChatMessageList: React.FC<ChatMessageListProps> = () => {
  const { messages = [], classNames, isOpen, isLoading } = useChatContext();
  const chatRef = useRef<HTMLDivElement>(null);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

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

  useEffect(() => {
    virtuosoRef.current?.scrollToIndex({
      index: messages?.length - 1,
      behavior: 'smooth',
    });
  }, [messages?.length]);

  return (
    <div className={clsx('autoui-chat-messages', classNames?.messageList)}>
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        overscan={100}
        followOutput="smooth"
        components={{
          EmptyPlaceholder: () => (
            <div className="empty__palceholder">
              <span className="empty__palceholder--main">Nothing here yet</span>
              <span className="empty__palceholder--secondary">Start the conversation!</span>
            </div>
          ),
        }}
        initialTopMostItemIndex={length - 1}
        itemContent={(_, message) => <ChatMessageListItem key={message.id} message={message} />}
      />
      {isLoading && <Spinner variant="dots" color="#0a84ff" />}
    </div>
  );
};
