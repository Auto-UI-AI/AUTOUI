import React, { useRef, useState } from 'react';
import { Popover } from './Popover';
import { Menu } from '../../menu';
import { burgerMenu } from '@/assets';

export const PopoverMenu = ({
  items,
  button,
  popoverStyles,
  defaultSelectedKey,
  onSelectionChange,
}: {
  popoverStyles?: React.CSSProperties;
  items: any[];
  button: React.ReactNode;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      {button ?? (
        <button ref={triggerRef} onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
          <img src={burgerMenu} alt="menu" />
        </button>
      )}

      <Popover styles={popoverStyles} isOpen={isOpen} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <div style={{ background: 'white', borderRadius: 10, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          <Menu
            items={items}
            defaultSelectedKey={defaultSelectedKey}
            onSelectionChange={(key) => {
              onSelectionChange?.(key);
              setOpen(false);
            }}
          />
        </div>
      </Popover>
    </>
  );
};
