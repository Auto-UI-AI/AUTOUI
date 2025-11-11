import { clsx } from '@lib/utils/clsx';
import { useChatContext } from '../context/chatContext';

export const ChatHeader = () => {
  const { title, classNames, onClose, closeIcon } = useChatContext();

  return (
    <header role="header" className={clsx('autoui-chat-header', classNames?.header)}>
      <h2 role="title" className={clsx('autoui-chat-title', classNames?.title)}>
        {title}
      </h2>
      {onClose && (
        <button role="closeButton" className={clsx('autoui-chat-closebtn', classNames?.closeButton)} onClick={onClose}>
          {closeIcon ?? <img src={'/xmark-svgrepo-com.svg'} alt={'Close chat'} width={24} height={24} />}
        </button>
      )}
    </header>
  );
};
