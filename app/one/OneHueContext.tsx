"use client";

import * as React from "react";
import { hueToColors } from "@/components/HuePicker";

type OneHueContextValue = {
  hue: number;
  setHue: (hue: number) => void;
};

const OneHueContext = React.createContext<OneHueContextValue>({
  hue: 335,
  setHue: () => {},
});

export function useOneHue() {
  return React.useContext(OneHueContext);
}

export function OneHueProvider({ children, defaultHue = 335 }: { children: React.ReactNode; defaultHue?: number }) {
  const [hue, setHue] = React.useState(defaultHue);

  React.useEffect(() => {
    const shell = document.querySelector(".databricks-one");
    if (shell instanceof HTMLElement) {
      const colors = hueToColors(hue);
      shell.style.setProperty("--one-accent-bg", `hsl(${hue} 80% 55% / 0.18)`);
      shell.style.setProperty("--one-accent-bg-hover", `hsl(${hue} 80% 55% / 0.12)`);
      shell.style.setProperty("--blob-color-a", colors.colorA);
      shell.style.setProperty("--blob-color-b", colors.colorB);
      shell.style.setProperty("--blob-color-c", colors.colorC);
      shell.style.setProperty("--blob-color-d", colors.colorD);
    }
  }, [hue]);

  const value = React.useMemo(() => ({ hue, setHue }), [hue]);

  return (
    <OneHueContext.Provider value={value}>{children}</OneHueContext.Provider>
  );
}
