import Graph from "@/components/graph";
import styles from "./page.module.css";
const now = Date.now();
const oneHour = 3600 * 1000;

const graphData = [
  {
    title: "CPU Core 1",
    data: [
      { x: now - 24 * oneHour, y: 100 },
      { x: now - 3 * oneHour, y: 1 },
      { x: now - 2 * oneHour, y: 1.5 },
      { x: now - oneHour, y: 3 },
      { x: now, y: 2 },
    ],
  },
  {
    title: "CPU Core 2",
    data: [
      { x: now - 3 * oneHour, y: 1 },
      { x: now - 2 * oneHour, y: 1.5 },
      { x: now - oneHour, y: 3 },
      { x: now, y: 2 },
    ],
  },
  {
    title: "CPU Core 3",
    data: [
      { x: now - 3 * oneHour, y: 1 },
      { x: now - 2 * oneHour, y: 1.5 },
      { x: now - oneHour, y: 3 },
      { x: now, y: 2 },
    ],
  },
  {
    title: "CPU Core 4",
    data: [
      { x: now - 3 * oneHour, y: 1 },
      { x: now - 2 * oneHour, y: 1.5 },
      { x: now - oneHour, y: 3 },
      { x: now, y: 2 },
    ],
  },
];

const xTags = [
  now - 24 * oneHour,
  now - 3 * oneHour,
  now - 2 * oneHour,
  now - oneHour,
  now,
];
const yTags = ["0", "1", "2", "3", "4"];
const xLimits = { min: now - 24 * oneHour, max: now };
const yLimits = { min: 0, max: 100 };

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.row}>
        <div className={styles.graphContainer}>
          {graphData.map((graph, index) => (
            <Graph
              key={index}
              data={graph.data}
              xLimits={xLimits}
              yLimits={yLimits}
              title={graph.title}
            />
          ))}
        </div>
        <div className={styles.box}>memory usage</div>
        <div className={styles.box}>disk io</div>
      </div>
      <div className={styles.row}>
        <div className={styles.box}>temp+fan</div>
        <div className={styles.box}>network</div>
        <div className={styles.box}>disk usage</div>
      </div>
    </div>
  );
}
