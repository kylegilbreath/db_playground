"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

export type TertiaryButtonSize = "default" | "small";
export type TertiaryButtonTone = "accent" | "neutral" | "muted";
export type TertiaryButtonRadius = "default" | "full";

export type TertiaryButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Button label. */
  children: React.ReactNode;
  /** Size variant. */
  size?: TertiaryButtonSize;
  /**
   * Visual emphasis only. Affects text + icon color only (not layout or interactions).
   * - `accent` (default): uses tertiary accent semantic tokens
   * - `neutral`: uses `textPrimary`
   * - `muted`: uses `textSecondary`
   */
  tone?: TertiaryButtonTone;
  /**
   * Border radius.
   * - `default`: `rounded-sm` (4px)
   * - `full`: `rounded-full` (999px)
   */
  radius?: TertiaryButtonRadius;
  /** Optional leading icon (16x16). */
  leadingIcon?: React.ReactNode;
  /** If true, shows trailing chevron to indicate a menu affordance (no dropdown behavior here). */
  menu?: boolean;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * TertiaryButton
 *
 * Figma: `3. buttonTertiary` (node 975:8863)
 * - Sizes: 32px (default), 24px (small)
 * - Variants: optional leading icon, optional trailing menu chevron
 * - States: default/hover/press/focus/disabled
 */
export function TertiaryButton({
  children,
  size = "default",
  tone = "accent",
  radius = "default",
  leadingIcon,
  menu = false,
  className,
  disabled,
  ...rest
}: TertiaryButtonProps) {
  const sizeClasses = size === "small" ? "h-6 px-sm" : "h-8 px-mid";
  const radiusClasses = radius === "full" ? "rounded-full" : "rounded-sm";
  const toneClasses =
    tone === "neutral"
      ? "text-text-primary hover:text-text-primary active:text-text-primary"
      : tone === "muted"
        ? "text-text-secondary hover:text-text-secondary active:text-text-secondary"
        : "text-action-tertiary-text-default hover:text-action-tertiary-text-hover active:text-action-tertiary-text-press";

  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-xs overflow-clip",
        radiusClasses,
        sizeClasses,
        // Text (and icon) colors
        toneClasses,
        "disabled:text-action-disabled-text",
        // Backgrounds (hover/press only)
        "hover:bg-action-tertiary-background-hover",
        "active:bg-action-tertiary-background-press",
        "disabled:hover:bg-transparent disabled:active:bg-transparent",
        // Focus: 2px border in Figma; implement as inset ring to avoid layout shift
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      type="button"
    >
      {leadingIcon ? (
        <span className="inline-flex size-4 items-center justify-center" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}

      <span className="text-paragraph leading-5">{children}</span>

      {menu ? (
        <Icon name="chevronDownIcon" size={16} />
      ) : null}
    </button>
  );
}

