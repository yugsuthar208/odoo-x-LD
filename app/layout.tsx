import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Commons — Your campus, in sync",
  description: "A connected home for campus clubs, events, volunteering and student life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
