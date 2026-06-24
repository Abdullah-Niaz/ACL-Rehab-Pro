import React from "react";
export default function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full bg-slate-100 rounded-full h-3">
      <div
        className="bg-blue-600 h-3 rounded-full"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
