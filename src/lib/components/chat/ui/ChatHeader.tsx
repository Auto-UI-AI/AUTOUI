import clsx from 'clsx';
import { useChatContext } from '../context/chatContext';
import { xmark } from '../../../../assets';

export const ChatHeader = () => {
  const { title, classNames, onClose, closeIcon } = useChatContext();

  return (
    <header role="header" className={clsx('autoui-chat-header', classNames?.header)}>
      <h2 role="title" className={clsx('autoui-chat-title', classNames?.title)}>
        {title}
      </h2>

      {onClose && (
        <button role="closeButton" className={clsx('autoui-chat-closebtn', classNames?.closeButton)} onClick={onClose}>
          {closeIcon ?? (
            <img
              src={xmark}
              alt={'Open char'}
              width={20}
              height={20}
              style={{
                filter: 'var(--icon-filter-text)',
              }}
            />
          )}
        </button>
      )}
    </header>
  );
};
