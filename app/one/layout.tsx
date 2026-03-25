"use client";

import { OneHueProvider } from "./OneHueContext";

export default function OneLayout({ children }: { children: React.ReactNode }) {
  return <OneHueProvider>{children}</OneHueProvider>;
}
