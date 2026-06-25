import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, CartesianGrid 
} from 'recharts';

// Premium Custom Tooltip matching modern SaaS dashboards
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-canvas/95 backdrop-blur-md rounded-[16px] border border-brand-hairlineSoft p-3.5 text-xs font-sans text-brand-body">
        <p className="font-extrabold text-brand-mute uppercase tracking-wider text-[9px] mb-1.5">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 font-medium">
            <span 
              className="w-2.5 h-2.5 rounded-full inline-block" 
              style={{ backgroundColor: item.color || item.fill }}
            />
            <span className="text-brand-mute">{item.name}:</span>
            <span className="font-extrabold text-brand-ink">{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendLine({ data, keyName, label, strokeColor = "#e60023" }) {
  const gradientId = `grad_${keyName}`;
  
  return (
    <div className="h-64 w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e5e0" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            dy={8}
            style={{ fontSize: 10, fill: '#62625b', fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
            style={{ fontSize: 10, fill: '#62625b', fontWeight: 600 }}
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

export function TrendBar({ data, keyName, label, barColor = "#e60023" }) {
  return (
    <div className="h-64 w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid stroke="#e5e5e0" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            axisLine={false} 
            dy={8}
            style={{ fontSize: 10, fill: '#62625b', fontWeight: 600 }}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            dx={-8}
            style={{ fontSize: 10, fill: '#62625b', fontWeight: 600 }}
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
