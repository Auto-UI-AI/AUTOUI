import React from "react";
import { ChatMessageListItem } from "./ChatMessageListItem";
import type { ChatMessage } from "./Chat";

export interface ChatMessageListProps {
    messages: ChatMessage[];
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
    return (
        <div className="autoui-chat-messages" role="log" aria-live="polite">
            {messages.map((msg) => (
                <ChatMessageListItem key={msg.id} message={msg} />
            ))}
        </div>
    );
};
