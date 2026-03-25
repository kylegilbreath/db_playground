"use client";

import { OneHueProvider } from "@/app/one/OneHueContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OneHueProvider defaultHue={140}>{children}</OneHueProvider>;
}
