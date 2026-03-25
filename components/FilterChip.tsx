"use client";

import * as React from "react";

export type FilterChipKind = "toggle" | "dropdown";

export type FilterChipProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "aria-pressed"
> & {
  /** Visible text label (required). */
  label: string;
  /**
   * Controlled applied state. When `true`, the chip is "applied" (toggled on).
   * Use `onAppliedChange` to respond to user interaction.
   */
  applied?: boolean;
  /** Uncontrolled initial applied state. */
  defaultApplied?: boolean;
  /** Called when user toggles the chip. */
  onAppliedChange?: (nextApplied: boolean) => void;
  /**
   * Leading icon on the left. Rendered if provided.
   * The icon should typically be a 16x16 SVG that uses `currentColor`.
   */
  leadingIcon?: React.ReactNode;
  /**
   * Determines the chip’s unapplied affordance:
   * - `toggle`: no trailing icon when unapplied
   * - `dropdown`: show a chevron when unapplied (commonly for menu-backed filters)
   *
   * In the applied/selected state, the close icon is always shown on the right
   * (matching the Figma variants).
   */
  kind?: FilterChipKind;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function CloseSmallIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M5.25 5.25 10.75 10.75M10.75 5.25 5.25 10.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
    >
      <path
        d="M4 6.5 8 10.5 12 6.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * FilterChip
 * A pill-shaped toggle button for horizontal filter bars.
 *
 * - Clicking toggles applied/unapplied
 * - Keyboard accessible
 * - Toggle state announced via `aria-pressed`
 */
export function FilterChip({
  label,
  applied: appliedProp,
  defaultApplied = false,
  onAppliedChange,
  leadingIcon,
  kind = "toggle",
  className,
  disabled,
  onClick,
  ...rest
}: FilterChipProps) {
  const isControlled = appliedProp !== undefined;
  const [uncontrolledApplied, setUncontrolledApplied] =
    React.useState(defaultApplied);
  const applied = isControlled ? Boolean(appliedProp) : uncontrolledApplied;

  const setApplied = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledApplied(next);
      onAppliedChange?.(next);
    },
    [isControlled, onAppliedChange],
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || disabled) return;
      setApplied(!applied);
    },
    [onClick, disabled, setApplied, applied],
  );

  // Matches Figma node 1:7648:
  // - 32px height
  // - 12px horizontal padding
  // - 4px gap between items
  // - full radius, max width 160px, label truncates
  const base =
    "inline-flex h-8 max-w-40 items-center gap-xs rounded-full border px-3 text-paragraph leading-5";

  const interaction = cx(
    "select-none whitespace-nowrap",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-default-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
  );

  const colors = applied
    ? cx(
        // Selected at rest matches hover visuals in Figma.
        "bg-action-default-background-hover border-action-default-border-hover text-action-default-text-hover",
        !disabled &&
          "hover:bg-action-default-background-hover hover:border-action-default-border-hover hover:text-action-default-text-hover",
        !disabled &&
          "active:bg-action-default-background-press active:border-action-default-border-press active:text-action-default-text-press",
      )
    : cx(
        "bg-background-primary border-border text-text-primary",
        !disabled &&
          "hover:bg-action-default-background-hover hover:border-action-default-border-hover hover:text-action-default-text-hover",
        !disabled &&
          "active:bg-action-default-background-press active:border-action-default-border-press active:text-action-default-text-press",
      );

  const iconColor = applied
    ? cx(
        "text-action-default-icon-hover",
        !disabled && "active:text-action-default-icon-press",
      )
    : cx(
        "text-action-default-icon-default",
        !disabled && "hover:text-action-default-icon-hover",
        !disabled && "active:text-action-default-icon-press",
      );

  return (
    <button
      {...rest}
      aria-pressed={applied}
      className={cx(base, interaction, colors, className)}
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      {leadingIcon ? (
        <span className={cx("size-4 shrink-0", iconColor)} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {applied ? (
        <CloseSmallIcon className={cx("size-4 shrink-0", iconColor)} />
      ) : kind === "dropdown" ? (
        <ChevronDownIcon className={cx("size-4 shrink-0", iconColor)} />
      ) : null}
    </button>
  );
}

