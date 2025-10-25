import React, { useState } from "react";

export interface ChatInputProps {
    onSend: (message: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(value);
        setValue("");
    };

    return (
        <form className="autoui-chat-input" onSubmit={handleSubmit} aria-label="Chat input area">
            <input
                className="autoui-chat-textbox"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type a message..."
                aria-label="Message input"
            />
            <button type="submit" className="autoui-chat-send" aria-label="Send message">
                ➤
            </button>
        </form>
    );
};
