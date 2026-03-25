"use client";

import * as React from "react";

import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { PhIcon } from "@/components/icons";

import type { SmallLogoCardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SmallLogoCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: SmallLogoCardItem;
};

/**
 * SmallLogoCard
 *
 * Partner/marketplace-style small card where the leading icon is a small (24px) logo.
 */
export function SmallLogoCard({ item, className, ...rest }: SmallLogoCardProps) {
  const mark =
    item.mark.kind === "logo" ? (
      // Logos are provided by product/consumers; `<img>` is appropriate here.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={item.mark.alt ?? ""}
        src={item.mark.src}
        className="block size-6 rounded-[2px] object-contain"
      />
    ) : (
      <PhIcon icon={item.mark.icon} size={24} weight={item.mark.weight} />
    );

  return (
    <div
      {...rest}
      className={cx(
        "flex w-full flex-col overflow-hidden",
        "rounded-[16px] border border-border bg-background-primary",
        "p-md",
        "shadow-[var(--elevation-shadow-xs)] transition-shadow",
        className,
      )}
    >
      <div className="flex w-full min-w-0 gap-sm">
        <span
          className="inline-flex size-6 shrink-0 items-center justify-center text-text-primary"
          aria-hidden="true"
        >
          {mark}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <NameLabel label={item.title.label} decorators={item.title.decorators} />

          {item.subtitle ? (
            <div className="text-hint leading-4 text-text-secondary">{item.subtitle}</div>
          ) : null}

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
        </div>
      </div>
    </div>
  );
}

