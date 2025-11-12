import type { FC } from 'react';
import type { BtnOpenChatProps } from '@lib/ui/chat/types';
import clsx from 'clsx';
import { Plus, Xmark } from 'src/assets';
export const BtnOpenChat: FC<BtnOpenChatProps> = ({ onOpenChange, isOpen, className }) => {
  const safeIsOpen = isOpen ?? true;

  const iconSrc = safeIsOpen ? Xmark : Plus;

  return (
    <button onClick={onOpenChange} className={clsx('autoui-chat-open-btn', className)}>
      <img src={iconSrc} alt={safeIsOpen ? 'Open char' : 'Close chat'} width={24} height={24} />
    </button>
  );
};
