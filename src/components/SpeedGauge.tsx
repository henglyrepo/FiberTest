"use client";

import { useEffect, useState } from "react";

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  label: string;
  unit?: string;
}

export function SpeedGauge({ speed, maxSpeed = 100, label, unit = "Mbps" }: SpeedGaugeProps) {
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedSpeed(speed), 100);
    return () => clearTimeout(timer);
  }, [speed]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(animatedSpeed / maxSpeed, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  const getColor = () => {
    if (speed < 10) return "#ef4444";
    if (speed < 30) return "#f59e0b";
    if (speed < 100) return "#22c55e";
    return "#3b82f6";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {Math.round(animatedSpeed)}
          </span>
          <span className="text-lg text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
    </div>
  );
}
