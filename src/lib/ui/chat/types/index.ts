export type BtnOpenChatProps = {
    isOpen?: boolean;
    onOpenChange?: () => void;
    className?: string;
};
export interface Value {
    isOpen: boolean;
}

export interface ChatContextValue {
    value: Value;
    setValue: React.Dispatch<React.SetStateAction<Value>>;
}
export interface ChatProps {
    title?: string;
    isOpen?: boolean;
    onError?: (err: Error) => void;
    onClose?: () => void;
}

export type ModalChatProps = {
    portalContainer?: HTMLElement;
} & ChatProps;

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string | React.ReactNode;
}
