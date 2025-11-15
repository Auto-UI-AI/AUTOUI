import React from "react";
import { usePointerContext } from "../../hooks/PointerContext";
import './Cursor.css'
export const SmartCursor: React.FC = () => {
  const { cursorState } = usePointerContext();
  const { x, y, visible, animationKey } = cursorState;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease",
      }}
    >
      <div
        key={animationKey}
        className="custom-cursor-pulse"
      />
    </div>
  );
};
