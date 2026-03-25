"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

export type PrimaryButtonSize = "default" | "small";
export type PrimaryButtonRadius = "default" | "full";

export type PrimaryButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Button label. */
  children: React.ReactNode;
  /** Size variant. */
  size?: PrimaryButtonSize;
  /**
   * Border radius.
   * - `default`: `rounded-sm` (4px)
   * - `full`: `rounded-full` (999px)
   */
  radius?: PrimaryButtonRadius;
  /** Optional leading icon (16x16). */
  leadingIcon?: React.ReactNode;
  /** If true, shows trailing chevron to indicate a menu affordance (no dropdown behavior here). */
  menu?: boolean;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * PrimaryButton
 *
 * Figma: `2. buttonPrimary` (node 990:50642)
 * - Sizes: 32px (default), 24px (small)
 * - Variants: optional leading icon, optional trailing menu chevron
 * - States: default/hover/press/focus/disabled
 */
export function PrimaryButton({
  children,
  size = "default",
  radius = "default",
  leadingIcon,
  menu = false,
  className,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const sizeClasses = size === "small" ? "h-6 px-sm" : "h-8 px-mid";
  const radiusClasses = radius === "full" ? "rounded-full" : "rounded-sm";

  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-xs overflow-clip",
        radiusClasses,
        sizeClasses,
        // Background
        "bg-action-primary-background-default",
        "hover:bg-action-primary-background-hover",
        "active:bg-action-primary-background-press",
        "disabled:bg-action-disabled-border disabled:hover:bg-action-disabled-border disabled:active:bg-action-disabled-border",
        // Text (and icon) colors
        "text-action-primary-text-default",
        // Focus: use inset ring to match the system focus affordance without layout shift
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

      {menu ? <Icon name="chevronDownIcon" size={16} /> : null}
    </button>
  );
}

