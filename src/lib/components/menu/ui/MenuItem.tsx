import { useMemo, type FC } from 'react';
import { MenuSelectedIcon } from './MenuSelectedIcon';

export interface MenuItemType {
  key: string;
  label: string;
  description?: string;
  shortcut?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect?: () => void;
  disableAnimation?: boolean;
  hideSelectedIcon?: boolean;
  selectedIcon?: React.ReactNode | ((args: any) => React.ReactNode);
}

export const MenuItem: FC<MenuItemType> = ({
  label,
  description,
  shortcut,
  startContent,
  endContent,
  isSelected,
  isDisabled,
  onSelect,
  disableAnimation,
  hideSelectedIcon,
  selectedIcon,
}) => {
  const icon = useMemo(() => {
    const defaultIcon = <MenuSelectedIcon disableAnimation={disableAnimation} isSelected={!!isSelected} />;

    if (typeof selectedIcon === 'function') {
      return selectedIcon({
        icon: defaultIcon,
        isSelected,
        isDisabled,
      });
    }

    return selectedIcon || defaultIcon;
  }, [selectedIcon, isSelected, isDisabled, disableAnimation]);

  return (
    <li
      className={`hero-menu-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={() => {
        console.log(1);
        !isDisabled && onSelect?.();
      }}
    >
      {startContent && <span className="start">{startContent}</span>}

      <div className="content">
        <span className="label">{label}</span>
        {description && <span className="description">{description}</span>}
      </div>

      {shortcut && <kbd className="shortcut">{shortcut}</kbd>}

      {!hideSelectedIcon && <span className="selected-icon">{icon}</span>}

      {endContent && <span className="end">{endContent}</span>}
    </li>
  );
};
