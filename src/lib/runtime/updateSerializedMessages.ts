import type { SerializedMessage } from "@lib/components/chat/types";
import type { ComponentStep } from "@lib/types/llmTypes";
import type React from "react";

export const updateSerializedMessages = (setSerializedMessages: React.Dispatch<React.SetStateAction<SerializedMessage[]>>, props:any, step: ComponentStep ) => {
    setSerializedMessages((prev:SerializedMessage[]) => {
        if (props?.children)
          return [
            ...prev,
            { id: `${Date.now()}-a`, role: 'assistant', kind: 'ui', ui: { t: 'fragment', children: props.children } },
          ];
        else
          return [
            ...prev,
            {
              id: `${Date.now()}-a`,
              role: 'assistant',
              kind: 'ui',
              ui: { t: 'component', name: step.name, props: props },
            },
          ];
      });
}