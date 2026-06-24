import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KpiCard({ title, value, sub, trendValue, trendDirection, icon: Icon }) {
  const isUp = trendDirection === "up";
  const hasTrend = !!trendValue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-premium p-6 hover:shadow-soft hover:border-slate-200/60 transition duration-200 flex justify-between items-start select-none">
      <div className="space-y-2.5">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
          {title}
        </span>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        
        <div className="flex items-center gap-2">
          {hasTrend && (
            <span className={`inline-flex items-center gap-0.5 rounded-lg px-2 py-0.5 text-xs font-bold ${
              isUp 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trendValue}
            </span>
          )}
          {sub && (
            <span className="text-xs text-slate-500 font-medium">
              {sub}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div className="p-3 bg-slate-50 border border-slate-100/80 rounded-xl text-slate-500 hover:text-slate-800 transition">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
