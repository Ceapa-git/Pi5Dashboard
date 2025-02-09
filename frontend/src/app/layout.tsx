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
      <body className="layout">
        <TimeRangeProvider>
          <TopBar />
          <main className="main">{children}</main>
        </TimeRangeProvider>
      </body>
    </html>
  );
}
