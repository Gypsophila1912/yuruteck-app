import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalHeader } from "@/components/layout/global-header";
import { BottomNav } from "@/components/layout/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "週刊ゆるてっく",
  description: "ゆるテックアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <div className="mx-auto w-full min-h-screen bg-white relative flex flex-col">
          <GlobalHeader />
          <main className="flex-1 overflow-y-auto pb-[60px] md:pb-0">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
