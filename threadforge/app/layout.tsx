import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThreadForge - Convert X Threads to Newsletters",
  description: "Transform your X (Twitter) threads into beautiful, professional newsletters with AI-powered formatting and one-click export.",
  openGraph: {
    title: "ThreadForge - Convert X Threads to Newsletters",
    description: "Transform your X (Twitter) threads into beautiful, professional newsletters with AI-powered formatting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
