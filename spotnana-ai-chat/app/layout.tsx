import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Chat — Spotnana Assessment",
  description:
    "A production-quality AI chat application built with Next.js, TypeScript, and the OpenAI API.",
  keywords: ["AI", "chat", "OpenAI", "Next.js", "TypeScript"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
