import Graph from "@/components/graph";
import styles from "./page.module.css";

const graphData = [
  {
    title: "CPU Core 1",
    data: [
      { x: 1, y: 1 },
      { x: 2, y: 1.2 },
      { x: 3, y: 3 },
      { x: 4, y: 0.8 },
    ],
  },
  {
    title: "CPU Core 2",
    data: [
      { x: 1, y: 0.5 },
      { x: 2, y: 1.5 },
      { x: 3, y: 2.5 },
      { x: 4, y: 1 },
    ],
  },
  {
    title: "CPU Core 3",
    data: [
      { x: 1, y: 0.8 },
      { x: 2, y: 1.7 },
      { x: 3, y: 2.2 },
      { x: 4, y: 1.3 },
    ],
  },
  {
    title: "CPU Core 4",
    data: [
      { x: 1, y: 1.1 },
      { x: 2, y: 2.3 },
      { x: 3, y: 3.2 },
      { x: 4, y: 1.4 },
    ],
  },
];

const xTags = ["1", "2", "3", "4"];
const yTags = ["0", "1", "2", "3", "4"];
const xLimits = { min: 1, max: 4 };
const yLimits = { min: 0, max: 4 };

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.row}>
        <div className={styles.graphContainer}>
          {graphData.map((graph, index) => (
            <Graph
              key={index}
              data={graph.data}
              xTags={xTags}
              yTags={yTags}
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
