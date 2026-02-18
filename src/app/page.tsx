"use client";

import { useSpeedTest } from "@/hooks/useSpeedTest";
import { SpeedGauge } from "@/components/SpeedGauge";
import { ServerInfo } from "@/components/ServerInfo";
import { Activity, Upload, Download, RefreshCw, Play } from "lucide-react";

export default function Home() {
  const { status, phase, currentSpeed, results, startTest, reset } = useSpeedTest();

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Speed Test</h1>
          <p className="text-gray-400">Test your internet connection speed</p>
        </header>

        <ServerInfo />

        <div className="mt-8 bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <SpeedGauge 
              speed={getDisplaySpeed()} 
              maxSpeed={Math.max(100, results.download, results.upload)} 
              label={getPhaseLabel()}
            />

            {status === "completed" && (
              <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-md">
                <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                  <Activity className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">{results.ping}</p>
                  <p className="text-xs text-gray-400">Ping (ms)</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                  <Download className="w-5 h-5 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold text-white">{results.download}</p>
                  <p className="text-xs text-gray-400">Download (Mbps)</p>
                </div>
                <div className="text-center p-4 bg-gray-700/50 rounded-xl">
                  <Upload className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold text-white">{results.upload}</p>
                  <p className="text-xs text-gray-400">Upload (Mbps)</p>
                </div>
              </div>
            )}

            <button
              onClick={status === "completed" ? reset : startTest}
              disabled={status === "testing"}
              className={`mt-8 px-8 py-3 rounded-full font-semibold text-white transition-all duration-200 flex items-center gap-2
                ${status === "testing" 
                  ? "bg-gray-600 cursor-not-allowed" 
                  : status === "completed"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
            >
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
                  <Play className="w-5 h-5" />
                  Start Test
                </>
              )}
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Cloudflare CDN • Measurements may vary</p>
        </footer>
      </div>
    </main>
  );
}
