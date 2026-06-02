import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterLingo",
  description: "Recall-first multilingual learning with interleaving and spaced repetition.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#24a68a"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

