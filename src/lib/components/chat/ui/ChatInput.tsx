import React, { useState } from 'react';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';
import { ChatMenu } from './ChatMenu';
import { ChatTextBox } from './ChatTextBox';
import { SendButton } from './SendButton';

export interface ChatInputProps {}

export const ChatInput: React.FC<ChatInputProps> = () => {
  const { classNames, handleSend } = useChatContext();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(value);
    setValue('');
  };

  return (
    <form
      role="inputWrapper"
      className={clsx('autoui-chat-input', classNames?.inputWrapper)}
      onSubmit={handleSubmit}
      aria-label="Chat input area"
    >
      <ChatMenu />
      <ChatTextBox value={value} setValue={setValue} />
      <SendButton />
    </form>
  );
};
