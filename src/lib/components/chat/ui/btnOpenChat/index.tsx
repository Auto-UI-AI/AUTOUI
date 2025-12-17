import type { FC } from 'react';
import { plus, xmark } from '../../../../../assets';
import { clsx } from '@lib/utils/clsx';
import type { BtnOpenChatProps } from '@lib/components/chat/types';

export const BtnOpenChat: FC<BtnOpenChatProps> = ({ onOpenChange, isOpen, className }) => {
  const safeIsOpen = isOpen ?? true;

  const iconSrc = safeIsOpen ? xmark : plus;

  return (
    <button onClick={onOpenChange} className={clsx('autoui-chat-open-btn', className)}>
      <img
        src={iconSrc}
        alt={safeIsOpen ? 'Close chat' : 'Open chat'}
        width={24}
        height={24}
        style={{
          filter: 'var(--icon-filter-text)',
        }}
      />
    </button>
  );
};
