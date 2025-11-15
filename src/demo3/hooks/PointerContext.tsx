import React, { createContext, useContext, useState } from "react";

export interface PointerContextType {
  pointTo: (dataGuideAttr: string) => void;
  cursorState: {
    x: number;
    y: number;
    visible: boolean;
    animationKey: number;
  };
}

export const PointerContext = createContext<PointerContextType | undefined>(
  undefined
);

export const PointerContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cursorState, setCursorState] = useState({
    x: 0,
    y: 0,
    visible: false,
    animationKey: 0,
  });

  const pointTo = (dataGuideAttr: string) => {
    try {
      const el = document.querySelector(
        `[data-guide-id="${dataGuideAttr}"]`
      ) as HTMLElement | null;

      console.log("Received guide id:", dataGuideAttr);

      if (!el) {
        console.warn(`Element with data-guide-id="${dataGuideAttr}" not found`);
        return;
      }

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;

      console.log("Found element:", el);
      console.log("Element center:", { centerX, centerY });

      // unique key to restart animation
      const animationKey = Date.now();

      // 1) show cursor at target
      setCursorState({
        x: centerX,
        y: centerY,
        visible: true,
        animationKey,
      });

      // 2) hide after animation finishes (e.g. 0.6s * 3 = 1.8s)
      const totalDurationMs = 2000; // little margin
      setTimeout(() => {
        // do not hide if there was a newer pointTo call
        setCursorState((prev) =>
          prev.animationKey === animationKey
            ? { ...prev, visible: false }
            : prev
        );
      }, totalDurationMs);
    } catch (e) {
      console.error("pointTo error:", e);
    }
  };

  return (
    <PointerContext.Provider value={{ pointTo, cursorState }}>
      {children}
    </PointerContext.Provider>
  );
};

export const usePointerContext = () => {
  const ctx = useContext(PointerContext);
  if (!ctx) {
    throw new Error(
      "usePointerContext must be used within PointerContextProvider"
    );
  }
  return ctx;
};
