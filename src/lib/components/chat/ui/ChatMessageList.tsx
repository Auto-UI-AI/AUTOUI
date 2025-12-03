import React from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChatMessageListItem } from './ChatMessageListItem';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';
import { Spinner } from '@lib/components/spinner';

export const ChatMessageList: React.FC = () => {
  const { messages, classNames, isLoading } = useChatContext();

  return (
    <div className={clsx('autoui-chat-messages', classNames?.messageList)}>
      <Virtuoso
        data={messages}
        overscan={100}
        followOutput="smooth"
        initialTopMostItemIndex={messages.length - 1}
        itemContent={(_, message) => <ChatMessageListItem key={message.id} message={message} />}
      />
      {isLoading && <Spinner variant="dots" />}
    </div>
  );
};
