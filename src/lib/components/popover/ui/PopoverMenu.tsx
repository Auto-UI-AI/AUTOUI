import React, { cloneElement, useRef, useState } from 'react';
import { Popover } from './Popover';
import { Menu } from '../../menu';
import { burgerMenu } from '@/assets';
import type { MenuItemType } from '@lib/components/menu/ui/MenuItem';

export const PopoverMenu = ({
  items,
  button,
  popoverStyles,
  defaultSelectedKey,
  closeAfterSelect,
  onSelectionChange,
}: {
  popoverStyles?: React.CSSProperties;
  items: MenuItemType[];
  closeAfterSelect?: (key: string) => boolean;
  button: React.ReactElement<any>;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setOpen] = useState(false);

  const triggerProps = {
    ref: triggerRef,
    onClick: () => {
      setOpen((prev) => !prev);
    },
    style: { cursor: 'pointer' },
  };

  return (
    <>
      {button ? (
        cloneElement(button, triggerProps)
      ) : (
        <button ref={triggerRef} onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
          <img src={burgerMenu} alt="menu" />
        </button>
      )}

      <Popover styles={popoverStyles} isOpen={isOpen} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <div style={{ borderRadius: 10, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          <Menu
            items={items}
            defaultSelectedKey={defaultSelectedKey}
            onSelectionChange={(key) => {
              onSelectionChange?.(key);
              if (closeAfterSelect?.(key)) {
                setOpen(false);
              }
            }}
          />
        </div>
      </Popover>
    </>
  );
};
