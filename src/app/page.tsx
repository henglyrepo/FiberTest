"use client";

import { useMemo } from "react";
import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedGauge } from "@/components/SpeedGauge";
import { ServerInfo } from "@/components/ServerInfo";
import { SpeedGraph } from "@/components/SpeedGraph";
import { Activity, Upload, Download, RefreshCw, Play, Zap, Wifi, Clock, Gauge } from "lucide-react";

interface ResultCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  color: string;
  delay: string;
}

function ResultCard({ icon: Icon, label, value, unit, color, delay }: ResultCardProps) {
  return (
    <div 
      className={`glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center text-center opacity-0 animate-fade-in-up ${delay}`}
    >
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-3xl font-bold gradient-text">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{unit}</p>
      <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function Home() {
  const { status, phase, currentSpeed, results, speedHistory, startTest, reset } = useSpeedTest();

  const particles = useMemo(() => 
    [...Array(20)].map((_, i) => ({
      id: i,
      left: `${(i * 5.7) % 100}%`,
      delay: `${i * 0.5}s`,
      duration: `${15 + (i * 0.3)}s`,
    })), 
  []);

  const getPhaseLabel = () => {
    switch (phase) {
      case "ping": return "Testing Ping...";
      case "download": return "Testing Download...";
      case "upload": return "Testing Upload...";
      case "done": return "Test Complete";
      default: return "Ready";
    }
  };

  const getDisplaySpeed = () => {
    if (status === "idle") return 0;
    if (status === "completed") return results.download;
    return currentSpeed;
  };

  const maxGraphValue = Math.max(100, ...speedHistory, results.download, results.upload);

  return (
    <main className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">Professional Speed Test</span>
          </div>
          <h1 className="text-5xl font-bold gradient-text mb-3">FiberTest</h1>
          <p className="text-gray-400">Test your internet connection with precision</p>
        </header>

        <div className="space-y-6">
          <ServerInfo />

          {/* Main test card */}
          <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Gauge */}
              <div className="flex-shrink-0">
                <SpeedGauge 
                  speed={getDisplaySpeed()} 
                  maxSpeed={maxGraphValue} 
                  label={getPhaseLabel()}
                  isTesting={status === "testing"}
                />
              </div>

              {/* Results & Graph */}
              <div className="flex-1 w-full space-y-6">
                {/* Speed Graph */}
                <div className="glass-card rounded-2xl p-4">
                  <SpeedGraph 
                    data={speedHistory}
                    maxValue={maxGraphValue}
                    isTesting={status === "testing"}
                  />
                </div>

                {/* Results grid */}
                {status === "completed" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ResultCard 
                      icon={Clock} 
                      label="Ping" 
                      value={results.ping} 
                      unit="ms" 
                      color="from-amber-500 to-orange-600"
                      delay="stagger-1"
                    />
                    <ResultCard 
                      icon={Activity} 
                      label="Jitter" 
                      value={results.jitter} 
                      unit="ms" 
                      color="from-rose-500 to-pink-600"
                      delay="stagger-2"
                    />
                    <ResultCard 
                      icon={Download} 
                      label="Download" 
                      value={results.download} 
                      unit="Mbps" 
                      color="from-emerald-500 to-cyan-600"
                      delay="stagger-3"
                    />
                    <ResultCard 
                      icon={Upload} 
                      label="Upload" 
                      value={results.upload} 
                      unit="Mbps" 
                      color="from-purple-500 to-violet-600"
                      delay="stagger-4"
                    />
                  </div>
                )}

                {/* Idle state hint */}
                {status === "idle" && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <Wifi className="w-4 h-4" />
                      <span className="text-sm">Click start to begin your speed test</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={status === "completed" ? reset : startTest}
                disabled={status === "testing"}
                className={`
                  relative group px-10 py-4 rounded-2xl font-bold text-lg text-white
                  transition-all duration-300 overflow-hidden
                  ${status === "testing" 
                    ? "bg-gray-700 cursor-not-allowed" 
                    : status === "completed"
                      ? "bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 glow-green"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 glow-green hover:scale-105"
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {status === "testing" ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Testing...
                    </>
                  ) : status === "completed" ? (
                    <>
                      <Play className="w-5 h-5" />
                      Test Again
                    </>
                  ) : (
                    <>
                      <Gauge className="w-5 h-5" />
                      Start Test
                    </>
                  )}
                </span>
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>
          </div>

          {/* Performance indicator */}
          {status === "completed" && (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-medium">Performance Rating</span>
                </div>
                <span className={`text-2xl font-bold ${
                  results.download >= 100 ? "text-emerald-400" :
                  results.download >= 50 ? "text-cyan-400" :
                  results.download >= 25 ? "text-amber-400" :
                  "text-rose-400"
                }`}>
                  {results.download >= 100 ? "Excellent" :
                   results.download >= 50 ? "Very Good" :
                   results.download >= 25 ? "Good" :
                   "Fair"}
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min((results.download / 200) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Based on global average speeds. Actual performance may vary based on network conditions.
              </p>
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-gray-600 text-sm">
          <p>Powered by Cloudflare CDN • Measurements may vary</p>
        </footer>
      </div>
    </main>
  );
}
