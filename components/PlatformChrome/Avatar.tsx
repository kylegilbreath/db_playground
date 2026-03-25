"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type AvatarProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Single-letter label (e.g. user initial). */
  initial: string;
};

export function Avatar({ initial, className, disabled, ...rest }: AvatarProps) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex size-8 items-center justify-center overflow-clip rounded-sm",
        // Match IconButton interaction surfaces.
        "bg-transparent hover:bg-action-tertiary-background-hover active:bg-action-default-background-press",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-default-border-focus focus-visible:outline-offset-0",
        "disabled:text-action-disabled-text disabled:hover:bg-transparent disabled:active:bg-transparent",
        "disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      type="button"
    >
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#434A93]">
        <span className="text-[12px] font-semibold leading-4 text-white">
          {initial.slice(0, 1).toUpperCase()}
        </span>
      </span>
    </button>
  );
}

