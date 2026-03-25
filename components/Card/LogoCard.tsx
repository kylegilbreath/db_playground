"use client";

import * as React from "react";

import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { Tag } from "@/components/Tag";

import type { CardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type LogoCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: CardItem;
};

export function LogoCard({ item, className, ...rest }: LogoCardProps) {
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
        {item.logo ? (
          // Logos are provided by product/consumers; `<img>` is appropriate here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={item.logo.alt ?? ""}
            src={item.logo.src}
            className="block size-10 rounded-md object-contain"
          />
        ) : null}

        <NameLabel
          leadingIcon={item.logo ? undefined : item.title.leadingIcon}
          label={item.title.label}
          decorators={item.title.decorators}
        />

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
          <div className="max-w-[800px]">{item.description}</div>
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
    </div>
  );
}

