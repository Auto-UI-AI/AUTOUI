// PointerHintButton.tsx
import React from "react";
import { usePointerContext } from "../hooks/PointerContext";
import { Button } from "../../demo/base";
// import { usePointerContext } from "./PointerContext";

interface PointerHintButtonProps {
  target: string;              // data-guide-id value
  textToBeInserted?: string;  // button label
  className?: string;
}

export const PointerHintButton: React.FC<PointerHintButtonProps> = ({
  target,
  textToBeInserted = "Show me where it is",
  className,
}) => {
    console.log("target: ", target)
  const { pointTo } = usePointerContext();

  const handleClick = () => {
    pointTo(target);
  };

  return (
    <Button
      type="button"
      className={`${className?className:'bg-indigo-600 text-white hover:bg-indigo-500 hover:outline-3 outline-0 outline-indigo-600 transition-[2s]'}`}
      onClick={handleClick}
      data-pointer-hint-target={target} // optional, just for debugging
    >
      {textToBeInserted}
    </Button>
  );
};
