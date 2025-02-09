import TopBar from "@/components/topBar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="layout">
        <TopBar />
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
