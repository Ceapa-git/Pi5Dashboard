import { useEffect, useState } from "react";
import "./App.css";
import Chart from "./components/Chart";
import type { ChartInput } from "./components/Chart";
import ContentWrapper from "./components/ContentWrapper";
import InfoStats from "./components/InfoStats";
import type { InfoItem } from "./components/InfoStats";


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
export type ThermalData = {
  temperatures: Record<string, number[]>;
  fan_rpm: number;
};

/* ---------- Power ---------- */
export type PowerRail = {
  rail: string;
  voltage: number;
  current: number;
  power: number;
};

export type PowerData = {
  total_power: number;
  rails: PowerRail[];
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
  power: PowerData;
};

/* ---------- Root Sample ---------- */
export type MetricSample = {
  ts: Timestamp;
  data: MetricData;
};


export default function App() {
  const MIN_SECONDS = 60;
  const MAX_SECONDS = 24 * 3600;
  const [interval, setIntervalSeconds] = useState<number>(MIN_SECONDS);
  const [metrics, setMetrics] = useState<MetricSample[]>([]);

  const emptyCharInput: ChartInput = {
    x: "",
    y: "",
    yMax: 0,
    title: "",
    timestamps: [],
    series: [],
  };

  const [systemStats, setSystemStats] = useState<InfoItem[]>([]);

  const [cpuUsage, setCpuUsage] = useState<ChartInput>(emptyCharInput);
  const [cpuFrequency, setCpuFrequency] = useState<ChartInput>(emptyCharInput);
  const [memoryUsage, setMemoryUsage] = useState<ChartInput>(emptyCharInput);
  const [diskUsage, setDiskUsage] = useState<ChartInput[]>([]);
  const [diskReadRate, setDiskReadRate] = useState<ChartInput>(emptyCharInput);
  const [diskWriteRate, setDiskWriteRate] = useState<ChartInput>(emptyCharInput);
  const [netBytesRate, setNetBytesRate] = useState<ChartInput>(emptyCharInput);
  const [netPacketsRate, setNetPacketsRate] = useState<ChartInput>(emptyCharInput);
  const [temps, setTemps] = useState<ChartInput[]>([]);
  const [fanRpm, setFanRpm] = useState<ChartInput>(emptyCharInput);
  const [railPowers, setRailPowers] = useState<ChartInput>(emptyCharInput);
  const [totalPower, setTotalPower] = useState<ChartInput>(emptyCharInput);

  async function fetchStats() {
    try {
      const res = await fetch(`/api/stats/${interval}`);
      const samples = (await res.json()) as MetricSample[];
      setMetrics(samples);
    }
    catch (_e) {
    }
  };

  function delta(curr?: number, prev?: number) {
    if (curr == null || prev == null) return 0;
    const d = curr - prev;
    return d >= 0 ? d : 0;
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [interval]);

  useEffect(() => {
    if (metrics.length === 0)
      return
    const last = metrics[metrics.length - 1].data;
    setSystemStats([
      { label: "Uptime", value: last.uptime.human },
      { label: "Load 1m", value: last.load_avg["1m"].toFixed(2) },
      { label: "Load 5m", value: last.load_avg["5m"].toFixed(2) },
      { label: "Load 15m", value: last.load_avg["15m"].toFixed(2) },
    ])

    const lastBin = metrics[metrics.length - 1].ts;
    const firstBin = lastBin - interval + 1;

    const bins = [...Array(interval).keys()].map((x) => x + firstBin);
    const byBin = new Map<number, MetricSample>();

    for (const s of metrics) {
      byBin.set(s.ts, s);
    }
    const lastSample = byBin.get(lastBin)!.data;

    setCpuUsage({
      y: "Percent",
      yMax: 100,
      title: "Cpu Usage (per core)",
      timestamps: bins,
      series: lastSample.cpu.usage_per_core.map((_m, i) => {
        return {
          name: `cpu${i + 1}`,
          values: bins.map((b) => byBin.get(b)?.data.cpu.usage_per_core[i] ?? 0),
        };
      }),
    });
    setCpuFrequency({
      y: "MHz",
      title: "Cpu Frequency",
      timestamps: bins,
      series: [
        {
          name: "min",
          values: bins.map((b) => byBin.get(b)?.data.cpu.freq.min ?? 0),
        },
        {
          name: "current",
          values: bins.map((b) => byBin.get(b)?.data.cpu.freq.current ?? 0),
        },
        {
          name: "max",
          values: bins.map((b) => byBin.get(b)?.data.cpu.freq.max ?? 0),
        },
      ],
    });

    setMemoryUsage({
      y: "MiB",
      yMax: 2 ** Math.ceil(Math.log2(lastSample.memory.total / (1024 ** 2))),
      title: `Memory Usage ${lastSample.memory.percent.toFixed(1)}%`,
      timestamps: bins,
      disableLegend: true,
      series: [
        {
          name: "used",
          values: bins.map((b) => (byBin.get(b)?.data.memory.used ?? 0) / (1024 ** 2)),
        },
      ],
    });

    const diskNames = Object.keys(lastSample.disk.usage ?? {}).sort();
    const diskCharts: ChartInput[] = diskNames.map((disk) => {
      const lastUsage = lastSample.disk.usage[disk];
      const totalGiB = (lastUsage?.total ?? 0) / (1024 ** 3);

      return {
        y: "GiB",
        yMax: totalGiB,
        title: `${disk} Usage ${lastUsage.percent.toFixed(1)}%`,
        timestamps: bins,
        disableLegend: true,
        series: [
          {
            name: "used",
            values: bins.map((b) => {
              const usedBytes = byBin.get(b)?.data.disk.usage?.[disk]?.used ?? 0;
              return usedBytes / (1024 ** 3);
            }),
          },
        ],
      };
    });
    setDiskUsage(diskCharts);
    setDiskReadRate({
      y: "KiB/s",
      title: "Disk Read Rate (per disk)",
      timestamps: bins,
      series: diskNames.map((disk) => ({
        name: disk,
        values: bins.map((b) => {
          const curr = byBin.get(b)?.data.disk.io_total[disk].read_bytes;
          const prev = byBin.get(b - 1)?.data.disk.io_total[disk].read_bytes;
          return delta(curr, prev) / 1024;
        }).map((v, i, arr) => {
          if (i === 0) return arr[1];
          return v;
        }),
      })),
    });
    setDiskWriteRate({
      y: "KiB/s",
      title: "Disk Write Rate (per disk)",
      timestamps: bins,
      series: diskNames.map((disk) => ({
        name: disk,
        values: bins.map((b) => {
          const curr = byBin.get(b)?.data.disk.io_total[disk].write_bytes;
          const prev = byBin.get(b - 1)?.data.disk.io_total[disk].write_bytes;
          return delta(curr, prev) / 1024;
        }).map((v, i, arr) => {
          if (i === 0) return arr[1];
          return v;
        }),
      })),
    });

    setNetBytesRate({
      y: "KiB/s",
      title: "Network Throughput",
      timestamps: bins,
      series: [
        {
          name: "sent",
          values: bins.map((b) => {
            const curr = byBin.get(b)?.data.network.total.total_sent;
            const prev = byBin.get(b - 1)?.data.network.total.total_sent;
            return delta(curr, prev) / 1024;
          }).map((v, i, arr) => {
            if (i === 0) return arr[1];
            return v;
          }),
        },
        {
          name: "received",
          values: bins.map((b) => {
            const curr = byBin.get(b)?.data.network.total.total_received;
            const prev = byBin.get(b - 1)?.data.network.total.total_received;
            return delta(curr, prev) / 1024;
          }).map((v, i, arr) => {
            if (i === 0) return arr[1];
            return v;
          }),
        },
      ],
    });
    setNetPacketsRate({
      y: "pkt/s",
      title: "Network Packets",
      timestamps: bins,
      series: [
        {
          name: "sent",
          values: bins.map((b) => {
            const curr = byBin.get(b)?.data.network.total.packets_sent;
            const prev = byBin.get(b - 1)?.data.network.total.packets_sent;
            return delta(curr, prev);
          }).map((v, i, arr) => {
            if (i === 0) return arr[1];
            return v;
          }),
        },
        {
          name: "received",
          values: bins.map((b) => {
            const curr = byBin.get(b)?.data.network.total.packets_received;
            const prev = byBin.get(b - 1)?.data.network.total.packets_received;
            return delta(curr, prev);
          }).map((v, i, arr) => {
            if (i === 0) return arr[1];
            return v;
          }),
        },
      ],
    });

    const tempNames = Object.keys(lastSample.thermal.temperatures ?? {}).sort();
    const charts: ChartInput[] = tempNames.map((name) => {
      const sensorCount = (lastSample.thermal.temperatures[name]?.length ?? 0);
      return {
        y: "°C",
        yMax: 90,
        title: `Temps: ${name}`,
        timestamps: bins,
        disableLegend: true,
        series: [...Array(sensorCount).keys()].map((i) => ({
          name: `sensor ${i + 1}`,
          values: bins.map((b) => {
            const v = byBin.get(b)?.data.thermal.temperatures?.[name]?.[i];
            return typeof v === "number" ? v : 0;
          }),
        })),
      };
    });
    setTemps(charts);
    setFanRpm({
      y: "RPM",
      title: "Fan Speed",
      timestamps: bins,
      disableLegend: true,
      series: [
        {
          name: "speed",
          values: bins.map((b) => {
            return byBin.get(b)?.data.thermal.fan_rpm ?? 0;
          }),
        },
      ],
    });

    const railNames = (lastSample.power.rails ?? []).map((r) => r.rail);
    const getRailPower = (b: number, rail: string) => {
      const rails = byBin.get(b)?.data.power.rails ?? [];
      const r = rails.find((x) => x.rail === rail);
      return r?.power ?? 0;
    };
    setRailPowers({
      y: "W",
      title: "Power Rails (W)",
      timestamps: bins,
      series: railNames.map((rail) => ({
        name: rail,
        values: bins.map((b) => getRailPower(b, rail)),
      })),
    });
    setTotalPower({
      y: "W",
      title: "Total Power (W)",
      timestamps: bins,
      disableLegend: true,
      series: [
        {
          name: "total",
          values: bins.map((b) => byBin.get(b)?.data.power.total_power ?? 0),
        },
      ],
    });
  }, [metrics]);

  return (
    <div className="app">
      <h1>Pi5 Dashboard</h1>
      <div className="toolbar">
        <label>Window</label>

        <div className="hm-picker">
          <input
            type="number"
            min={0}
            max={24}
            value={Math.floor(interval / 3600)}
            onChange={(e) => {
              const h = Number(e.target.value);
              const m = Math.floor((interval % 3600) / 60);
              setIntervalSeconds(
                Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, h * 3600 + m * 60))
              );
            }}
          />
          <span>:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={Math.floor((interval % 3600) / 60)}
            onChange={(e) => {
              const m = Number(e.target.value);
              const h = Math.floor(interval / 3600);
              setIntervalSeconds(
                Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, h * 3600 + m * 60))
              );
            }}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <ContentWrapper>
          <InfoStats title="System Info" items={systemStats} />
        </ContentWrapper>
        <ContentWrapper span="2">
          <Chart data={cpuUsage} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={cpuFrequency} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={memoryUsage} />
        </ContentWrapper>

        {diskUsage.map((c) => (
          <ContentWrapper key={c.title}>
            <Chart data={c} />
          </ContentWrapper>
        ))}

        <ContentWrapper>
          <Chart data={diskReadRate} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={diskWriteRate} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={netBytesRate} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={netPacketsRate} />
        </ContentWrapper>

        {temps.map((c) => (
          <ContentWrapper key={c.title}>
            <Chart data={c} />
          </ContentWrapper>
        ))}

        <ContentWrapper>
          <Chart data={fanRpm} />
        </ContentWrapper>

        <ContentWrapper>
          <Chart data={railPowers} />
        </ContentWrapper>
        <ContentWrapper>
          <Chart data={totalPower} />
        </ContentWrapper>
      </div>
    </div>
  )
}

