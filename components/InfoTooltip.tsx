"use client";

import { FaInfoCircle } from "react-icons/fa";

interface InfoTooltipProps {
  message: string;
  position?: "top" | "bottom" | "left" | "right";
}

export default function InfoTooltip({ 
  message, 
  position = "top" 
}: InfoTooltipProps) {
  return (
    <div 
      className="tooltip" 
      data-tip={message}
      data-position={position}
    >
      <FaInfoCircle className="text-info cursor-pointer w-4 h-4" />
    </div>
  );
}
