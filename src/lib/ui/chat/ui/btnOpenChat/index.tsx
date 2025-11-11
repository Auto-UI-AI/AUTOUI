import type { FC } from 'react';
import type { BtnOpenChatProps } from '@lib/ui/chat/types';
import { clsx } from '@lib/utils/clsx';

export const BtnOpenChat: FC<BtnOpenChatProps> = ({ onOpenChange, isOpen, className }) => {
  const safeIsOpen = isOpen ?? true;

  const iconSrc = safeIsOpen ? '/xmark-svgrepo-com.svg' : '/plus-large-svgrepo-com.svg';

  return (
    <button onClick={onOpenChange} className={clsx('autoui-chat-open-btn', className)}>
      <img src={iconSrc} alt={safeIsOpen ? 'Close chat' : 'Open chat'} width={24} height={24} />
    </button>
  );
};
