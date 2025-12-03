import * as React from 'react';
import { lazy, memo } from 'react';
import { createPortal } from 'react-dom';
import { ModalChatProvider, useModalChatContext } from '../context/modalChatContext';
import { BtnOpenChat } from './btnOpenChat';
import type { ModalChatProps } from '../types';

const LazyChat = lazy(() =>
  import('./Chat').then((m) => ({
    default: m.Chat,
  })),
);

export const ModalChat = memo(({ config, portalContainer }: ModalChatProps) => {
  return (
    <ModalChatProvider config={config}>
      <ModalChatBody config={config} portalContainer={portalContainer} />
    </ModalChatProvider>
  );
});

const ModalChatBody = ({ config, portalContainer }: ModalChatProps) => {
  const { value, setValue } = useModalChatContext();
  const { isOpen } = value;

  // const onOpen = () => setValue((prev) => ({ ...prev, isOpen: true }));
  const onClose = () => setValue((prev) => ({ ...prev, isOpen: false }));
  const onOpenChange = () => setValue((prev) => ({ ...prev, isOpen: !prev.isOpen }));

  const container = portalContainer ?? document.body;

  return (
    <>
      <BtnOpenChat onOpenChange={onOpenChange} isOpen={isOpen} />
      {isOpen &&
        createPortal(
          <div className="autoui-chat-portal">
            <div className="autoui-chat-wrapper">
              <LazyChat config={config} {...value} onClose={onClose} />
            </div>
          </div>,
          container,
        )}
    </>
  );
};
