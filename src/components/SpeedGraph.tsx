"use client";

import { useEffect, useRef, useMemo } from "react";

interface SpeedGraphProps {
  data: number[];
  maxValue?: number;
  isTesting: boolean;
}

export function SpeedGraph({ data, maxValue = 100, isTesting }: SpeedGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const colors = useMemo(() => ({
    line: '#10b981',
    lineGlow: 'rgba(16, 185, 129, 0.5)',
    fill: 'rgba(16, 185, 129, 0.1)',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: 'rgba(255, 255, 255, 0.4)',
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (graphHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (maxValue / 4) * i;
      ctx.fillStyle = colors.text;
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(value)}`, padding.left - 8, y + 4);
    }

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (graphWidth / 5) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    if (data.length < 2) return;

    // Normalize data points
    const points = data.map((value, index) => ({
      x: padding.left + (index / (Math.max(data.length - 1, 1))) * graphWidth,
      y: padding.top + graphHeight - (Math.min(value, maxValue) / maxValue) * graphHeight,
    }));

    // Draw glow effect
    ctx.save();
    ctx.shadowColor = colors.lineGlow;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Draw gradient fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    for (let i = 0; i < points.length; i++) {
      const xc = i < points.length - 1 
        ? (points[i].x + points[i + 1].x) / 2 
        : points[i].x;
      const yc = i < points.length - 1 
        ? (points[i].y + points[i + 1].y) / 2 
        : points[i].y;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw current value dot
    if (points.length > 0) {
      const lastPoint = points[points.length - 1];
      
      // Glow
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.fill();
      
      // Dot
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.line;
      ctx.fill();
      
      // Inner dot
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

  }, [data, maxValue, colors, isTesting]);

  return (
    <div className="relative">
      <div className="absolute top-2 left-4 z-10">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Live Speed</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-xl"
        style={{ background: 'rgba(15, 15, 25, 0.5)' }}
      />
      {isTesting && (
        <div className="absolute top-2 right-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-400">Recording</span>
        </div>
      )}
    </div>
  );
}
