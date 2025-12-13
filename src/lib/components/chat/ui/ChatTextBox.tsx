import { clsx } from '@lib/utils/clsx';
import React from 'react';
import { useChatContext } from '../context/chatContext';

export const ChatTextBox = ({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { classNames } = useChatContext();
  return (
    <input
      role="input"
      className={clsx('autoui-chat-textbox', classNames?.input)}
      type="text"
      value={value}
      autoFocus
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type a message..."
      aria-label="Message input"
    />
  );
};
