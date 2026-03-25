"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type ListWidgetProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: React.ReactNode;
  footerLabel?: string;
  onFooterClick?: () => void;
};

export function ListWidget({
  children,
  footerLabel,
  onFooterClick,
  className,
  ...rest
}: ListWidgetProps) {
  return (
    <div
      {...rest}
      className={cx(
        "flex flex-col overflow-clip rounded-[16px] border border-border bg-background-primary p-sm shadow-[var(--elevation-shadow-md)]",
        className,
      )}
    >
      {children}

      {footerLabel ? (
        <button
          type="button"
          className={cx(
            "w-full rounded-md px-sm py-xs text-left text-paragraph text-text-secondary",
            "transition-colors duration-100 ease-in-out",
            "hover:bg-background-secondary hover:font-medium hover:text-text-primary",
          )}
          onClick={onFooterClick}
        >
          {footerLabel}
        </button>
      ) : null}
    </div>
  );
}
