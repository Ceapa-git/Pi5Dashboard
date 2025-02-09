"use client";

import { useEffect, useState } from "react";
import { useTimeRange } from "@/context/TimeRangeContext";
import Graph from "@/components/graph/Graph";
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
  const [graphData, setGraphData] = useState<
    { title: string; data: { x: number; y: number }[] }[]
  >([]);

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

      setGraphData(cpuData);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, REFRESH_INTERVALS[timeRange]);
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div className={styles.home}>
      <div className={styles.row}>
        <div className={styles.graphContainer}>
          {graphData.map((graph, index) => (
            <Graph
              key={index}
              data={graph.data}
              xLimits={{
                min:
                  graph.data.length > 0
                    ? graph.data[0].x
                    : Date.now() - 24 * 3600 * 1000,
                max:
                  graph.data.length > 0
                    ? graph.data[graph.data.length - 1].x
                    : Date.now(),
              }}
              yLimits={{ min: 0, max: 100 }}
              title={graph.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
