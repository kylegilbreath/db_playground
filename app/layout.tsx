import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppChrome } from "@/components/PlatformChrome";
import { Agentation } from "agentation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UB FY27",
  icons: {
    icon: [
      // Prefer SVG for crisp scaling where supported.
      { url: "/favicon.svg?v=ub-fy27", type: "image/svg+xml" },
      // Fallback for legacy browsers.
      { url: "/favicon.ico?v=ub-fy27", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=ub-fy27", sizes: "180x180" }],
  },
  manifest: "/manifest.json?v=ub-fy27",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          // Apply saved theme as early as possible to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var c=document.documentElement.classList;if(t==='light'){c.remove('dark');}else if(t==='dark'){c.add('dark');}else{c.add('dark');}}catch(e){}})();`,
          }}
        />
        <Suspense fallback={<div className="min-h-dvh bg-background-secondary" />}>
          <AppChrome>{children}</AppChrome>
        </Suspense>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
