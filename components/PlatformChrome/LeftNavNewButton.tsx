"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type LeftNavNewButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
>;

export function LeftNavNewButton({
  className,
  disabled,
  ...rest
}: LeftNavNewButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex w-full items-center justify-start gap-sm overflow-clip rounded-md px-mid py-sm shadow-[var(--elevation-shadow-md)]",
        "bg-background-primary hover:bg-background-tertiary active:bg-background-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={disabled}
      type="button"
    >
      <Icon name="plusIcon" size={16} className="text-text-primary" />
      <span className="text-paragraph font-semibold leading-5 text-text-primary">
        New
      </span>
    </button>
  );
}

