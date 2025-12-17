import { useEffect, useRef } from 'react';

type PopoverPosition = 'top-center' | 'bottom-left' | 'bottom-right';

export const Popover = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  styles,
  position = 'top-center',
}: {
  isOpen: boolean;
  styles?: React.CSSProperties;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  position?: PopoverPosition;
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();

  let baseStyle: React.CSSProperties = {};

  switch (position) {
    case 'top-center':
      baseStyle = {
        width: '50%',
        transform: 'translate(-2.5%, -110%)',
      };
      break;

    case 'bottom-left':
      baseStyle = {
        top: rect.bottom + 6 + window.scrollY,
        left: rect.left + window.scrollX,
      };
      break;

    case 'bottom-right':
      baseStyle = {
        top: rect.bottom + 6 + window.scrollY,
        left: rect.right + window.scrollX,
        transform: 'translateX(-100%)',
      };
      break;
  }

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        zIndex: 9999,
        ...baseStyle,
        ...styles,
      }}
    >
      {children}
    </div>
  );
};
