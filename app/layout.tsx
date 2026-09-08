import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LabNett | Laboratory Information System",
  description: "A safer, clearer operating system for laboratory work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
