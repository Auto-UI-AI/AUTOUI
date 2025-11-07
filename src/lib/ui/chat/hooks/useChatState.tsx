import { useEffect, useMemo, useRef, useState } from "react";
import type { SerializedMessage, ChatMessage } from "../types";
import { rerenderChatFromHistory } from "@lib/runtime/rerenderChatFromHistory";
import { useAutoUi } from "./useAutoUI";
import { useRendering } from "./useRendering";

export function useChatState(storageKey: string, config: any) {

  const {resolveComponent, setUI} = useRendering(config);
  const [serializedMessages, setSerializedMessages] = useState<SerializedMessage[]>(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? (JSON.parse(s) as SerializedMessage[]) : [];
    } catch {
      return [];
    }
  });

  const hydratedRef = useRef(false);
  useEffect(() => {
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(storageKey, JSON.stringify(serializedMessages));
  }, [serializedMessages, storageKey]);

  useEffect(() => {
    try {
      const s = localStorage.getItem(storageKey);
      setSerializedMessages(s ? (JSON.parse(s) as SerializedMessage[]) : []);
    } catch {
      setSerializedMessages([]);
    }
  }, [storageKey]);

  const messages: ChatMessage[] = useMemo(
    () => rerenderChatFromHistory(serializedMessages, resolveComponent, setUI ),
    [serializedMessages, config]
  );
  useEffect(() => {
  if (!hydratedRef.current) return;
  const id = setTimeout(() => {
    localStorage.setItem(storageKey, JSON.stringify(serializedMessages));
  }, 50);
  return () => clearTimeout(id);
}, [serializedMessages, storageKey]);


  return { messages, serializedMessages, setSerializedMessages };
}
