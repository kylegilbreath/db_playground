"use client";

import * as React from "react";

import { FilterSectionHeader } from "./FilterSectionHeader";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type FilterSectionProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  title: string;
  open: boolean;
  count?: number;
  onToggle?: () => void;
  children?: React.ReactNode;
};

export function FilterSection({
  title,
  open,
  count,
  onToggle,
  className,
  children,
  ...rest
}: FilterSectionProps) {
  return (
    <div {...rest} className={cx("w-full py-3", className)}>
      <FilterSectionHeader label={title} open={open} count={count} onToggle={onToggle} />
      {open ? <div className="mt-sm w-full">{children}</div> : null}
    </div>
  );
}

