import type { FC } from 'react';
import type { BtnOpenChatProps } from '@lib/ui/chat/types';
import clsx from 'clsx';
import XMarkIcon from '../assets/xmark-svgrepo-com.svg';
import PlusIcon from '../assets/plus-large-svgrepo-com.svg';

export const BtnOpenChat: FC<BtnOpenChatProps> = ({ onOpenChange, isOpen, className }) => {
  const safeIsOpen = isOpen ?? true;

  const iconSrc = safeIsOpen ? XMarkIcon : PlusIcon;

  return (
    <button onClick={onOpenChange} className={clsx('autoui-chat-open-btn', className)}>
      <img src={iconSrc} alt={safeIsOpen ? 'Open char' : 'Close chat'} width={24} height={24} />
    </button>
  );
};
