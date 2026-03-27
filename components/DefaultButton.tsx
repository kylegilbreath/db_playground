"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

export type DefaultButtonSize = "default" | "small";
export type DefaultButtonRadius = "default" | "full";

export type DefaultButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Button label. */
  children: React.ReactNode;
  /** Size variant. */
  size?: DefaultButtonSize;
  /**
   * Border radius.
   * - `default`: `rounded-sm` (4px)
   * - `full`: `rounded-full` (999px)
   */
  radius?: DefaultButtonRadius;
  /** Optional leading icon (16x16). */
  leadingIcon?: React.ReactNode;
  /** If true, shows trailing chevron to indicate a menu affordance (no dropdown behavior here). */
  menu?: boolean;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * DefaultButton
 *
 * Figma: `1. buttonDefault` (node 990:50539)
 * - Sizes: 32px (default), 24px (small)
 * - Variants: optional leading icon, optional trailing menu chevron
 * - States: default/hover/press/focus/disabled
 */
export function DefaultButton({
  children,
  size = "default",
  radius = "default",
  leadingIcon,
  menu = false,
  className,
  disabled,
  ...rest
}: DefaultButtonProps) {
  const sizeClasses = size === "small" ? "h-6 px-sm" : "h-8 px-mid";
  const radiusClasses = radius === "full" ? "rounded-full" : "rounded-sm";
  const mutedIconClasses = disabled
    ? "text-action-disabled-text"
    : "text-text-secondary group-hover:text-action-default-text-hover group-active:text-action-default-text-press";

  return (
    <button
      {...rest}
      className={cx(
        "group inline-flex items-center justify-center gap-xs overflow-clip border",
        radiusClasses,
        sizeClasses,
        // Background
        "bg-background-primary",
        "hover:bg-action-default-background-hover",
        "active:bg-action-default-background-press",
        "disabled:hover:bg-background-primary disabled:active:bg-background-primary",
        // Border
        "border-border",
        "hover:border-action-default-border-hover",
        "active:border-action-default-border-press",
        "disabled:border-action-disabled-border",
        // Text (and icon) colors
        "text-action-default-text-default",
        "hover:text-action-default-text-hover",
        "active:text-action-default-text-press",
        "disabled:text-action-disabled-text",
        // Focus: 2px border in Figma; implement as inset ring to avoid layout shift
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      type="button"
    >
      {leadingIcon ? (
        <span
          className={cx("inline-flex size-4 items-center justify-center", mutedIconClasses)}
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      ) : null}

      <span className="min-w-0 truncate text-paragraph leading-5">{children}</span>

      {menu ? (
        <span
          className={cx("inline-flex size-4 items-center justify-center", mutedIconClasses)}
          aria-hidden="true"
        >
          <Icon name="chevronDownIcon" size={16} />
        </span>
      ) : null}
    </button>
  );
}

