import React from "react";
import { ChatMessageListItem } from "./ChatMessageListItem";
import type { ChatMessageListProps } from "../types";
import { useChatContext } from "../context/chatContext";
import { clsx } from "@lib/utils/clsx";

export const ChatMessageList: React.FC<ChatMessageListProps> = () => {
    const { messages, classNames } = useChatContext();
    return (
        <div
            className={clsx("autoui-chat-messages", classNames?.messageList)}
            role="messageList"
            aria-live="polite"
        >
            {messages.map((msg) => (
                <ChatMessageListItem key={msg.id} message={msg} />
            ))}
        </div>
    );
};
