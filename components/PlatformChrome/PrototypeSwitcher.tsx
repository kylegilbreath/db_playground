"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { DropdownMenu, type DropdownMenuItem } from "@/components/DropdownMenu";
import { Icon } from "@/components/icons";

import { getPrototypeGroups, resolvePrototype } from "./prototypes";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Playground prototype switcher.
 *
 * Lives in the top-left of the app chrome (in place of the plain Databricks
 * logo). Shows the current exploration's friendly name and opens a grouped menu
 * to jump between explorations. Selecting one navigates to its real route, so
 * the URL you land on is the deep link.
 */
export function PrototypeSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const current = resolvePrototype(pathname);
  const groups = React.useMemo(() => getPrototypeGroups(), []);

  const items = React.useMemo<DropdownMenuItem[]>(() => {
    const out: DropdownMenuItem[] = [];
    // Menu title.
    out.push({
      id: "switcher-title",
      label: (
        <span className="text-hint font-semibold uppercase tracking-wide text-text-secondary">
          Prototype Switcher
        </span>
      ),
      disabled: true,
    });
    groups.forEach((group, groupIdx) => {
      // Non-interactive group heading.
      out.push({
        id: `group-${group.group}`,
        label: (
          <span className="text-hint font-semibold uppercase tracking-wide text-text-secondary">
            {group.group}
          </span>
        ),
        disabled: true,
        separatorAbove: true,
      });
      for (const proto of group.items) {
        const isActive = current?.id === proto.id;
        out.push({
          id: proto.id,
          label: proto.name,
          description: proto.description,
          onSelect: () => router.push(proto.href ?? proto.path),
          leadingIcon: isActive ? (
            <Icon name="checkIcon" size={16} className="text-action-tertiary-text-default" />
          ) : (
            // Keep alignment consistent for non-active rows.
            <span className="inline-block size-4" />
          ),
        });
      }
    });
    return out;
  }, [groups, current, router]);

  return (
    <DropdownMenu
      variant="rich"
      widthMode="content"
      side="bottom"
      align="start"
      items={items}
      trigger={({ triggerRef, triggerProps, open }) => (
        <span ref={triggerRef} className="inline-flex">
          <button
            {...triggerProps}
            type="button"
            aria-label="Switch prototype"
            className={cx(
              "flex h-8 items-center gap-sm rounded-md border border-border bg-neutral-100 px-mid",
              "hover:bg-neutral-200 active:bg-neutral-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-default-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary",
              open && "bg-neutral-300",
              className,
            )}
          >
            <span className="truncate text-paragraph font-medium text-text-primary">
              {current?.name ?? "Playground"}
            </span>
            <Icon name="chevronDownIcon" size={16} className="text-text-secondary" />
          </button>
        </span>
      )}
    />
  );
}
