import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/providers/app-provider";
// 1. นำเข้า LanguageProvider ที่เราสร้างไว้
import { LanguageProvider } from "@/providers/language-provider";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Promptbit POS",
    template: "%s | Promptbit POS",
  },
  description: "Modern Mobile First POS SaaS Platform built with Next.js 16.",
  applicationName: "Promptbit POS",
  keywords: [
    "POS",
    "Restaurant POS",
    "Inventory",
    "Orders",
    "Kitchen Display System",
  ],
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. นำ LanguageProvider มาครอบ AppProvider เพื่อให้ทำงานร่วมกันได้ */}
        <LanguageProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}