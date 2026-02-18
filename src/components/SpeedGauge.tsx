"use client";

import { useEffect, useState, useMemo, useId } from "react";

interface SpeedGaugeProps {
  speed: number;
  maxSpeed?: number;
  label: string;
  unit?: string;
  isTesting?: boolean;
}

export function SpeedGauge({ speed, maxSpeed = 100, label, unit = "Mbps", isTesting = false }: SpeedGaugeProps) {
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  const gradientId = useId();
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedSpeed(speed), 100);
    return () => clearTimeout(timer);
  }, [speed]);

  const radius = 85;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(animatedSpeed / maxSpeed, 1);
  const strokeDashoffset = circumference * (1 - progress);
  
  const colors = useMemo(() => {
    if (speed < 10) return { primary: "#ef4444", glow: "rgba(239, 68, 68, 0.6)", gradient: ["#ef4444", "#f97316"] };
    if (speed < 30) return { primary: "#f59e0b", glow: "rgba(245, 158, 11, 0.6)", gradient: ["#f59e0b", "#eab308"] };
    if (speed < 100) return { primary: "#10b981", glow: "rgba(16, 185, 129, 0.6)", gradient: ["#10b981", "#06b6d4"] };
    return { primary: "#06b6d4", glow: "rgba(6, 182, 212, 0.6)", gradient: ["#06b6d4", "#8b5cf6"] };
  }, [speed]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-56 h-56">
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
        />
        
        {/* Animated testing rings */}
        {isTesting && (
          <>
            <div 
              className="absolute inset-4 rounded-full animate-ring-pulse"
              style={{ border: `2px solid ${colors.primary}`, opacity: 0.5 }}
            />
            <div 
              className="absolute inset-8 rounded-full animate-ring-pulse"
              style={{ border: `2px solid ${colors.primary}`, opacity: 0.3, animationDelay: '0.5s' }}
            />
            <div 
              className="absolute inset-12 rounded-full animate-ring-pulse"
              style={{ border: `2px solid ${colors.primary}`, opacity: 0.2, animationDelay: '1s' }}
            />
          </>
        )}

        {/* Main SVG */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="inner-shadow">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="3" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.3" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>
          
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />
          
          {/* Inner decorative ring */}
          <circle
            cx="100"
            cy="100"
            r={radius - 20}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1"
          />
        </svg>
        
        {/* Reflection effect */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-full"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`,
            filter: 'blur(10px)',
            transform: 'translateY(50%) scaleY(0.3)',
          }}
        />
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Pulsing core when testing */}
            {isTesting && (
              <div 
                className="absolute inset-0 rounded-full animate-pulse-glow"
                style={{
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 60%)`,
                  filter: 'blur(15px)',
                }}
              />
            )}
            <span className="relative text-5xl font-bold gradient-text text-glow-green tracking-tight">
              {Math.round(animatedSpeed)}
            </span>
          </div>
          <span className="relative text-sm font-medium text-gray-400 mt-1">{unit}</span>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-4 px-6 py-2 glass-card rounded-full">
        <span className="text-sm font-medium text-gray-300">{label}</span>
      </div>
    </div>
  );
}
