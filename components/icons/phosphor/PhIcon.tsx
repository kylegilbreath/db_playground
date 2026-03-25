"use client";

import * as React from "react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";

type PhosphorIconComponent = React.ComponentType<PhosphorIconProps>;

export type PhIconProps = Omit<PhosphorIconProps, "size" | "color" | "children"> & {
  /**
   * The Phosphor icon component, e.g. `X`, `CaretDown`, etc.
   *
   * Usage:
   *   import { X } from "@phosphor-icons/react";
   *   <PhIcon icon={X} />
   */
  icon: PhosphorIconComponent;
  /** Icon size in px. Defaults to 16. */
  size?: number;
  /**
   * Accessibility:
   * - If `decorative` is true, the icon is hidden from screen readers.
   * - Otherwise, provide `aria-label`.
   */
  decorative?: boolean;
};

/**
 * PhIcon
 *
 * Thin wrapper around `@phosphor-icons/react` that:
 * - defaults to `size=16`
 * - uses `currentColor` so Tailwind `text-*` classes control icon color
 * - supports a `decorative` flag for a11y consistency with local icons
 */
export function PhIcon({
  icon: Icon,
  size = 16,
  decorative = true,
  className,
  style,
  ...rest
}: PhIconProps) {
  return (
    <Icon
      {...rest}
      aria-hidden={decorative ? true : undefined}
      className={className}
      color="currentColor"
      size={size}
      style={style}
    />
  );
}

