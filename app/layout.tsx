import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LIFE.exe",
  description: "Habit tracker RPG",
  icons: {
    apple: '/icon-192.png',
    icon:  '/icon-512.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LIFE.exe',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Nav />
      </body>
    </html>
  );
}
