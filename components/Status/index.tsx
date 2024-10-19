// src/components/Status/index.tsx
import React from "react";

interface iStatus {
  status?: string;
  color?: string;
}

const Status: React.FC<iStatus> = ({ status, color }) => {
  const statusColorClass =
    status === "connected"
      ? "bg-green-500"
      : status === "disconnected"
      ? "bg-red-500"
      : "bg-gray-500";

  return (
    <span className="flex items-center">
      <span className={`w-5 h-5 rounded-full border border-black ${statusColorClass}`}></span>
      <span className="ml-2" style={{ color }}>{status}</span>
    </span>
  );
};

export { Status };
