import { createContext, useContext, useState, type ReactNode } from "react";
import type { ChatContextValue, Value } from "../types";

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [value, setValue] = useState<Value>({ isOpen: false });

    return <ChatContext.Provider value={{ value, setValue }}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return ctx;
};
