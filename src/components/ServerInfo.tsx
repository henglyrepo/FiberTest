"use client";

import { useEffect, useState } from "react";
import { Globe, Network, MapPin } from "lucide-react";

interface ServerInfoData {
  ip: string;
  city: string;
  country: string;
  isp: string;
  org: string;
}

export function ServerInfo() {
  const [info, setInfo] = useState<ServerInfoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        setInfo({
          ip: data.ip || "Unknown",
          city: data.city || "Unknown",
          country: data.country_name || "Unknown",
          isp: data.org || data.isp || "Unknown",
          org: data.org || ""
        });
        setLoading(false);
      })
      .catch(() => {
        setInfo({
          ip: "Unable to detect",
          city: "Unknown",
          country: "Unknown",
          isp: "Unknown",
          org: ""
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
          <div className="h-4 bg-gray-600 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-gray-400 text-xs">IP Address</p>
            <p className="text-white font-medium">{info?.ip}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-gray-400 text-xs">Location</p>
            <p className="text-white font-medium">{info?.city}, {info?.country}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-purple-400" />
          <div>
            <p className="text-gray-400 text-xs">ISP</p>
            <p className="text-white font-medium truncate">{info?.isp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
