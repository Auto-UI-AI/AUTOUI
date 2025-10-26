import { lazy } from "react";
import { createPortal } from "react-dom";
import { ChatProvider, useChatContext } from "../context/chatContext";
import { BtnOpenChat } from "./btnOpenChat";
import type { ModalChatProps } from "../types";

const LazyChat = lazy(() =>
    import("./Chat").then((m) => ({
        default: m.Chat,
    }))
);

export const ModalChat = ({ portalContainer }: ModalChatProps) => {
    return (
        <ChatProvider>
            <ModalChatBody portalContainer={portalContainer} />
        </ChatProvider>
    );
};

const ModalChatBody = ({ portalContainer }: ModalChatProps) => {
    const { value, setValue } = useChatContext();
    const { isOpen } = value;

    const onOpen = () => setValue((prev) => ({ ...prev, isOpen: true }));
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
                            <LazyChat {...value} onClose={onClose} />
                        </div>
                    </div>,
                    container
                )}
        </>
    );
};
