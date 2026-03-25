"use client";

import * as React from "react";

import { CardThumbnail } from "@/components/CardThumbnail";
import { CodeBlock } from "@/components/CodeBlock";
import { IndentedTextSnippet } from "@/components/IndentedTextSnippet";
import { MetadataItem, MetadataRow } from "@/components/Metadata";
import { NameLabel } from "@/components/NameLabel";
import { Tag } from "@/components/Tag";

import type { CardItem } from "./types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type DetailCardProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  item: CardItem;
  /**
   * Optional right-side thumbnail shown in the “detail card with thumbnail” variants.
   * When omitted, the card is content-only.
   */
  thumbnailPlacement?: "right" | "none";
  /**
   * Visual style variant.
   * - `default`: matches the current design (border + hover elevation)
   * - `borderless`: removes the outer border (keeps background + radius + hover elevation)
   */
  variant?: "default" | "borderless";
};

export function DetailCard({
  item,
  thumbnailPlacement = item.thumbnail ? "right" : "none",
  variant = "default",
  className,
  ...rest
}: DetailCardProps) {
  const hasThumbnail = thumbnailPlacement === "right" && Boolean(item.thumbnail);

  return (
    <div
      {...rest}
      className={cx(
        "flex w-full items-start gap-[12px] overflow-hidden",
        "rounded-[16px] bg-background-primary p-md",
        variant === "borderless" ? undefined : "border border-border",
        // Default cards have the smallest resting elevation; borderless is intentionally shadowless.
        variant === "borderless" ? undefined : "shadow-[var(--elevation-shadow-xs)]",
        variant === "borderless" ? "hover:bg-background-secondary" : undefined,
        variant === "borderless" ? "transition-colors" : "transition-shadow",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex min-w-0 items-center gap-sm">
          <div className="min-w-0 flex-1">
            <NameLabel
              leadingIcon={item.title.leadingIcon}
              label={item.title.label}
              decorators={item.title.decorators}
            />
          </div>
        </div>

        <div className="flex w-full min-w-0 items-start">
          {/* Spacer to align metadata under the label (matches Figma). */}
          <div className="shrink-0 self-stretch w-[24px]" aria-hidden="true" />

          <div className="flex min-w-0 flex-1 flex-col gap-sm">
            {item.locationRow && item.locationRow.length > 0 ? (
              <MetadataRow>
                {item.locationRow.map((m, idx) => (
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
              <div className="max-w-[800px] text-hint text-text-secondary">
                {item.description}
              </div>
            ) : null}

            {item.indentedSnippet ? (
              <IndentedTextSnippet>
                {item.indentedSnippet}
              </IndentedTextSnippet>
            ) : null}

            {item.codeSnippet ? (
              <CodeBlock
                code={item.codeSnippet.code}
                language={item.codeSnippet.language}
                highlightedTokens={item.codeSnippet.highlightedTokens}
                showMenu={false}
                actionsPlacement="none"
                showLineNumbers
                wrap={false}
                allowHorizontalScroll={false}
                maxVisibleLines={null}
                className="rounded-md border-0"
              />
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
      </div>

      {hasThumbnail && item.thumbnail ? (
        <div className="shrink-0 self-start">
          <CardThumbnail
            {...item.thumbnail}
            {...(item.thumbnail.variant === "image"
              ? { sizes: item.thumbnail.sizes ?? "200px" }
              : null)}
            className={cx(
              // Detail card thumbnail container in Figma is fixed width.
              "h-[112px] w-[200px]",
              item.thumbnail.className,
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

