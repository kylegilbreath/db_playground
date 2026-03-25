"use client";

import * as React from "react";

import { SectionTitle } from "./SectionTitle";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SectionTab = {
  id: string;
  label: React.ReactNode;
};

export type SectionTabsProps = {
  className?: string;
  /** Base id used to generate stable tab/panel ids for ARIA. */
  idBase: string;
  tabs: SectionTab[];
  value: string;
  onValueChange: (tabId: string) => void;
};

export function SectionTabs({
  className,
  idBase,
  tabs,
  value,
  onValueChange,
}: SectionTabsProps) {
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (id: string) => {
    tabRefs.current[id]?.focus();
  };

  const getEnabledTabs = () => tabs;
  const enabledTabs = getEnabledTabs();

  const move = (dir: -1 | 1) => {
    if (!enabledTabs.length) return;
    const currentIdx = Math.max(
      0,
      enabledTabs.findIndex((t) => t.id === value),
    );
    const nextIdx = (currentIdx + dir + enabledTabs.length) % enabledTabs.length;
    const nextId = enabledTabs[nextIdx]?.id;
    if (!nextId) return;
    onValueChange(nextId);
    focusTab(nextId);
  };

  return (
    <div
      className={cx("flex flex-wrap items-center gap-[28px] pl-mid", className)}
      role="tablist"
      aria-orientation="horizontal"
    >
      {tabs.map((t) => (
        <SectionTitle
          key={t.id}
          selected={t.id === value}
          onClick={() => onValueChange(t.id)}
          buttonRef={(el) => {
            tabRefs.current[t.id] = el;
          }}
          buttonProps={{
            id: `${idBase}-tab-${t.id}`,
            role: "tab",
            "aria-selected": t.id === value,
            "aria-controls": `${idBase}-panel-${t.id}`,
            tabIndex: t.id === value ? 0 : -1,
            onKeyDown: (e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                move(-1);
              } else if (e.key === "Home") {
                e.preventDefault();
                const first = enabledTabs[0]?.id;
                if (!first) return;
                onValueChange(first);
                focusTab(first);
              } else if (e.key === "End") {
                e.preventDefault();
                const last = enabledTabs[enabledTabs.length - 1]?.id;
                if (!last) return;
                onValueChange(last);
                focusTab(last);
              }
            },
          }}
        >
          {t.label}
        </SectionTitle>
      ))}
    </div>
  );
}

