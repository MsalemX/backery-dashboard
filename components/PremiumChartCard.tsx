"use client";

import { useEffect, useState } from "react";

interface ChartCardProps {
  title: string;
  value: string;
  unit?: string;
  subText: string;
  data?: number[];
  color: "amber" | "emerald" | "rose" | "blue" | "teal" | "gray";
  type?: "sparkline" | "stat";
  icon?: React.ReactNode;
}

export default function PremiumChartCard({
  title,
  value,
  unit,
  subText,
  data = [],
  color,
  type = "sparkline",
  icon,
}: ChartCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue;

  const chartPoints = data.length > 1
    ? data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((val - minValue) / range) * 60 - 20,
      }))
    : [];

  const getPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      d += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const pathD = chartPoints.length > 0 ? getPath(chartPoints) : "";

  const colorMap = {
    amber: { stroke: "#d97706", fill: "rgba(251, 191, 36, 0.15)", bg: "bg-amber-50", text: "text-amber-600" },
    emerald: { stroke: "#059669", fill: "rgba(16, 185, 129, 0.15)", bg: "bg-emerald-50", text: "text-emerald-600" },
    rose: { stroke: "#e11d48", fill: "rgba(244, 63, 94, 0.15)", bg: "bg-rose-50", text: "text-rose-600" },
    blue: { stroke: "#2563eb", fill: "rgba(59, 130, 246, 0.15)", bg: "bg-blue-50", text: "text-blue-600" },
    teal: { stroke: "#0d9488", fill: "rgba(20, 184, 166, 0.15)", bg: "bg-teal-50", text: "text-teal-600" },
    gray: { stroke: "#4b5563", fill: "rgba(107, 114, 128, 0.15)", bg: "bg-gray-50", text: "text-gray-600" },
  };

  const firstValue = data[0] || 0;
  const lastValue = data[data.length - 1] || 0;
  const isPositive = lastValue >= firstValue;
  
  // Use trend color (emerald for positive, rose for negative) if data is available
  const trendColor = data.length > 0 ? (isPositive ? "emerald" : "rose") : color;
  const selectedColor = colorMap[trendColor as keyof typeof colorMap] || colorMap.amber;

  return (
    <div className="group relative bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-500 overflow-hidden hover:shadow-xl hover:shadow-gray-100/50 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-[13px] font-bold text-gray-400">
               {title}
             </h3>
             {icon && <div className={`${selectedColor.text} opacity-70`}>{icon}</div>}
          </div>
          <h2 className={`text-3xl font-black ${selectedColor.text} tracking-tight font-sans`}>
            {value} <span className="text-sm font-medium">{unit}</span>
          </h2>
        </div>
      </div>

      <div className="relative z-20 mt-2">
        <p className="text-[11px] font-bold text-gray-500 line-clamp-2 min-h-[32px]">{subText}</p>
      </div>

      {type === "sparkline" && chartPoints.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none opacity-20 group-hover:opacity-40 transition-all duration-700 z-0">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
             <defs>
              <linearGradient id={`grad-${encodeURIComponent(title)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={selectedColor.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={selectedColor.stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L 100,100 L 0,100 Z`}
              fill={`url(#grad-${encodeURIComponent(title)})`}
              className={`transition-all duration-1000 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
            />
            <path
              d={pathD}
              fill="none"
              stroke={selectedColor.stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-all duration-1000 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
              style={{
                strokeDasharray: isLoaded ? "200" : "0",
                strokeDashoffset: isLoaded ? "0" : "200",
                transition: "stroke-dashoffset 1.5s ease-in-out, opacity 1s",
              }}
            />
          </svg>
        </div>
      )}
      
      {/* Visual Indicator */}
      <div className={`absolute top-0 right-0 w-1.5 h-full ${selectedColor.bg} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
    </div>
  );
}
