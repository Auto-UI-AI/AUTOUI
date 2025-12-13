import { useState } from 'react';
import { MenuItem, type MenuItemType } from './MenuItem';
import '../styles/index.css';

export const Menu = ({
  items,
  defaultSelectedKey,
  onSelectionChange,
}: {
  items: MenuItemType[];
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
}) => {
  const [selectedKey, setSelectedKey] = useState(defaultSelectedKey);

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    onSelectionChange?.(key);
  };

  return (
    <ul className="hero-menu">
      {items.map((item) => (
        <MenuItem
          key={item.key}
          label={item.label}
          description={item.description}
          shortcut={item.shortcut}
          startContent={item.startContent}
          endContent={item.endContent}
          isSelected={item.key === selectedKey}
          isDisabled={item.isDisabled}
          onSelect={() => {
            item?.onSelect?.();
            handleSelect(item.key);
          }}
        />
      ))}
    </ul>
  );
};
