"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type DatabricksLockupProps = {
  className?: string;
};

export function DatabricksLockup({ className }: DatabricksLockupProps) {
  return (
    <div className={cx("inline-flex h-8 items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/Databricks.svg" alt="Databricks" className="block size-5 shrink-0" />
    </div>
  );
}
