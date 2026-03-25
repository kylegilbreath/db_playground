"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type WrappingTextProps = Omit<React.HTMLAttributes<HTMLParagraphElement>, "children"> & {
  children: React.ReactNode;
  /**
   * Maximum number of lines to show before truncating with ellipsis.
   * - If omitted, text wraps naturally with no clamping.
   */
  lines?: number;
  /**
   * Max width for legibility.
   * - Defaults to a legibility cap.
   * - Pass `null` to opt out (no max-width).
   * - If provided, it is still capped to the legibility max.
   */
  maxWidth?: number | string | null;
};

/**
 * WrappingText
 *
 * Matches the card metadata description text styling from Figma (node `1065:51550`):
 * - 12px / 16px (Hint)
 * - `text-text-secondary`
 * - wraps, and can be clamped with ellipsis
 */
export function WrappingText({
  className,
  lines,
  maxWidth,
  style,
  children,
  ...rest
}: WrappingTextProps) {
  const LEGIBLE_MAX = "65ch";
  const requested =
    maxWidth === undefined
      ? LEGIBLE_MAX
      : maxWidth === null
        ? null
        : typeof maxWidth === "number"
          ? `${maxWidth}px`
          : maxWidth;

  const clamp =
    typeof lines === "number" && Number.isFinite(lines) && lines > 0
      ? {
          display: "-webkit-box",
          WebkitBoxOrient: "vertical" as const,
          WebkitLineClamp: lines,
          overflow: "hidden",
        }
      : undefined;

  return (
    <p
      {...rest}
      className={cx(
        "min-w-0 whitespace-pre-wrap text-hint leading-4 text-text-secondary",
        className,
      )}
      style={{
        maxWidth: requested === null ? undefined : `min(${requested}, ${LEGIBLE_MAX})`,
        ...clamp,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

