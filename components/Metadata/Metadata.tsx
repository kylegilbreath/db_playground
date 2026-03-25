"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type MetadataRowProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

/**
 * MetadataRow
 *
 * Matches the card metadata row pattern from Figma (`Row 2`, node `1065:51284`):
 * - wraps
 * - 4px gaps
 * - vertically centered
 */
export function MetadataRow({ className, children, ...rest }: MetadataRowProps) {
  return (
    <div
      {...rest}
      className={cx("flex flex-wrap items-center gap-xs", className)}
    >
      {children}
    </div>
  );
}

export type MetadataItemProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children" | "onClick"
> & {
  /** Optional leading icon. When omitted, item is text-only. */
  icon?: React.ReactNode;
  children: React.ReactNode;
  /**
   * Whether to show a trailing separator dot (`·`) after the label.
   * This is intentionally a prop so cards can opt in/out.
   */
  separator?: boolean;
  /** Optional tooltip text (uses `title` until we have a tooltip primitive). */
  tooltip?: string;
  /** Optional click handler for micro-interactions. */
  onClick?: () => void;
};

export function MetadataItem({
  icon,
  children,
  separator = true,
  tooltip,
  onClick,
  className,
  ...rest
}: MetadataItemProps) {
  const interactive = Boolean(onClick);

  const normalizedIcon =
    icon && React.isValidElement(icon) && icon.type === Icon
      ? React.cloneElement(
          icon as React.ReactElement<React.ComponentProps<typeof Icon>>,
          { size: 14 },
        )
      : icon;

  const content = (
    <>
      {normalizedIcon ? (
        <span
          className="inline-flex size-[14px] items-center justify-center text-text-secondary"
          aria-hidden="true"
        >
          {normalizedIcon}
        </span>
      ) : null}
      <span className="min-w-0 truncate text-hint leading-4 text-text-secondary">
        {children}
        {separator ? <span aria-hidden="true"> {"\u00b7"}</span> : null}
      </span>
    </>
  );

  if (interactive) {
    return (
      <button
        {...(rest as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick">)}
        className={cx(
          "inline-flex min-w-0 items-center text-left",
          normalizedIcon ? "gap-xs" : "gap-0",
          "cursor-pointer select-none",
          className,
        )}
        title={tooltip}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <span
      {...rest}
      className={cx(
        "inline-flex min-w-0 items-center",
        normalizedIcon ? "gap-xs" : "gap-0",
        className,
      )}
      title={tooltip}
    >
      {content}
    </span>
  );
}

