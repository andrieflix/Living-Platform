import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Living Platform Admin",
  description: "Living Platform administration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#ffffff", color: "#1f2937" }}>
        {children}
      </body>
    </html>
  );
}
