import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";


ChartJS.register(...registerables);

export type ChartInput = {
  x?: string;
  y: string;
  yMax?: number;
  title: string;
  timestamps: number[];
  disableLegend?: boolean;
  series: Array<{
    name: string;
    values: number[];
  }>;
};

type Props = {
  data: ChartInput
}

function gradientColors(count: number) {
  const startHue = 0;
  const endHue = 340;

  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    const hue = startHue + (endHue - startHue) * t;

    return {
      border: `hsl(${hue}, 70%, 55%)`,
      background: `hsl(${hue}, 70%, 30%)`,
    };
  });
}

export default function Chart({ data }: Props) {
  const colors = gradientColors(data.series.length);

  const chartData: ChartData<"line", { x: number; y: number }[]> = {
    datasets: data.series.map((s, i) => ({
      label: s.name,
      data: data.timestamps.map((t, idx) => ({ x: t, y: s.values[idx] ?? 0 })),
      borderWidth: 2,
      tension: 0,
      pointRadius: 0,
      borderColor: colors[i].border,
      backgroundColor: colors[i].background,
    })),
  };


  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    normalized: true,
    interaction: {
      mode: "index",
      intersect: false,
      axis: "x",
    },
    plugins: {
      decimation: {
        enabled: true,
        algorithm: "lttb",
        samples: 600,
        threshold: 800,
      },

      title: {
        display: !!data.title,
        text: data.title ?? "",
      },
      legend: {
        display: !(data?.disableLegend ?? false),
        position: "top",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        min: data.timestamps[0],
        max: data.timestamps[data.timestamps.length - 1],
        title: {
          display: true,
          text: data.x ?? "Time",
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          callback: (v) => {
            const d = new Date(Number(v) * 1000);
            return d.toLocaleTimeString("en-GB", { hour12: false });
          },
          maxTicksLimit: 8,
        },
        grid: {
          display: true,
        }
      },
      y: {
        title: {
          display: true,
          text: data.y,
        },
        beginAtZero: true,
        max: data.yMax ?? (undefined),
      },
    },
  };

  return (
    <div style={{ height: 400 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
