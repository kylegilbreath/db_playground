"use client";

import * as React from "react";
import { Icon } from "@/components/icons";

export type AnythingBoxMode = "search" | "ask";

export type AnythingBoxModeToggleProps = {
  mode: AnythingBoxMode;
  onModeChange?: (mode: AnythingBoxMode) => void;
  /** When locked, the user cannot toggle modes. */
  locked?: boolean;
  /** Toggle items support icons, but we hide them by default for now. */
  showIcons?: boolean;
  className?: string;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function SegmentButton({
  selected,
  locked,
  label,
  iconName,
  showIcon,
  onClick,
}: {
  selected: boolean;
  locked?: boolean;
  label: string;
  iconName: string;
  showIcon: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={selected}
      className={cx(
        "inline-flex items-center gap-xs overflow-clip rounded-full px-3 py-[6px] text-paragraph leading-5",
        selected
          ? "bg-background-primary border border-border text-action-default-text-default"
          : "text-text-secondary hover:bg-action-tertiary-background-hover hover:text-text-primary",
        locked ? "cursor-default opacity-60 hover:bg-transparent" : "cursor-pointer",
      )}
      disabled={locked}
      onClick={locked ? undefined : onClick}
      type="button"
    >
      {showIcon ? <Icon name={iconName} size={16} /> : null}
      <span>{label}</span>
    </button>
  );
}

export function AnythingBoxModeToggle({
  mode,
  onModeChange,
  locked = false,
  showIcons = false,
  className,
}: AnythingBoxModeToggleProps) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-xs rounded-full bg-background-secondary p-px",
        className,
      )}
      role="group"
      aria-label="Mode"
    >
      <SegmentButton
        selected={mode === "ask"}
        locked={locked}
        label="Ask"
        iconName="SparkleIcon"
        showIcon={showIcons}
        onClick={() => onModeChange?.("ask")}
      />
      <SegmentButton
        selected={mode === "search"}
        locked={locked}
        label="Search"
        iconName="searchIcon"
        showIcon={showIcons}
        onClick={() => onModeChange?.("search")}
      />
    </div>
  );
}

