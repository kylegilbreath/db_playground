"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type FilterSectionHeaderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children" | "onClick"
> & {
  label: string;
  /** Whether the section is expanded. */
  open: boolean;
  /** Optional applied count shown as `(N)` next to the label. */
  count?: number;
  /** Called when the chevron is clicked. */
  onToggle?: () => void;
};

/**
 * FilterSectionHeader
 *
 * Dumb/presentational header that displays the current expanded/collapsed state.
 * It does not manage any state; the parent owns `open`.
 *
 * Figma: Filter section header (open/closed chevron)
 */
export function FilterSectionHeader({
  label,
  open,
  count,
  className,
  onToggle,
  ...rest
}: FilterSectionHeaderProps) {
  return (
    <button
      {...rest}
      aria-label={open ? `Collapse ${label}` : `Expand ${label}`}
      className={cx(
        "inline-flex w-full items-center justify-between rounded-sm",
        "bg-transparent",
        "hover:bg-background-tertiary active:bg-background-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        className,
      )}
      onClick={() => onToggle?.()}
      type="button"
    >
      <span className="min-w-0 text-paragraph font-medium leading-5 text-text-primary">
        <span className="truncate">{label}</span>
        {typeof count === "number" ? (
          <span className="ml-xs text-text-secondary">({count})</span>
        ) : null}
      </span>

      <span className="inline-flex size-6 items-center justify-center" aria-hidden="true">
        <Icon
          name={open ? "chevronUpIcon" : "chevronDownIcon"}
          size={16}
          className="text-text-secondary"
        />
      </span>
    </button>
  );
}

