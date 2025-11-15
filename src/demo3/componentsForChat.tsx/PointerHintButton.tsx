import React from "react";
import { usePointerContext } from "../hooks/PointerContext";
import { Button } from "../../demo/base";

interface PointerHintButtonProps {
  target: string;
  children?: React.ReactNode;
  className?: string;
}

export const PointerHintButton: React.FC<PointerHintButtonProps> = ({
  target,
  children = "Show me where it is",
  className,
}) => {
  const { pointTo } = usePointerContext();

  const handleClick = () => {
    pointTo(target);
  };

  return (
    <Button
      type="button"
      className={`${className?className:"bg-indigo-600 hover:bg-indigo-500 text-white"}`}
      onClick={handleClick}
      data-pointer-hint-target={target}
    >
      {children}
    </Button>
  );
};
