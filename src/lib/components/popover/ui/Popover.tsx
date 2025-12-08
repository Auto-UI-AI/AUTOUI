import { useEffect, useRef } from 'react';

export const Popover = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  position = 'bottom-left',
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<any>;
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right';
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

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isOpen || !triggerRef.current) return null;

  const rect = triggerRef.current.getBoundingClientRect();

  const style: React.CSSProperties =
    position === 'bottom-left'
      ? {
          top: rect.bottom + 6,
          left: rect.left,
        }
      : {
          top: rect.bottom + 6,
          right: window.innerWidth - rect.right,
        };

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        zIndex: 999,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
