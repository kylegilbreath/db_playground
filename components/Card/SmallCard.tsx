"use client";

import * as React from "react";

import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { Tag } from "@/components/Tag";

import type { SmallCardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SmallCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: SmallCardItem;
  /** Card background. Defaults to primary. */
  background?: "primary" | "secondary";
  /** Layout mode. `inline` hugs content (for wrap rows). */
  layout?: "block" | "inline";
};

/**
 * SmallCard
 *
 * Small card used in dense grids/rows:
 * - 16px leading icon + name label
 * - optional subtitle
 * - optional metadata row
 */
export function SmallCard({ item, className, ...rest }: SmallCardProps) {
  const { background = "primary", layout = "block", ...domProps } = rest;
  const backgroundClass = background === "secondary" ? "bg-background-secondary" : "bg-background-primary";

  return (
    <div
      {...domProps}
      className={cx(
        layout === "inline"
          ? "inline-flex w-fit max-w-full flex-col gap-sm overflow-hidden"
          : "flex w-full flex-col gap-sm overflow-hidden",
        "rounded-[16px] border border-border",
        backgroundClass,
        "p-md",
        "shadow-[var(--elevation-shadow-xs)] transition-shadow",
        className,
      )}
    >
      <NameLabel
        className={layout === "inline" ? "w-auto" : undefined}
        leadingIcon={item.title.leadingIcon}
        label={item.title.label}
        decorators={item.title.decorators}
      />

      {item.subtitle ? (
        <div className="text-hint leading-4 text-text-secondary">{item.subtitle}</div>
      ) : null}

      {/* Note: small cards usually include metadata, but there is also a title-only treatment. */}
      {item.metadataRow && item.metadataRow.length > 0 ? (
        <MetadataRow>
          {item.metadataRow.map((m, idx) => (
            <MetadataItem
              key={idx}
              icon={m.icon}
              separator={m.separator}
              tooltip={m.tooltip}
              onClick={m.onClick}
            >
              {m.label}
            </MetadataItem>
          ))}
        </MetadataRow>
      ) : null}

      {item.tags && item.tags.length > 0 ? (
        <div className="flex h-5 flex-wrap items-start gap-sm overflow-hidden">
          {item.tags.map((t, idx) => (
            <Tag key={idx} color={t.color} leftElement={t.leftElement}>
              {t.label}
            </Tag>
          ))}
        </div>
      ) : null}
    </div>
  );
}

