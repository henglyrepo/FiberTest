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
  "https://speed.cloudflare.com/__down?bytes=10000000",
  "https://speed.hetzner.de/1MB.bin",
  "https://proof.ovh.net/files/10Mb.dat",
];

const UPLOAD_ENDPOINTS = [
  "https://httpbin.org/post",
  "https://reqres.in/api/posts",
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
  const startTimeRef = useRef<number>(0);

  const measurePing = useCallback(async (): Promise<{ ping: number; jitter: number }> => {
    const times: number[] = [];
    const testUrl = "https://speed.cloudflare.com/__down?bytes=0";
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch(testUrl, { 
          method: "HEAD",
          cache: "no-store",
          signal: abortControllerRef.current?.signal 
        });
        const end = performance.now();
        times.push(end - start);
        await new Promise(r => setTimeout(r, 100));
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
    let totalDownloaded = 0;
    const speeds: number[] = [];
    
    const downloadChunk = async (url: string, index: number): Promise<number> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        
        startTimeRef.current = performance.now();
        
        xhr.onprogress = () => {
          const elapsed = (performance.now() - startTimeRef.current) / 1000;
          if (elapsed > 0) {
            const speed = (totalDownloaded / elapsed) * 8 / 1000000;
            setCurrentSpeed(speed);
            speeds[index] = speed;
            setSpeedHistory(prev => [...prev.slice(-30), speed]);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            totalDownloaded += xhr.response.size;
            resolve(xhr.response.size);
          } else {
            resolve(0);
          }
        };
        
        xhr.onerror = () => resolve(0);
        xhr.send();
      });
    };

    const streams = Math.min(4, CDN_ENDPOINTS.length);
    const promises: Promise<number>[] = [];
    
    for (let i = 0; i < streams; i++) {
      promises.push(downloadChunk(CDN_ENDPOINTS[i % CDN_ENDPOINTS.length], i));
    }
    
    await Promise.all(promises);
    
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    return avgSpeed || 0;
  }, []);

  const testUpload = useCallback(async (): Promise<number> => {
    const dataSize = 2 * 1024 * 1024;
    const data = generateRandomData(dataSize);
    const speeds: number[] = [];
    
    const uploadData = async (endpoint: string, index: number): Promise<number> => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", endpoint);
        
        const start = performance.now();
        
        xhr.upload.onprogress = () => {
          const elapsed = (performance.now() - start) / 1000;
          if (elapsed > 0) {
            const speed = (dataSize * 8) / elapsed / 1000000;
            setCurrentSpeed(speed);
            speeds[index] = speed;
            setSpeedHistory(prev => [...prev.slice(-30), speed]);
          }
        };
        
        xhr.onload = () => {
          const elapsed = (performance.now() - start) / 1000;
          const speed = elapsed > 0 ? (dataSize * 8) / elapsed / 1000000 : 0;
          speeds[index] = speed;
          resolve(speed);
        };
        
        xhr.onerror = () => resolve(0);
        xhr.send(data);
      });
    };

    const streams = 2;
    const promises: Promise<number>[] = [];
    
    for (let i = 0; i < streams; i++) {
      promises.push(uploadData(UPLOAD_ENDPOINTS[i % UPLOAD_ENDPOINTS.length], i));
    }
    
    await Promise.all(promises);
    
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    return avgSpeed || 0;
  }, []);

  const startTest = useCallback(async () => {
    setStatus("testing");
    setPhase("ping");
    setProgress(0);
    setCurrentSpeed(0);
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
