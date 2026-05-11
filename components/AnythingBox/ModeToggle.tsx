"use client";

import * as React from "react";
import { Icon } from "@/components/icons";

function GradientMaskIcon({ name, size }: { name: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        backgroundImage: "var(--ai-gradient, linear-gradient(45deg, #4299e0 24%, #ca42e0 47%, #ff5f46 76%))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        WebkitMaskImage: `url("/icons/${name}.svg")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url("/icons/${name}.svg")`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        maskMode: "alpha",
      }}
    />
  );
}

export type AnythingBoxMode = "ask" | "code" | "search";

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
  leadingNode,
  onClick,
}: {
  selected: boolean;
  locked?: boolean;
  label: string;
  iconName: string;
  showIcon: boolean;
  leadingNode?: React.ReactNode;
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
      {leadingNode ?? (showIcon ? <Icon name={iconName} size={16} /> : null)}
      <span>{label}</span>
    </button>
  );
}

export function AnythingBoxModeToggle({
  mode,
  onModeChange,
  locked = false,
  showIcons = true,
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
        iconName="speechBubbleIcon"
        showIcon={showIcons}
        onClick={() => onModeChange?.("ask")}
      />
      <SegmentButton
        selected={mode === "code"}
        locked={locked}
        label="Code"
        iconName="codeIcon"
        showIcon={showIcons}
        leadingNode={<GradientMaskIcon name="genieIcon" size={16} />}
        onClick={() => onModeChange?.("code")}
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

