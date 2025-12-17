import { arrowUp } from '@/assets';
import { clsx } from '@lib/utils/clsx';
import { useChatContext } from '../context/chatContext';

export const SendButton = () => {
  const { classNames } = useChatContext();
  return (
    <button
      role="inputButton"
      type="submit"
      className={clsx('autoui-chat-send', classNames?.inputButton)}
      aria-label="Send message"
    >
      <img
        src={arrowUp}
        alt="arrow up"
        width={24}
        height={24}
        style={{
          filter: 'var(--icon-filter-text)',
        }}
      />
    </button>
  );
};
