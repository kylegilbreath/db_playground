"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

export type FilterChipToggleProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "aria-pressed" | "children"
> & {
  /** Whether the toggle is selected (represents filter panel open/closed). */
  isSelected?: boolean;
  /** Uncontrolled initial selected state. */
  defaultSelected?: boolean;
  /** Called when the user toggles the chip. */
  onSelectedChange?: (nextSelected: boolean) => void;
  /** Whether any filters are applied (shows an applied count badge). */
  hasFiltersApplied?: boolean;
  /**
   * Optional applied filter count to display in the badge.
   * Only used when `hasFiltersApplied` is true.
   */
  appliedCount?: number;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * FilterChipToggle
 *
 * A compact chip used to toggle the (future) filter panel open/closed.
 * Visual styling matches the standard chip. The badge indicates filters are applied.
 *
 * Accessibility:
 * - Uses `aria-pressed` for toggle state
 * - Requires an accessible name (provide `aria-label`)
 */
export function FilterChipToggle({
  isSelected: isSelectedProp,
  defaultSelected = false,
  onSelectedChange,
  hasFiltersApplied = false,
  appliedCount = 1,
  className,
  onClick,
  ...rest
}: FilterChipToggleProps) {
  const isControlled = isSelectedProp !== undefined;
  const [uncontrolledSelected, setUncontrolledSelected] =
    React.useState(defaultSelected);
  const isSelected = isControlled ? Boolean(isSelectedProp) : uncontrolledSelected;

  const setSelected = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledSelected(next);
      onSelectedChange?.(next);
    },
    [isControlled, onSelectedChange],
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      setSelected(!isSelected);
    },
    [onClick, setSelected, isSelected],
  );

  // Figma (node 3:5243):
  // - 55px width, 32px height
  // - 10px horizontal padding
  // - 4px gap between icon and badge
  const base =
    "group inline-flex h-8 w-[55px] items-center justify-center gap-xs rounded-full border px-[10px]";

  const focus =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-default-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary";

  const colors = isSelected
    ? cx(
        "bg-action-default-background-hover border-action-default-border-hover",
        "active:bg-action-default-background-press active:border-action-default-border-press",
      )
    : cx(
        "bg-background-primary border-border",
        "hover:bg-action-default-background-hover hover:border-action-default-border-hover",
        "active:bg-action-default-background-press active:border-action-default-border-press",
      );

  const iconColor = isSelected
    ? cx(
        "text-action-default-icon-hover",
        "active:text-action-default-icon-press",
      )
    : cx(
        "text-action-default-icon-default",
        "group-hover:text-action-default-icon-hover",
        "group-active:text-action-default-icon-press",
      );

  return (
    <button
      {...rest}
      aria-pressed={isSelected}
      className={cx(base, focus, colors, className)}
      onClick={handleClick}
      type="button"
    >
      <Icon name="SlidersIcon" size={16} className={iconColor} />
      {hasFiltersApplied ? (
        <span
          className={cx(
            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-[6px]",
            "bg-action-primary-background-default text-action-primary-text-default",
            "text-paragraph font-semibold leading-5",
          )}
        >
          {appliedCount}
        </span>
      ) : null}
    </button>
  );
}

