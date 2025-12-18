import React, { useEffect, useRef, useState } from 'react';
import { ChatMessageListItem } from './ChatMessageListItem';
import type { ChatMessageListProps } from '../types';
import { useChatContext } from '../context/chatContext';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { clsx } from '@lib/utils/clsx';
import { Spinner } from '@lib/components/spinner';
import { ScrollToBottomButton } from './ScrollToBottomButton';

export const ChatMessageList: React.FC<ChatMessageListProps> = () => {
  const { messages = [], classNames, isOpen, isLoading } = useChatContext();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = () => {
    virtuosoRef.current?.scrollToIndex({
      index: messages.length - 1,
      behavior: 'smooth',
    });
  };

  const length = messages?.length ?? 1;

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages?.length]);

  return (
    <div className={clsx('autoui-chat-messages', classNames?.messageList)}>
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        overscan={100}
        followOutput="smooth"
        atBottomStateChange={(atBottom) => setShowScrollBtn(!atBottom)}
        components={{
          EmptyPlaceholder: () => (
            <div className="empty__palceholder">
              <span className="empty__palceholder--main">Nothing here yet</span>
              <span className="empty__palceholder--secondary">Start the conversation!</span>
            </div>
          ),
        }}
        initialTopMostItemIndex={length - 1}
        itemContent={(_, message) => (
          <div
            className={clsx(
              'autoui-message-row',
              message.role === 'user' && 'is-user',
              message.role === 'assistant' && 'is-assistant',
            )}
          >
            <ChatMessageListItem message={message} />
          </div>
        )}
      />
      <ScrollToBottomButton visible={showScrollBtn} onClick={scrollToBottom} />
      {isLoading && <Spinner variant="dots" color="#0a84ff" />}
    </div>
  );
};
