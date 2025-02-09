"use client";

import { ReactNode } from "react";
import styles from "./AdaptiveGraphContainer.module.css";

interface Props {
  children: ReactNode;
}

export default function AdaptiveGraphContainer({ children }: Props) {
  const childArray = Array.isArray(children) ? children : [children];
  const childCount = childArray.length;

  let layoutClass = "";
  switch (childCount) {
    case 1:
      layoutClass = styles.graphContainerOne;
      break;
    case 2:
      layoutClass = styles.graphContainerTwo;
      break;
    case 4:
      layoutClass = styles.graphContainerFour;
      break;
    default:
      layoutClass = styles.graphContainerFour;
      break;
  }

  return (
    <div className={`${styles.graphContainer} ${layoutClass}`}>{children}</div>
  );
}
