"use client";

import { useEffect, useState } from "react";
import { Globe, Network, MapPin, Wifi, Signal, Clock } from "lucide-react";

interface ServerInfoData {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code: string;
  isp: string;
  org: string;
  asn: string;
  timezone: string;
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  delay: string;
}

function InfoItem({ icon: Icon, label, value, color, delay }: InfoItemProps) {
  return (
    <div 
      className={`flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 opacity-0 animate-fade-in-up ${delay}`}
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
        <Icon className={`w-4 h-4 ${color.replace('from-', '').replace('to-', '')}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-200 truncate">{value}</p>
      </div>
    </div>
  );
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
          region: data.region || "Unknown",
          country: data.country_name || "Unknown",
          country_code: data.country_code || "XX",
          isp: data.org || data.isp || "Unknown",
          org: data.org || "",
          asn: data.asn || "Unknown",
          timezone: data.timezone || "Unknown"
        });
        setLoading(false);
      })
      .catch(() => {
        setInfo({
          ip: "Unable to detect",
          city: "Unknown",
          region: "Unknown",
          country: "Unknown",
          country_code: "XX",
          isp: "Unknown",
          org: "",
          asn: "Unknown",
          timezone: "Unknown"
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-700 rounded-xl"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-32"></div>
              <div className="h-3 bg-gray-700 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
          <Globe className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Network Info</h3>
          <p className="text-xs text-gray-500">Your connection details</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-medium">Connected</span>
        </div>
      </div>

      {/* Grid of info */}
      <div className="grid grid-cols-2 gap-3 relative">
        <InfoItem 
          icon={Network} 
          label="IP Address" 
          value={info?.ip || "Unknown"} 
          color="from-emerald-400 to-emerald-600"
          delay="stagger-1"
        />
        <InfoItem 
          icon={MapPin} 
          label="Location" 
          value={`${info?.city}, ${info?.region}`} 
          color="from-cyan-400 to-cyan-600"
          delay="stagger-2"
        />
        <InfoItem 
          icon={Globe} 
          label="Country" 
          value={info?.country || "Unknown"} 
          color="from-blue-400 to-blue-600"
          delay="stagger-3"
        />
        <InfoItem 
          icon={Wifi} 
          label="ISP" 
          value={info?.isp?.split(',')[0] || "Unknown"} 
          color="from-purple-400 to-purple-600"
          delay="stagger-4"
        />
        <InfoItem 
          icon={Signal} 
          label="ASN" 
          value={info?.asn || "Unknown"} 
          color="from-amber-400 to-amber-600"
          delay="stagger-5"
        />
        <InfoItem 
          icon={Clock} 
          label="Timezone" 
          value={info?.timezone || "Unknown"} 
          color="from-rose-400 to-rose-600"
          delay="stagger-1"
        />
      </div>
    </div>
  );
}
