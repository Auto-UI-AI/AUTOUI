import React, { useEffect, useState, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { useAutoUI } from "../hooks/useAutoUI";
import "../styles/index.css";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string | React.ReactNode;
}

export interface ChatProps {
    title?: string;
    onError?: (err: Error) => void;
}

export const Chat: React.FC<ChatProps> = ({ title = "AutoUI Chat", onError }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const { processMessage } = useAutoUI();

    useEffect(() => {
        const saved = localStorage.getItem("autoui_chat_history");
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("autoui_chat_history", JSON.stringify(messages));
    }, [messages]);

    const handleSend = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: text,
            };

            setMessages((prev) => [...prev, userMsg]);

            try {
                const response = await processMessage(text);
                const assistantMsg: ChatMessage = {
                    id: `${Date.now()}-a`,
                    role: "assistant",
                    content: response ?? "🤖 No response.",
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } catch (err: any) {
                const errorMsg: ChatMessage = {
                    id: `${Date.now()}-e`,
                    role: "assistant",
                    content: "⚠️ Sorry, something went wrong.",
                };
                setMessages((prev) => [...prev, errorMsg]);
                onError?.(err);
            }
        },
        [processMessage, onError]
    );

    return (
        <section className="autoui-chat" role="complementary" aria-label="Chat">
            <header className="autoui-chat-header">
                <h2 className="autoui-chat-title">{title}</h2>
            </header>

            <ChatMessageList messages={messages} />

            <ChatInput onSend={handleSend} />
        </section>
    );
};
