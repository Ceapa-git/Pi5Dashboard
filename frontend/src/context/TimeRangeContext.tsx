"use client";

import { createContext, useContext, useState } from "react";

const TimeRangeContext = createContext<{
  timeRange: string;
  setTimeRange: (value: string) => void;
} | null>(null);

export const TimeRangeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [timeRange, setTimeRange] = useState("10s");

  return (
    <TimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
      {children}
    </TimeRangeContext.Provider>
  );
};

export const useTimeRange = () => {
  const context = useContext(TimeRangeContext);
  if (!context) {
    throw new Error("useTimeRange must be used within a TimeRangeProvider");
  }
  return context;
};
