"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";
import styles from "./Graph.module.css";

interface GraphProps {
  data: { x: number; y: number }[];
  xLimits?: { min: number; max: number };
  yLimits?: { min: number; max: number };
  title?: string;
  tickCount?: number;
}

const Graph = ({
  data,
  xLimits = undefined,
  yLimits = undefined,
  title,
  tickCount = 5,
}: GraphProps) => {
  const reduceData = (originalData: { x: number; y: number }[]) => {
    const segments = 300;
    if (originalData.length <= segments) {
      const computedXLimits = {
        min: Math.min(...originalData.map((point) => point.x)),
        max: Math.max(...originalData.map((point) => point.x)),
      };

      const computedYLimits = {
        min: 0,
        max: Math.max(...originalData.map((point) => point.y)),
      };

      return { formattedData: originalData, computedXLimits, computedYLimits };
    }

    const chunkSize = originalData.length / segments;
    const reduced: { x: number; y: number }[] = [];

    for (let i = 0; i < segments; i++) {
      const start = Math.floor(i * chunkSize);
      let end = Math.floor((i + 1) * chunkSize);
      if (start >= originalData.length) break;
      if (end >= originalData.length) end = originalData.length - 1;

      let avgX = 0;
      let avgY = 0;
      for (let j = start; j <= end; j++) {
        avgX += originalData[j].x;
        avgY += originalData[j].y;
      }

      avgX /= end - start + 1;
      avgY /= end - start + 1;
      reduced.push({ x: avgX, y: avgY });
    }

    const computedXLimits = {
      min: Math.min(...reduced.map((point) => point.x)),
      max: Math.max(...reduced.map((point) => point.x)),
    };

    const computedYLimits = {
      min: 0,
      max: Math.max(...reduced.map((point) => point.y)),
    };

    return { formattedData: reduced, computedXLimits, computedYLimits };
  };

  const { formattedData, computedXLimits, computedYLimits } = reduceData(data);

  const finalXLimits = xLimits || computedXLimits || { min: 0, max: 1 };
  const finalYLimits = yLimits || computedYLimits || { min: 0, max: 1 };

  const timeRange = finalXLimits.max - finalXLimits.min;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange < 2 * 60 * 1000) {
      return `${date.getMinutes().toString().padStart(2, "0")}:${date
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;
    }
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const formatTooltipX = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  const generateTicks = (min: number, max: number, count: number) => {
    if (min >= max - 1) {
      if (min - 1 >= 0) min = min - 1;
      max = max + 1;
    }
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) => Math.round(min + i * step));
  };

  const xTicks = Array.from(
    new Set(generateTicks(finalXLimits.min, finalXLimits.max, tickCount))
  );
  const yTicks = Array.from(
    new Set(generateTicks(finalYLimits.min, finalYLimits.max, tickCount))
  );

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <Card className={styles.tooltipCard}>
          <CardContent className={styles.tooltipContent}>
            <Typography variant="body2" className={styles.tooltipText}>
              {formatTooltipX(label as number)}
            </Typography>
            <Typography variant="h6" className={styles.tooltipValue}>
              {payload[0].value}
            </Typography>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <div className={styles.graphWrapper}>
      <div className={styles.graphContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="x"
              domain={[finalXLimits.min, finalXLimits.max]}
              type="number"
              tickFormatter={formatTime}
              tick={{ fill: "white" }}
              ticks={xTicks}
              interval={0}
            />
            <YAxis
              domain={[finalYLimits.min, finalYLimits.max]}
              type="number"
              tick={{ fill: "white" }}
              width={30}
              ticks={yTicks}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
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
