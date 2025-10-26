import React, { useEffect, useState, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { useAutoUI } from "../hooks/useAutoUI";
import "../styles/index.css";
import type { ChatMessage, ChatProps } from "../types";

export const Chat: React.FC<ChatProps> = ({
    title = "AutoUI Chat",
    isOpen = true,
    onClose,
    onError,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const { processMessage } = useAutoUI();

    useEffect(() => {
        const saved = localStorage.getItem("autoui_chat_history");
        if (saved) setMessages(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("autoui_chat_history", JSON.stringify(messages));
    }, [messages]);

    if (!isOpen) return;

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
                setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        },
        [processMessage, onError]
    );

    return (
        <section className="autoui-chat" role="complementary" aria-label="Chat">
            <header className="autoui-chat-header">
                <h2 className="autoui-chat-title">{title}</h2>
                {onClose && (
                    <button className="autoui-chat-closebtn" onClick={onClose}>
                        <img
                            src={"xmark-svgrepo-com.svg"}
                            alt={"Open char"}
                            width={24}
                            height={24}
                        />
                    </button>
                )}
            </header>

            <ChatMessageList messages={messages} />

            <ChatInput onSend={handleSend} />
        </section>
    );
};
