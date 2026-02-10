import type { ReactNode } from "react";
import "./ContentWrapper.css";

type Props = {
  children: ReactNode;
  span?: string;
};

export default function ContentWrapper({ children, span = "" }: Props) {
  return (
    <section className={`content-card span-${span}`}>
      {children}
    </section>
  );
}

