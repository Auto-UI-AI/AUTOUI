import { useRef, useState } from 'react';
import { Popover } from './Popover';
import { Menu } from '../../menu';

export const PopoverMenu = ({
  items,
  button,
  defaultSelectedKey,
  onSelectionChange,
}: {
  items: any[];
  button: React.ReactNode;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button ref={triggerRef} onClick={() => setOpen((prev) => !prev)} style={{ cursor: 'pointer' }}>
        {button}
      </button>

      <Popover isOpen={isOpen} onClose={() => setOpen(false)} triggerRef={triggerRef}>
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
