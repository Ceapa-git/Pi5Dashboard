import { useEffect, useState } from "react";
import "./App.css";
import Chart from "./components/Chart";
import type { ChartInput } from "./components/Chart";

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

  const emptyCharInput: ChartInput = {
    x: "",
    y: "",
    yMax: 0,
    title: "",
    timestamps: [],
    series: [],
  };

  const [cpuUsageChart, setCpuUsageChart] = useState<ChartInput>(emptyCharInput);

  async function fetchStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats/${interval}`);
      const samples = (await res.json()) as MetricSample[];
      console.log(samples);
      setMetrics(samples);
    }
    catch (_e) {
    }
  };

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [interval]);

  useEffect(() => {
    if (metrics.length === 0)
      return
    const sorted = [...metrics].sort((a, b) => a.ts - b.ts)

    const lastBin = sorted[sorted.length - 1].ts;
    const firstBin = lastBin - interval + 1;

    const bins = [...Array(interval).keys()].map((x) => x + firstBin);
    const byBin = new Map<number, MetricSample>();

    for (const s of sorted) {
      byBin.set(s.ts, s);
    }
    const timestamps = bins.map((x) => epochToTime(x));

    setCpuUsageChart({
      x: "Time",
      y: "Percent",
      yMax: 100,
      title: "Cpu Usage per core",
      timestamps: timestamps,
      series: byBin.get(lastBin)!.data.cpu.usage_per_core.map((_m, i) => {
        return {
          name: `cpu${i}`,
          values: bins.map((b) => byBin.get(b)?.data.cpu.usage_per_core[i] ?? 0),
        }
      }),
    })

  }, [metrics]);

  function epochToTime(timestamp: number) {
    const d = new Date(timestamp * 1000);
    return d.toLocaleTimeString('en-GB', { hour12: false });
  }

  return (
    <div className="app">
      <h1>Pi5 Dashboard</h1>
      <Chart data={cpuUsageChart} />
    </div>
  )
}

