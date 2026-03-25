"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type LeftNavSectionHeaderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children" | "onClick"
> & {
  label: string;
  open: boolean;
  onToggle?: () => void;
};

export function LeftNavSectionHeader({
  label,
  open,
  className,
  onToggle,
  ...rest
}: LeftNavSectionHeaderProps) {
  const chevronBase =
    "transition-opacity duration-150 ease-out";
  const chevronVisibility = open
    ? "opacity-0 group-hover:opacity-100"
    : "opacity-100";

  return (
    <button
      {...rest}
      className={cx(
        "group inline-flex h-6 w-full items-center rounded-sm px-mid",
        "bg-transparent hover:bg-background-tertiary active:bg-background-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        className,
      )}
      onClick={() => onToggle?.()}
      type="button"
    >
      <span className="inline-flex min-w-0 items-center gap-xs">
        <span
          className={cx(
            "min-w-0 truncate text-hint leading-4",
            "text-text-secondary",
            "group-hover:text-text-primary",
            "group-active:text-text-primary",
          )}
        >
          {label}
        </span>

        <Icon
          name={open ? "chevronDownIcon" : "chevronRightIcon"}
          size={16}
          className={cx(
            chevronBase,
            chevronVisibility,
            "text-text-secondary",
            "group-hover:text-text-primary",
            "group-active:text-text-primary",
          )}
        />
      </span>
    </button>
  );
}
