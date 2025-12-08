import clsx from 'clsx';
import { useChatContext } from '../context/chatContext';
import { xmark } from '../../../../assets';
import { PopoverMenu } from '@lib/components/popover';

export const ChatHeader = () => {
  const { title, classNames, onClose, closeIcon } = useChatContext();

  return (
    <header role="header" className={clsx('autoui-chat-header', classNames?.header)}>
      <h2 role="title" className={clsx('autoui-chat-title', classNames?.title)}>
        {title}
      </h2>
      <PopoverMenu
        button={<span>Open Menu ▾</span>}
        items={[
          { key: 'new', label: 'New File', shortcut: '⌘N' },
          { key: 'open', label: 'Open...', description: 'Select a file' },
          { key: 'settings', label: 'Settings' },
          { key: 'exit', label: 'Exit', disabled: true },
        ]}
        onSelectionChange={(key) => console.log('Selected:', key)}
      />

      {onClose && (
        <button role="closeButton" className={clsx('autoui-chat-closebtn', classNames?.closeButton)} onClick={onClose}>
          {closeIcon ?? <img src={xmark} alt={'Open char'} width={24} height={24} />}
        </button>
      )}
    </header>
  );
};
