"use client";

import * as React from "react";

export type IconButtonSize = "default" | "small";
export type IconButtonRadius = "default" | "full";
export type IconButtonTone = "default" | "neutral";

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Icon-only button content (typically a 16x16 SVG that uses `currentColor`). */
  icon: React.ReactNode;
  /** Size variant. */
  size?: IconButtonSize;
  /**
   * Border radius.
   * - `default`: `rounded-sm` (4px)
   * - `full`: `rounded-full` (999px)
   */
  radius?: IconButtonRadius;
  /**
   * Visual tone.
   * - `default`: uses the standard action icon tokens (can be blue-tinted on hover).
   * - `neutral`: uses `textPrimary` and neutral hover/press backgrounds (chrome usage).
   */
  tone?: IconButtonTone;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * IconButton
 *
 * Figma: `4. buttonIcon` (node 2742:12404)
 * - Sizes: 32x32 (default), 24x24 (small)
 * - States: default/hover/press/focus/disabled
 *
 * Accessibility:
 * - Provide an accessible name via `aria-label` (recommended) or `title`.
 */
export function IconButton({
  icon,
  size = "default",
  radius = "default",
  tone = "default",
  className,
  disabled,
  ...rest
}: IconButtonProps) {
  const sizeClasses =
    size === "small"
      ? "size-6 px-xs" // 24px, 4px padding
      : "size-8 px-sm"; // 32px, 8px padding

  const radiusClasses = radius === "full" ? "rounded-full" : "rounded-sm";

  const toneClasses =
    tone === "neutral"
      ? [
          "text-text-primary",
          "hover:bg-background-tertiary",
          "active:bg-background-tertiary",
        ].join(" ")
      : [
          // Default / Hover / Press backgrounds from Figma tokens
          "text-action-default-icon-default",
          "hover:text-action-default-icon-hover",
          "active:text-action-default-icon-press",
          "hover:bg-action-tertiary-background-hover",
          "active:bg-action-default-background-press",
        ].join(" ");

  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center overflow-clip",
        radiusClasses,
        sizeClasses,
        "bg-transparent",
        // Focus: outline instead of border to avoid layout/clip issues with border-box sizing
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-default-border-focus focus-visible:outline-offset-0",
        toneClasses,
        "disabled:text-action-disabled-text disabled:hover:bg-transparent disabled:active:bg-transparent",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      type="button"
    >
      <span className="inline-flex size-4 items-center justify-center">{icon}</span>
    </button>
  );
}

