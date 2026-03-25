"use client";

import * as React from "react";

import { CardThumbnail } from "@/components/CardThumbnail";
import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { Tag } from "@/components/Tag";

import type { ThumbnailCardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type ThumbnailCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: ThumbnailCardItem;
};

/**
 * ThumbnailCard
 *
 * Card with a required top thumbnail region (104px).
 * Used for dashboard previews, placeholders, snippets, etc.
 */
export function ThumbnailCard({ item, className, ...rest }: ThumbnailCardProps) {
  return (
    <div
      {...rest}
      className={cx(
        "flex w-full flex-col overflow-hidden",
        "rounded-[16px] border border-border bg-background-primary",
        "shadow-[var(--elevation-shadow-xs)] transition-shadow",
        className,
      )}
    >
      <CardThumbnail
        {...item.thumbnail}
        {...(item.thumbnail.variant === "image"
          ? { sizes: item.thumbnail.sizes ?? "(max-width: 640px) 100vw, 320px" }
          : null)}
        className={cx(
          // In this card type the thumbnail is full width.
          "h-[104px] w-full",
          item.thumbnail.className,
        )}
      />

      <div className="flex w-full flex-col gap-sm p-md">
        <NameLabel
          leadingIcon={item.title.leadingIcon}
          label={item.title.label}
          decorators={item.title.decorators}
        />

        {item.subtitle ? (
          <div className="text-hint leading-4 text-text-secondary">{item.subtitle}</div>
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

        {item.description ? (
          <div className="text-hint leading-4 text-text-secondary line-clamp-2">
            {item.description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

