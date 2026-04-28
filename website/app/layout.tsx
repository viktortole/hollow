import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hollow — Fasting as a daily practice",
    template: "%s | Hollow",
  },
  description:
    "Hollow is a minimalist intermittent fasting widget. Track fasts, watch your metabolic stages unfold, earn XP, and unlock achievements. Always-on-top on desktop.",
  openGraph: {
    title: "Hollow — Fasting as a daily practice",
    description:
      "A minimalist fasting widget that lives at the edge of your workspace. Stage detection, gamification, privacy-first.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Hollow",
    description: "Fasting as a daily practice.",
  },
  icons: {
    icon: "/hollow-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
