import React, { useState } from 'react';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';
import { arrowUp, deleteIcon, plus, settings } from '../../../../assets';
import { PopoverMenu } from '@lib/components/popover';

export interface ChatInputProps {}

export const ChatInput: React.FC<ChatInputProps> = () => {
  const { classNames, handleClear, handleSend } = useChatContext();
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
      <PopoverMenu
        popoverStyles={{
          position: 'absolute',
        }}
        button={
          <button type="button" className="autoui-chat-input-start">
            <img src={plus} alt="menu" width={20} height={20} />
          </button>
        }
        items={[
          {
            startContent: <img src={deleteIcon} width={16} height={16} />,
            key: 'clear',
            label: 'Clear Messages',
            onSelect: handleClear,
          },
          { startContent: <img src={settings} width={16} height={16} />, key: 'settings', label: 'Settings' },
        ]}
        onSelectionChange={(key: any) => console.log('Selected:', key)}
      />
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
        <img src={arrowUp} alt="arrow up" width={24} height={24} />
      </button>
    </form>
  );
};
