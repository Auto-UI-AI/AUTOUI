import React from "react";
import type { ChatMessage } from "../types";

export interface ChatMessageListItemProps {
    message: ChatMessage;
}

export const ChatMessageListItem: React.FC<ChatMessageListItemProps> = ({ message }) => {
    const isUser = message.role === "user";

    return (
        <div
            className={`autoui-chat-message ${isUser ? "user" : "assistant"}`}
            role="article"
            aria-label={isUser ? "User message" : "Assistant message"}
        >
            <div className="autoui-chat-bubble">{message.content}</div>
        </div>
    );
};
