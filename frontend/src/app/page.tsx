"use client";

import { useEffect, useState } from "react";
import { useTimeRange } from "@/context/TimeRangeContext";
import Graph from "@/components/graph";
import AdaptiveGraphContainer from "@/components/adaptiveGraphContainer";
import styles from "./page.module.css";

const API_URL = "http://192.168.1.140:5000/stats";

const REFRESH_INTERVALS: Record<string, number> = {
  "10s": 5000,
  "30s": 5000,
  "60s": 10000,
  "60m": 30000,
  "24h": 60000,
};

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
    []
  );
  const [diskUsageData, setDiskUsageData] = useState<
    { x: number; y: number }[]
  >([]);

  const [memoryMaxGB, setMemoryMaxGB] = useState<number>(0);
  const [diskIoMax, setDiskIoMax] = useState<number>(0);
  const [fanMax, setFanMax] = useState<number>(0);
  const [networkMax, setNetworkMax] = useState<number>(0);
  const [diskUsageMaxGB, setDiskUsageMaxGB] = useState<number>(0);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}?view=${timeRange}`);
      const stats = await response.json();
      if (!stats.length) return;

      const minTimestamp =
        Math.min(...stats.map((s: any) => s.timestamp)) * 1000;
      const maxTimestamp =
        Math.max(...stats.map((s: any) => s.timestamp)) * 1000;

      const cpuData = Array.from({ length: 4 }, (_, coreIndex) => ({
        title: `CPU Core ${coreIndex + 1}`,
        data: stats.map((stat: any) => ({
          x: stat.timestamp * 1000,
          y: stat.cpu_usage[coreIndex] ?? 0,
        })),
      }));

      const memData: { x: number; y: number }[] = [];
      let maxMemGB = 0;
      for (const stat of stats) {
        const usedGB = stat.memory_usage.used / 1073741824;
        const totalGB = stat.memory_usage.total / 1073741824;
        if (totalGB > maxMemGB) maxMemGB = totalGB;
        memData.push({
          x: stat.timestamp * 1000,
          y: usedGB,
        });
      }

      const ioData: { x: number; y: number }[] = [];
      let maxIo = 0;
      for (let i = 1; i < stats.length; i++) {
        const dt = stats[i].timestamp - stats[i - 1].timestamp;
        if (dt <= 0) continue;
        const readDiff = stats[i].disk_io.read - stats[i - 1].disk_io.read;
        const writeDiff = stats[i].disk_io.write - stats[i - 1].disk_io.write;
        const totalBytes = readDiff + writeDiff;
        const rateMBs = totalBytes / dt / (1024 * 1024);
        if (rateMBs > maxIo) maxIo = rateMBs;
        ioData.push({
          x: stats[i].timestamp * 1000,
          y: rateMBs,
        });
      }

      const tempData: { x: number; y: number }[] = stats.map((stat: any) => ({
        x: stat.timestamp * 1000,
        y: stat.temperature,
      }));

      const fData: { x: number; y: number }[] = [];
      let fMax = 0;
      for (const stat of stats) {
        if (stat.fan_speed > fMax) fMax = stat.fan_speed;
        fData.push({
          x: stat.timestamp * 1000,
          y: stat.fan_speed,
        });
      }

      const netData: { x: number; y: number }[] = [];
      let nMax = 0;
      for (let i = 1; i < stats.length; i++) {
        const dt = stats[i].timestamp - stats[i - 1].timestamp;
        if (dt <= 0) continue;
        const rxDiff =
          stats[i].network_traffic.total_received -
          stats[i - 1].network_traffic.total_received;
        const txDiff =
          stats[i].network_traffic.total_sent -
          stats[i - 1].network_traffic.total_sent;
        const totalBytes = rxDiff + txDiff;
        const rateMBs = totalBytes / dt / (1024 * 1024);
        if (rateMBs > nMax) nMax = rateMBs;
        netData.push({
          x: stats[i].timestamp * 1000,
          y: rateMBs,
        });
      }

      const diskData: { x: number; y: number }[] = [];
      let dMaxGB = 0;
      for (const stat of stats) {
        const usedGB = stat.disk_usage.used / 1073741824;
        const totalGB = stat.disk_usage.total / 1073741824;
        if (totalGB > dMaxGB) dMaxGB = totalGB;
        diskData.push({
          x: stat.timestamp * 1000,
          y: usedGB,
        });
      }

      setCpuGraphs(cpuData);
      setMemoryData(memData);
      setMemoryMaxGB(maxMemGB);
      setDiskIoData(ioData);
      setDiskIoMax(maxIo);
      setTemperatureData(tempData);
      setFanData(fData);
      setFanMax(fMax);
      setNetworkData(netData);
      setNetworkMax(nMax);
      setDiskUsageData(diskData);
      setDiskUsageMaxGB(dMaxGB);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS[timeRange]);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
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
            yLimits={{ min: 0, max: diskIoMax }}
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
                temperatureData.length > 0 ? temperatureData[0].x : Date.now(),
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
                fanData.length > 0 ? fanData[fanData.length - 1].x : Date.now(),
            }}
            yLimits={{ min: 0, max: fanMax }}
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
            yLimits={{ min: 0, max: networkMax }}
            title="Network Traffic (MB/s)"
          />
        </AdaptiveGraphContainer>
        <AdaptiveGraphContainer>
          <Graph
            data={diskUsageData}
            xLimits={{
              min: diskUsageData.length > 0 ? diskUsageData[0].x : Date.now(),
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
  );
}
