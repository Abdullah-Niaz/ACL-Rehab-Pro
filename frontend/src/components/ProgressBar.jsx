import React from "react";
export default function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full bg-brand-secondaryBg rounded-full h-3">
      <div
        className="bg-brand-primary h-3 rounded-full"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
