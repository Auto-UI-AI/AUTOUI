import React from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import "../styles/index.css";
import type { ChatProps } from "../types";
import { useChat } from "../hooks/useChat";
import { ChatHeader } from "./ChatHeader";
import { ChatProvider } from "../context/chatContext";
import { clsx } from "@lib/utils/clsx";

export const Chat: React.FC<ChatProps> = ({
    title = "AutoUI Chat",
    isOpen = true,
    classNames,
    onClose,
    onError,
    closeIcon,
}) => {
    const context = useChat({ title, isOpen, classNames, closeIcon, onClose, onError });

    if (!isOpen) return;

    return (
        <ChatProvider value={context}>
            <section
                role={"base"}
                className={clsx("autoui-chat", classNames?.base)}
                aria-label="Chat"
            >
                <ChatHeader />
                <ChatMessageList />
                <ChatInput />
            </section>
        </ChatProvider>
    );
};
