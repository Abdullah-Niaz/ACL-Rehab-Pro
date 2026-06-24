import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, CartesianGrid 
} from 'recharts';

// Premium Custom Tooltip matching modern SaaS dashboards
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-100 shadow-xl p-3.5 text-xs font-sans text-slate-800">
        <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 font-medium">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block" 
              style={{ backgroundColor: item.color || item.fill }}
            />
            <span className="text-slate-600">{item.name}:</span>
            <span className="font-extrabold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendLine({ data, keyName, label, strokeColor = "#2563EB" }) {
  const gradientId = `grad_${keyName}`;
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100% font-sans">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f8fafc" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            dy={8}
            style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
            style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            name={label}
            type="monotone" 
            dataKey={keyName} 
            stroke={strokeColor} 
            strokeWidth={2} 
            activeDot={{ r: 6, strokeWidth: 0, fill: strokeColor }}
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendBar({ data, keyName, label, barColor = "#2563EB" }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid stroke="#f8fafc" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            dy={8}
            style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
            style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            name={label}
            dataKey={keyName} 
            fill={barColor} 
            radius={[6, 6, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
