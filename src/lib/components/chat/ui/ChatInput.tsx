import React, { useState } from 'react';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';
import { arrowUp } from '../../../../assets';

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
      <input
        role="input"
        className={clsx('autoui-chat-textbox', classNames?.input)}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        aria-label="Message input"
      />
      <button
        role="inputButton"
        type="submit"
        className={clsx('autoui-chat-send', classNames?.inputButton)}
        aria-label="Send message"
      >
        <img src={arrowUp} alt="arrow up" />
      </button>
    </form>
  );
};
