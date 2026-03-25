"use client";
import * as React from "react";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function CollapsibleSection({
  label,
  defaultOpen = false,
  children,
  className,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={cx("flex flex-col gap-xs", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-fit items-center gap-xs text-paragraph text-text-secondary hover:text-text-primary"
      >
        <Icon
          name={open ? "chevronDownIcon" : "chevronRightIcon"}
          size={12}
          className="text-text-secondary"
        />
        {label}
      </button>
      {open && <div className="flex flex-col gap-xs pl-sm">{children}</div>}
    </div>
  );
}
