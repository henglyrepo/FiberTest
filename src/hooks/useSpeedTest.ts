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

const UPLOAD_ENDPOINT = "https://httpbin.org/post";

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
  const isRunningRef = useRef(false);

  const measurePing = useCallback(async (): Promise<{ ping: number; jitter: number }> => {
    const times: number[] = [];
    const testUrl = "https://speed.cloudflare.com/__down?bytes=0";
    
    for (let i = 0; i < 5; i++) {
      if (!isRunningRef.current) break;
      const start = performance.now();
      try {
        await fetch(testUrl, { 
          method: "HEAD",
          cache: "no-store",
          signal: abortControllerRef.current?.signal 
        });
        const end = performance.now();
        times.push(end - start);
        if (i < 4) await new Promise(r => setTimeout(r, 100));
      } catch {
        times.push(999);
      }
    }
    
    const validTimes = times.filter(t => t < 500);
    if (validTimes.length === 0) return { ping: 0, jitter: 0 };
    
    const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    
    let jitter = 0;
    if (validTimes.length > 1) {
      const differences = validTimes.slice(1).map((t: number, i: number) => Math.abs(validTimes[i + 1] - t));
      jitter = differences.reduce((a, b) => a + b, 0) / differences.length;
    }
    
    return { ping: avg, jitter };
  }, []);

  const testDownload = useCallback(async (): Promise<number> => {
    isRunningRef.current = true;
    let totalBytes = 0;
    const speeds: number[] = [];
    const startTime = performance.now();
    const timeoutMs = 30000;

    const downloadFile = (url: string): Promise<number> => new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.timeout = timeoutMs;
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response?.size || 0);
        } else {
          resolve(0);
        }
      };
      
      xhr.onerror = () => resolve(0);
      xhr.ontimeout = () => resolve(0);
      
      try {
        xhr.send();
      } catch {
        resolve(0);
      }
    });

    let lastUpdate = 0;

    for (let i = 0; i < CDN_ENDPOINTS.length; i++) {
      if (!isRunningRef.current) break;
      
      const bytes = await downloadFile(CDN_ENDPOINTS[i]);
      totalBytes += bytes;

      const elapsed = (performance.now() - startTime) / 1000;
      if (elapsed > 0) {
        const speed = (totalBytes / elapsed) * 8 / 1000000;
        speeds.push(speed);

        if (elapsed - lastUpdate > 0.2) {
          setCurrentSpeed(speed);
          setSpeedHistory(prev => [...prev.slice(-30), speed]);
          lastUpdate = elapsed;
        }
      }

      await new Promise(r => setTimeout(r, 300));
    }

    const finalElapsed = (performance.now() - startTime) / 1000;
    const finalSpeed = finalElapsed > 0 ? (totalBytes / finalElapsed) * 8 / 1000000 : 0;

    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : finalSpeed;

    const result = Math.max(finalSpeed, avgSpeed);
    setCurrentSpeed(result);
    setSpeedHistory(prev => [...prev.slice(-30), result]);

    return result;
  }, []);

  const testUpload = useCallback(async (): Promise<number> => {
    isRunningRef.current = true;
    const dataSize = 2 * 1024 * 1024;
    const data = generateRandomData(dataSize);
    const startTime = performance.now();
    const timeoutMs = 30000;

    const uploadFile = (): Promise<number> => new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", UPLOAD_ENDPOINT);
      xhr.timeout = timeoutMs;
      
      let lastUpdate = 0;
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed > 0.1 && elapsed - lastUpdate > 0.1) {
            const speed = (event.loaded / elapsed) * 8 / 1000000;
            setCurrentSpeed(speed);
            setSpeedHistory(prev => [...prev.slice(-30), speed]);
            lastUpdate = elapsed;
          }
        }
      };
      
      xhr.onload = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const speed = elapsed > 0 ? (dataSize / elapsed) * 8 / 1000000 : 0;
        resolve(speed);
      };
      
      xhr.onerror = () => resolve(0);
      xhr.ontimeout = () => resolve(0);
      
      try {
        xhr.send(data);
      } catch {
        resolve(0);
      }
    });

    const speed = await uploadFile();
    
    const elapsed = (performance.now() - startTime) / 1000;
    const finalSpeed = elapsed > 0 ? (dataSize / elapsed) * 8 / 1000000 : speed;

    const result = Math.max(finalSpeed, speed);
    setCurrentSpeed(result);
    setSpeedHistory(prev => [...prev.slice(-30), result]);

    return result;
  }, []);

  const startTest = useCallback(async () => {
    isRunningRef.current = true;
    setStatus("testing");
    setPhase("ping");
    setProgress(0);
    setCurrentSpeed(0);
    setSpeedHistory([]);
    abortControllerRef.current = new AbortController();

    try {
      setPhase("ping");
      const { ping, jitter } = await measurePing();
      if (!isRunningRef.current) return;
      setResults(prev => ({ ...prev, ping: Math.round(ping), jitter: Math.round(jitter * 100) / 100 }));
      setProgress(100);

      setPhase("download");
      setProgress(0);
      const downloadSpeed = await testDownload();
      if (!isRunningRef.current) return;
      setResults(prev => ({ ...prev, download: Math.round(downloadSpeed) }));
      setProgress(100);

      setPhase("upload");
      setProgress(0);
      const uploadSpeed = await testUpload();
      if (!isRunningRef.current) return;
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
    isRunningRef.current = false;
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
