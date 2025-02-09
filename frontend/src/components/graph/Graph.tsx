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
  xTags: string[];
  yTags: string[];
  xLimits: { min: number; max: number };
  yLimits: { min: number; max: number };
  title?: string;
}

const Graph = ({ data, xTags, yTags, xLimits, yLimits, title }: GraphProps) => {
  const formattedData = data.map((point) => ({
    x: point.x,
    y: point.y,
  }));

  return (
    <div className={styles.graphWrapper}>
      <div className={styles.graphContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="x"
              domain={[xLimits.min, xLimits.max]}
              type="number"
              tick={{ fill: "white" }}
              allowDataOverflow
              ticks={xTags.map(Number)}
            />
            <YAxis
              domain={[yLimits.min, yLimits.max]}
              type="number"
              tick={{ fill: "white" }}
              allowDataOverflow
              ticks={yTags.map(Number)}
            />
            <Tooltip
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
