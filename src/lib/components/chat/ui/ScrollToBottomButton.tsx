import { arrowUp } from '@/assets';
import React from 'react';

type ScrollToBottomButtonProps = {
  visible: boolean;
  onClick: () => void;
};

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <button type="button" className="chat-scroll-bottom" onClick={onClick} aria-label="Scroll to bottom">
      <img
        src={arrowUp}
        alt="arrow up"
        width={24}
        height={24}
        style={{
          transform: 'rotate(180deg)',
          filter: 'var(--icon-filter-text)',
        }}
      />
    </button>
  );
};
