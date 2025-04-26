"use client";

import { useCallback, useEffect, useState } from "react";
import { useTimeRange } from "@/context/TimeRangeContext";
import Graph from "@/components/graph";
import AdaptiveGraphContainer from "@/components/adaptiveGraphContainer";
import styles from "./page.module.css";

const API_URL = "https://pidashboard.ceapagames.com/api/stats";

const REFRESH_INTERVALS: Record<string, number> = {
  "10s": 5000,
  "30s": 5000,
  "60s": 10000,
  "60m": 30000,
  "24h": 60000,
};

interface Stat {
  cpu_usage: number[];
  disk_io: {
    read: number;
    read_count: number;
    write: number;
    write_count: number;
  };
  disk_usage: {
    free: number;
    percent: number;
    total: number;
    used: number;
  };
  fan_speed: number;
  memory_usage: {
    free: number;
    percent: number;
    total: number;
    used: number;
  };
  network_traffic: {
    packets_received: number;
    packets_sent: number;
    total_received: number;
    total_sent: number;
  };
  temperature: number;
  timestamp: number;
}

export default function Home() {
  const { timeRange } = useTimeRange();
  const [cpuGraphs, setCpuGraphs] = useState<
    { title: string; data: { x: number; y: number }[] }[]
  >([]);
  const [memoryData, setMemoryData] = useState<{ x: number; y: number }[]>([]);
  const [diskIoData, setDiskIoData] = useState<{ x: number; y: number }[]>([]);
  const [temperatureData, setTemperatureData] = useState<
    { x: number; y: number }[]
  >([]);
  const [fanData, setFanData] = useState<{ x: number; y: number }[]>([]);
  const [networkData, setNetworkData] = useState<{ x: number; y: number }[]>(
    [],
  );
  const [diskUsageData, setDiskUsageData] = useState<
    { x: number; y: number }[]
  >([]);

  const [memoryMaxGB, setMemoryMaxGB] = useState<number>(0);
  const [diskUsageMaxGB, setDiskUsageMaxGB] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}?view=${timeRange}`);
      const stats = await response.json();
      if (!stats.length) return;

      stats.sort((a: Stat, b: Stat) => a.timestamp - b.timestamp);

      const ensureNonNegative = (value: number) => (value < 0 ? 0 : value);

      const cpuData = Array.from({ length: 4 }, (_, coreIndex) => ({
        title: `CPU Core ${coreIndex + 1}`,
        data: stats.map((stat: Stat) => ({
          x: stat.timestamp * 1000,
          y: ensureNonNegative(stat.cpu_usage[coreIndex] ?? 0),
        })),
      }));

      let maxMemGB = 0;
      const memData = stats.map((stat: Stat) => {
        const usedGB = ensureNonNegative(stat.memory_usage.used / 1073741824);
        const totalGB = ensureNonNegative(stat.memory_usage.total / 1073741824);
        if (totalGB > maxMemGB) maxMemGB = totalGB;
        return { x: stat.timestamp * 1000, y: usedGB };
      });

      const ioData = [];
      for (let i = 1; i < stats.length; i++) {
        const dt = stats[i].timestamp - stats[i - 1].timestamp;
        if (dt <= 0) continue;
        const readDiff = ensureNonNegative(
          stats[i].disk_io.read - stats[i - 1].disk_io.read,
        );
        const writeDiff = ensureNonNegative(
          stats[i].disk_io.write - stats[i - 1].disk_io.write,
        );
        const totalBytes = readDiff + writeDiff;
        const rateMBs = totalBytes / dt / (1024 * 1024);
        ioData.push({ x: stats[i].timestamp * 1000, y: rateMBs });
      }

      const tempData = stats.map((stat: Stat) => ({
        x: stat.timestamp * 1000,
        y: ensureNonNegative(stat.temperature),
      }));

      const fData = stats.map((stat: Stat) => {
        const fanSpeed = ensureNonNegative(stat.fan_speed);
        return { x: stat.timestamp * 1000, y: fanSpeed };
      });

      const netData = [];
      for (let i = 1; i < stats.length; i++) {
        const dt = stats[i].timestamp - stats[i - 1].timestamp;
        if (dt <= 0) continue;
        const rxDiff = ensureNonNegative(
          stats[i].network_traffic.total_received -
            stats[i - 1].network_traffic.total_received,
        );
        const txDiff = ensureNonNegative(
          stats[i].network_traffic.total_sent -
            stats[i - 1].network_traffic.total_sent,
        );
        const totalBytes = rxDiff + txDiff;
        const rateMBs = totalBytes / dt / (1024 * 1024);
        netData.push({ x: stats[i].timestamp * 1000, y: rateMBs });
      }

      let dMaxGB = 0;
      const diskData = stats.map((stat: Stat) => {
        const usedGB = ensureNonNegative(stat.disk_usage.used / 1073741824);
        const totalGB = ensureNonNegative(stat.disk_usage.total / 1073741824);
        if (totalGB > dMaxGB) dMaxGB = totalGB;
        return { x: stat.timestamp * 1000, y: usedGB };
      });

      setCpuGraphs(cpuData);
      setMemoryData(memData);
      setMemoryMaxGB(maxMemGB);
      setDiskIoData(ioData);
      setTemperatureData(tempData);
      setFanData(fData);
      setNetworkData(netData);
      setDiskUsageData(diskData);
      setDiskUsageMaxGB(dMaxGB);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS[timeRange]);
    return () => clearInterval(interval);
  }, [timeRange, fetchData]);

  return (
    <>
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className={styles.home}>
          <div className={styles.row}>
            <AdaptiveGraphContainer>
              {cpuGraphs.map((graph, index) => (
                <Graph
                  key={index}
                  data={graph.data}
                  xLimits={{
                    min: graph.data.length > 0 ? graph.data[0].x : Date.now(),
                    max:
                      graph.data.length > 0
                        ? graph.data[graph.data.length - 1].x
                        : Date.now(),
                  }}
                  yLimits={{ min: 0, max: 100 }}
                  title={graph.title}
                />
              ))}
            </AdaptiveGraphContainer>
            <AdaptiveGraphContainer>
              <Graph
                data={memoryData}
                xLimits={{
                  min: memoryData.length > 0 ? memoryData[0].x : Date.now(),
                  max:
                    memoryData.length > 0
                      ? memoryData[memoryData.length - 1].x
                      : Date.now(),
                }}
                yLimits={{ min: 0, max: memoryMaxGB }}
                title="Memory Usage (GB)"
              />
            </AdaptiveGraphContainer>
            <AdaptiveGraphContainer>
              <Graph
                data={diskIoData}
                xLimits={{
                  min: diskIoData.length > 0 ? diskIoData[0].x : Date.now(),
                  max:
                    diskIoData.length > 0
                      ? diskIoData[diskIoData.length - 1].x
                      : Date.now(),
                }}
                title="Disk IO (MB/s)"
              />
            </AdaptiveGraphContainer>
          </div>
          <div className={styles.row}>
            <AdaptiveGraphContainer>
              <Graph
                data={temperatureData}
                xLimits={{
                  min:
                    temperatureData.length > 0
                      ? temperatureData[0].x
                      : Date.now(),
                  max:
                    temperatureData.length > 0
                      ? temperatureData[temperatureData.length - 1].x
                      : Date.now(),
                }}
                yLimits={{ min: 0, max: 90 }}
                title="Temperature (°C)"
              />
              <Graph
                data={fanData}
                xLimits={{
                  min: fanData.length > 0 ? fanData[0].x : Date.now(),
                  max:
                    fanData.length > 0
                      ? fanData[fanData.length - 1].x
                      : Date.now(),
                }}
                title="Fan Speed (RPM)"
              />
            </AdaptiveGraphContainer>
            <AdaptiveGraphContainer>
              <Graph
                data={networkData}
                xLimits={{
                  min: networkData.length > 0 ? networkData[0].x : Date.now(),
                  max:
                    networkData.length > 0
                      ? networkData[networkData.length - 1].x
                      : Date.now(),
                }}
                title="Network Traffic (MB/s)"
              />
            </AdaptiveGraphContainer>
            <AdaptiveGraphContainer>
              <Graph
                data={diskUsageData}
                xLimits={{
                  min:
                    diskUsageData.length > 0 ? diskUsageData[0].x : Date.now(),
                  max:
                    diskUsageData.length > 0
                      ? diskUsageData[diskUsageData.length - 1].x
                      : Date.now(),
                }}
                yLimits={{ min: 0, max: diskUsageMaxGB }}
                title="Disk Usage (GB)"
              />
            </AdaptiveGraphContainer>
          </div>
        </div>
      )}
    </>
  );
}
