import React, { useState } from 'react';
import { useChatContext } from '../context/chatContext';
import { clsx } from '@lib/utils/clsx';
import { ChatMenu } from './ChatMenu';
import { ChatTextBox } from './ChatTextBox';
import { SendButton } from './SendButton';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { MicButton } from './MicButton';

export interface ChatInputProps {}
export const ChatInput: React.FC<ChatInputProps> = () => {
  const { classNames, handleSend } = useChatContext();
  const [value, setValue] = useState('');

  const speech = useSpeechToText({ lang: 'en-us' });

  React.useEffect(() => {
    if (!speech.text) return;
    setValue((prev) => (prev ? `${prev} ${speech.text}` : speech.text));
  }, [speech.text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(value);
    setValue('');
  };

  return (
    <form className={clsx('autoui-chat-input', classNames?.inputWrapper)} onSubmit={handleSubmit}>
      <ChatMenu />
      <ChatTextBox value={value} setValue={setValue} />

      {speech.isSupported && (
        <MicButton
          active={speech.listening}
          onClick={() => {
            speech.listening ? speech.stop() : speech.start();
          }}
        />
      )}

      <SendButton />
    </form>
  );
};
