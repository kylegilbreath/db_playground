"use client";

import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type DatabricksLockupProps = {
  className?: string;
  hideDatabricksLogo?: boolean;
};

export function DatabricksLockup({ className, hideDatabricksLogo = false }: DatabricksLockupProps) {
  return (
    <div className={cx("inline-flex h-8 items-center gap-md", className)}>
      {!hideDatabricksLogo && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/Databricks.svg"
            alt="Databricks"
            className="block size-5 shrink-0"
          />
          <div className="h-4 w-px shrink-0 bg-text-secondary" />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/Nike.png"
        alt="Nike"
        className="block h-6 w-auto shrink-0 object-contain dark:invert"
      />
    </div>
  );
}

