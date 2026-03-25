"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "children"
> & {
  iconPrefix?: React.ReactNode;
};

export function TextInput({
  iconPrefix,
  className,
  ...rest
}: TextInputProps) {
  return (
    <div
      className={cx(
        "flex h-8 items-center gap-xs rounded-sm border px-mid",
        "bg-background-primary",
        "border-border hover:border-action-default-border-hover",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-inset focus-within:ring-action-default-border-focus",
        className,
      )}
    >
      {iconPrefix ? (
        <span className="inline-flex size-4 shrink-0 items-center justify-center text-text-secondary" aria-hidden="true">
          {iconPrefix}
        </span>
      ) : null}
      <input
        {...rest}
        type="text"
        className="min-w-0 flex-1 bg-transparent text-paragraph leading-5 text-text-primary placeholder:text-text-secondary focus:outline-none"
      />
    </div>
  );
}
