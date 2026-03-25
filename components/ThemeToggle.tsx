"use client";

import * as React from "react";
import { Moon, Sun } from "@phosphor-icons/react";

import { IconButton } from "@/components/IconButton";

type Theme = "light" | "dark";

function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(next: Theme) {
  const root = document.documentElement;
  if (next === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  try {
    localStorage.setItem("theme", next);
  } catch {
    // ignore
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  const isDark = theme === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      icon={isDark ? <Sun size={16} weight="regular" /> : <Moon size={16} weight="regular" />}
      radius="full"
      tone="neutral"
      onClick={() => {
        const next: Theme = isDark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      title={isDark ? "Light mode" : "Dark mode"}
    />
  );
}

