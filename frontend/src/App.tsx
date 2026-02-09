import { useEffect, useState } from "react";
import "./App.css";
import Chart from "./components/Chart";

const API_BASE = "http://localhost:8000";

export type Timestamp = number;

/* ---------- Uptime ---------- */
export type UptimeData = {
  seconds: number;
  human: string;
};

/* ---------- Load Average ---------- */
export type LoadAverageData = {
  "1m": number;
  "5m": number;
  "15m": number;
};

/* ---------- CPU ---------- */
export type CpuFrequency = {
  current: number;
  min: number;
  max: number;
};

export type CpuData = {
  usage_per_core: number[];
  freq: CpuFrequency;
};

/* ---------- Memory ---------- */
export type MemoryData = {
  total: number;
  used: number;
  free: number;
  percent: number;
};

/* ---------- Disk ---------- */
export type DiskUsage = {
  total: number;
  used: number;
  free: number;
  percent: number;
};

export type DiskIO = {
  read_bytes: number;
  write_bytes: number;
  read_count: number;
  write_count: number;
};

export type DiskData = {
  usage: Record<string, DiskUsage>;
  io_total: Record<string, DiskIO>;
};

/* ---------- Network ---------- */
export type NetworkTotals = {
  total_sent: number;
  total_received: number;
  packets_sent: number;
  packets_received: number;
};

export type NetworkData = {
  total: NetworkTotals;
};

/* ---------- Thermal ---------- */
export type ThermalPowerRail = {
  rail: string;
  voltage: number;
  current: number;
  power: number;
};

export type ThermalPowerData = {
  total_power: number;
  rails: ThermalPowerRail[];
};

export type ThermalData = {
  temperatures: Record<string, number[]>;
  power: ThermalPowerData;
};

/* ---------- Metric Payload ---------- */
export type MetricData = {
  uptime: UptimeData;
  load_avg: LoadAverageData;
  cpu: CpuData;
  memory: MemoryData;
  disk: DiskData;
  network: NetworkData;
  thermal: ThermalData;
};

/* ---------- Root Sample ---------- */
export type MetricSample = {
  ts: Timestamp;
  data: MetricData;
};


export default function App() {
  const [interval, _changeInterval] = useState<number>(60);
  const [metrics, setMetrics] = useState<MetricSample[]>([]);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats/${interval}`);
      const samples = (await res.json()) as MetricSample[];
      setMetrics(samples);
      epochToTime(samples[0].ts);
    }
    catch (_e) {
    }
  };

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [interval]);

  function epochToTime(timestamp: number) {
    const d = new Date(timestamp * 1000);
    const time = d.toLocaleTimeString('en-GB', { hour12: false });
    return time.substring(3);
  }

  return (
    <div className="app">
      <h1>Pi5 Dashboard</h1>
      <Chart data={{
        timestamps: metrics.map((m) => (epochToTime(m.ts))),
        series: [
          {
            name: "cpu0",
            values: metrics.map((m) => m.data.cpu.usage_per_core[0]),
          },
        ],
      }} />
    </div>
  )
}

