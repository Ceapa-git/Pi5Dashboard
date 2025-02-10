"use clinet";

import { TimeRangeProvider } from "@/context/TimeRangeContext";
import TopBar from "@/components/topBar/TopBar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>RaspberryPi5</title>
        <meta name="description" content="Dashboard for Raspberry Pi 5" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="layout">
        <TimeRangeProvider>
          <TopBar />
          <main className="main">{children}</main>
        </TimeRangeProvider>
      </body>
    </html>
  );
}
