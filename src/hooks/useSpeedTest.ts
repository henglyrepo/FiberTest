"use client";

import { useState, useRef, useCallback } from "react";

export type TestStatus = "idle" | "testing" | "completed";
export type TestPhase = "ping" | "download" | "upload" | "done";

export interface SpeedTestResult {
  ping: number;
  download: number;
  upload: number;
  jitter: number;
}

const CDN_ENDPOINTS = [
  "https://speed.cloudflare.com/__down?bytes=25000000",
  "https://speed.cloudflare.com/__down?bytes=25000000",
  "https://speed.cloudflare.com/__down?bytes=25000000",
  "https://speed.cloudflare.com/__down?bytes=25000000",
];

const UPLOAD_ENDPOINTS = [
  "https://httpbin.org/post",
  "https://httpbin.org/post",
  "https://httpbin.org/post",
];

function generateRandomData(size: number): Blob {
  const buffer = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return new Blob([buffer], { type: "application/octet-stream" });
}

export function useSpeedTest() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [phase, setPhase] = useState<TestPhase>("ping");
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [results, setResults] = useState<SpeedTestResult>({
    ping: 0,
    download: 0,
    upload: 0,
    jitter: 0,
  });
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const measurePing = useCallback(async (): Promise<{ ping: number; jitter: number }> => {
    const times: number[] = [];
    const testUrl = "https://speed.cloudflare.com/__down?bytes=0";
    
    for (let i = 0; i < 6; i++) {
      const start = performance.now();
      try {
        await fetch(testUrl, { 
          method: "HEAD",
          cache: "no-store",
          signal: abortControllerRef.current?.signal 
        });
        const end = performance.now();
        times.push(end - start);
        if (i < 5) await new Promise(r => setTimeout(r, 150));
      } catch {
        times.push(999);
      }
    }
    
    const validTimes = times.filter(t => t < 500);
    if (validTimes.length === 0) return { ping: 0, jitter: 0 };
    
    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    
    let jitter = 0;
    if (validTimes.length > 1) {
      const differences = validTimes.slice(1).map((t, i) => Math.abs(t - validTimes[i]));
      jitter = differences.reduce((a, b) => a + b, 0) / differences.length;
    }
    
    return { ping: avg, jitter };
  }, []);

  const testDownload = useCallback(async (): Promise<number> => {
    const totalBytesRef = { current: 0 };
    const startTimeRef = { current: 0 };
    const speedSamples: number[] = [];
    let resolved = false;

    const downloadFile = async (url: string): Promise<number> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            const bytes = xhr.response.size;
            totalBytesRef.current += bytes;
            
            const elapsed = (performance.now() - startTimeRef.current) / 1000;
            if (elapsed > 0) {
              const speed = (totalBytesRef.current / elapsed) * 8 / 1000000;
              speedSamples.push(speed);
            }
            
            resolve(bytes);
          } else {
            resolve(0);
          }
        };
        
        xhr.onerror = () => resolve(0);
        xhr.onabort = () => resolve(0);
        
        try {
          xhr.send();
        } catch {
          resolve(0);
        }
      });
    };

    const updateSpeed = () => {
      if (resolved) return;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      if (elapsed > 0.1) {
        const currentSpeedCalc = (totalBytesRef.current / elapsed) * 8 / 1000000;
        setCurrentSpeed(currentSpeedCalc);
        setSpeedHistory(prev => {
          const newHistory = [...prev, currentSpeedCalc];
          return newHistory.slice(-60);
        });
      }
    };

    const progressInterval = setInterval(updateSpeed, 100);

    try {
      startTimeRef.current = performance.now();
      
      const downloads = CDN_ENDPOINTS.map(url => downloadFile(url));
      await Promise.all(downloads);
      
      clearInterval(progressInterval);
      resolved = true;

      const totalElapsed = (performance.now() - startTimeRef.current) / 1000;
      const finalSpeed = totalElapsed > 0 
        ? (totalBytesRef.current / totalElapsed) * 8 / 1000000 
        : 0;

      const avgSpeed = speedSamples.length > 0
        ? speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length
        : finalSpeed;

      return Math.max(finalSpeed, avgSpeed);
    } catch (error) {
      clearInterval(progressInterval);
      resolved = true;
      return 0;
    }
  }, []);

  const testUpload = useCallback(async (): Promise<number> => {
    const dataSize = 4 * 1024 * 1024;
    const data = generateRandomData(dataSize);
    const totalBytesRef = { current: 0 };
    const startTimeRef = { current: 0 };
    const speedSamples: number[] = [];
    let resolved = false;

    const uploadFile = async (endpoint: string): Promise<number> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
        
        let lastUpdate = 0;
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            totalBytesRef.current = event.loaded;
            
            const elapsed = (performance.now() - startTimeRef.current) / 1000;
            if (elapsed > 0.1 && elapsed - lastUpdate > 0.1) {
              const speed = (event.loaded / elapsed) * 8 / 1000000;
              speedSamples.push(speed);
              lastUpdate = elapsed;
              
              setCurrentSpeed(speed);
              setSpeedHistory(prev => {
                const newHistory = [...prev, speed];
                return newHistory.slice(-60);
              });
            }
          }
        };
        
        xhr.onload = () => {
          const elapsed = (performance.now() - startTimeRef.current) / 1000;
          if (elapsed > 0) {
            const speed = (dataSize / elapsed) * 8 / 1000000;
            speedSamples.push(speed);
          }
          resolve(dataSize);
        };
        
        xhr.onerror = () => resolve(0);
        xhr.onabort = () => resolve(0);
        
        try {
          xhr.send(data);
        } catch {
          resolve(0);
        }
      });
    };

    startTimeRef.current = performance.now();
    
    try {
      const uploads = UPLOAD_ENDPOINTS.map(endpoint => uploadFile(endpoint));
      await Promise.all(uploads);
      
      resolved = true;

      const totalElapsed = (performance.now() - startTimeRef.current) / 1000;
      const finalSpeed = totalElapsed > 0 
        ? (dataSize * UPLOAD_ENDPOINTS.length / totalElapsed) * 8 / 1000000 
        : 0;

      const avgSpeed = speedSamples.length > 0
        ? speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length
        : finalSpeed;

      return Math.max(finalSpeed, avgSpeed);
    } catch (error) {
      resolved = true;
      return 0;
    }
  }, []);

  const startTest = useCallback(async () => {
    setStatus("testing");
    setPhase("ping");
    setProgress(0);
    setCurrentSpeed(0);
    setSpeedHistory([]);
    abortControllerRef.current = new AbortController();

    try {
      setPhase("ping");
      const { ping, jitter } = await measurePing();
      setResults(prev => ({ ...prev, ping: Math.round(ping), jitter: Math.round(jitter * 100) / 100 }));
      setProgress(100);

      setPhase("download");
      setProgress(0);
      const downloadSpeed = await testDownload();
      setResults(prev => ({ ...prev, download: Math.round(downloadSpeed) }));
      setProgress(100);

      setPhase("upload");
      setProgress(0);
      const uploadSpeed = await testUpload();
      setResults(prev => ({ ...prev, upload: Math.round(uploadSpeed) }));
      setProgress(100);

      setPhase("done");
      setStatus("completed");
    } catch (error) {
      console.error("Speed test error:", error);
      setStatus("idle");
    }
  }, [measurePing, testDownload, testUpload]);

  const reset = useCallback(() => {
    setStatus("idle");
    setPhase("ping");
    setProgress(0);
    setCurrentSpeed(0);
    setResults({ ping: 0, download: 0, upload: 0, jitter: 0 });
    setSpeedHistory([]);
  }, []);

  return {
    status,
    phase,
    progress,
    currentSpeed,
    results,
    speedHistory,
    startTest,
    reset,
  };
}