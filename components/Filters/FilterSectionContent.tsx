"use client";

import * as React from "react";

import { FilterChip, type FilterChipProps } from "@/components/FilterChip";
import { TertiaryButton } from "@/components/TertiaryButton";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type FilterSectionChipItem = Pick<
  FilterChipProps,
  "label" | "leadingIcon" | "kind" | "applied" | "defaultApplied" | "onAppliedChange" | "disabled"
> & {
  id: string;
  className?: string;
};

export type FilterSectionContentProps = {
  className?: string;

  /** Optional search control shown at top of section content. */
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchValueChange?: (next: string) => void;

  chips: FilterSectionChipItem[];

  /**
   * If provided, content will render in a “show less / show more” mode.
   * When `showAll` is false, we only show the first `collapsedVisibleCount` chips.
   */
  collapsedVisibleCount?: number;
  showAll?: boolean;
  onShowAllChange?: (next: boolean) => void;
};

export function FilterSectionContent({
  className,
  searchPlaceholder = "Search",
  searchValue,
  onSearchValueChange,
  chips,
  collapsedVisibleCount = 8,
  showAll = false,
  onShowAllChange,
}: FilterSectionContentProps) {
  const showSearch = typeof onSearchValueChange === "function";

  const visible =
    onShowAllChange && !showAll ? chips.slice(0, collapsedVisibleCount) : chips;
  const canToggle = Boolean(onShowAllChange) && chips.length > collapsedVisibleCount;

  return (
    <div className={cx("flex w-full flex-col items-start", className)}>
      {showSearch ? (
        <input
          className={cx(
            "h-8 w-full rounded-sm border border-border bg-background-primary px-sm",
            "text-paragraph leading-5 text-text-primary",
            "placeholder:text-text-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
          )}
          placeholder={searchPlaceholder}
          value={searchValue ?? ""}
          onChange={(e) => onSearchValueChange?.(e.target.value)}
        />
      ) : null}

      <div className={cx("mt-sm flex w-full flex-wrap gap-sm", !showSearch && "mt-0")}>
        {visible.map((c) => (
          <FilterChip
            key={c.id}
            label={c.label}
            leadingIcon={c.leadingIcon}
            kind={c.kind}
            applied={c.applied}
            defaultApplied={c.defaultApplied}
            onAppliedChange={c.onAppliedChange}
            disabled={c.disabled}
            className={cx(c.className)}
          />
        ))}
      </div>

      {canToggle ? (
        <TertiaryButton
          className="mt-2"
          size="small"
          onClick={() => onShowAllChange?.(!showAll)}
        >
          {showAll ? "Show less" : "Show more"}
        </TertiaryButton>
      ) : null}
    </div>
  );
}

