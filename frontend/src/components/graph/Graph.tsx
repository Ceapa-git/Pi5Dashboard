"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./Graph.module.css";

interface GraphProps {
  data: { x: number; y: number }[];
  xLimits: { min: number; max: number };
  yLimits: { min: number; max: number };
  title?: string;
  tickCount?: number;
}

const Graph = ({
  data,
  xLimits,
  yLimits,
  title,
  tickCount = 5,
}: GraphProps) => {
  const formattedData = data.map((point) => ({
    x: point.x,
    y: point.y,
  }));

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const generateTicks = (min: number, max: number, count: number) => {
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(min + i * step));
  };

  const xTicks = generateTicks(xLimits.min, xLimits.max, tickCount);
  const yTicks = generateTicks(yLimits.min, yLimits.max, tickCount);

  return (
    <div className={styles.graphWrapper}>
      <div className={styles.graphContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="x"
              domain={[xLimits.min, xLimits.max]}
              type="number"
              tickFormatter={formatTime}
              tick={{ fill: "white" }}
              ticks={xTicks}
            />
            <YAxis
              domain={[yLimits.min, yLimits.max]}
              type="number"
              tick={{ fill: "white" }}
              width={30}
              ticks={yTicks}
              interval={0}
            />
            <Tooltip
              labelFormatter={formatTime}
              contentStyle={{
                backgroundColor: "#111",
                color: "white",
                borderRadius: 5,
                border: "1px solid #333",
              }}
            />
            <Area
              type="monotone"
              dataKey="y"
              stroke="#00ff99"
              strokeWidth={2}
              fillOpacity={0.2}
              fill="#00ff99"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {title && <h3 className={styles.graphTitle}>{title}</h3>}
    </div>
  );
};

export default Graph;
