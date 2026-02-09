import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";


ChartJS.register(...registerables);

export type ChartInput = {
  timestamps: string[];
  series: Array<{
    name: string;
    values: number[];
  }>;
};

type Props = {
  data: ChartInput
}

export default function Chart({ data }: Props) {
  const chartData: ChartData<"line", number[], string> = {
    labels: data.timestamps,
    datasets: data.series.map((s) => ({
      label: s.name,
      data: s.values,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 0,
    }))
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        title: {
          display: true,
          text: "Value",
        },
      },
    }
  }

  return (
    <div style={{ height: 400 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
