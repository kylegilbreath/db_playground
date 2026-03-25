"use client";

import * as React from "react";

import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { Tag } from "@/components/Tag";
import { PhIcon } from "@/components/icons";

import type { LargeLogoCardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type LargeLogoCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: LargeLogoCardItem;
};

/**
 * LargeLogoCard
 *
 * Partner/marketplace card with a large (40px) logo shown above the title.
 */
export function LargeLogoCard({ item, className, ...rest }: LargeLogoCardProps) {
  return (
    <div
      {...rest}
      className={cx(
        "flex w-full items-center gap-[12px] overflow-hidden",
        "rounded-[16px] border border-border bg-background-primary p-md",
        "shadow-[var(--elevation-shadow-xs)] transition-shadow",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        {item.mark.kind === "logo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={item.mark.alt ?? ""}
            src={item.mark.src}
            className="block size-10 rounded-md object-contain"
          />
        ) : (
          <div className="inline-flex size-10 items-center justify-center text-text-primary" aria-hidden="true">
            <PhIcon icon={item.mark.icon} size={40} weight={item.mark.weight} />
          </div>
        )}

        <NameLabel
          leadingIcon={undefined}
          label={item.title.label}
          decorators={item.title.decorators}
        />

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

        {item.description ? <div className="max-w-[800px]">{item.description}</div> : null}

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
    </div>
  );
}

