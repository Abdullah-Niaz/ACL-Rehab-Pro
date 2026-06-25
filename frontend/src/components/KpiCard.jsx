import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({ title, value, sub, trendValue, trendDirection, icon: Icon }) {
  const isUp = trendDirection === "up";
  const hasTrend = !!trendValue;

  return (
    <div className="bg-brand-canvas rounded-[16px] border border-brand-hairlineSoft p-6 transition duration-200 flex justify-between items-start select-none">
      <div className="space-y-2.5">
        <span className="text-[11px] font-extrabold text-brand-mute uppercase tracking-widest block">
          {title}
        </span>
        <h3 className="text-3xl font-extrabold text-brand-ink tracking-tight">
          {value}
        </h3>
        
        <div className="flex items-center gap-2">
          {hasTrend && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
              isUp 
                ? "bg-brand-successPale text-brand-successDeep border border-brand-successDeep/10" 
                : "bg-brand-error/10 text-brand-error border border-brand-error/20"
            }`}>
              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trendValue}
            </span>
          )}
          {sub && (
            <span className="text-xs text-brand-mute font-semibold">
              {sub}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div className="p-3 bg-brand-surfaceCard border border-brand-hairlineSoft rounded-[16px] text-brand-charcoal transition">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
