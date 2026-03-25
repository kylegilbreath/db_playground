"use client";

import * as React from "react";

import { Tag, type TagColor, type TagLeftElement } from "@/components/Tag";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type TableTagListItem = {
  id: string;
  label: React.ReactNode;
  color?: TagColor;
  leftElement?: TagLeftElement;
};

export type TableTagListProps = {
  className?: string;
  tags: TableTagListItem[];
  overflowLabel?: (hiddenCount: number) => React.ReactNode;
};

function parsePx(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function computeVisibleCount({
  containerWidth,
  tagWidths,
  overflowWidthsByHiddenCount,
  overflowWidthsWithSpacerByHiddenCount,
  prefixHasLeftElement,
  gapPx,
}: {
  containerWidth: number;
  tagWidths: number[];
  overflowWidthsByHiddenCount: Map<number, number>;
  overflowWidthsWithSpacerByHiddenCount: Map<number, number>;
  /** prefixHasLeftElement[n] indicates whether tags[0..n) include a leftElement. */
  prefixHasLeftElement: boolean[];
  gapPx: number;
}) {
  const total = tagWidths.length;
  if (total === 0) return 0;
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return total;

  const prefixSum: number[] = new Array(total + 1).fill(0);
  for (let i = 0; i < total; i++) prefixSum[i + 1] = prefixSum[i]! + (tagWidths[i] ?? 0);

  // Try to keep as many tags as possible.
  for (let visible = total; visible >= 0; visible--) {
    const hidden = total - visible;
    const tagsWidth = prefixSum[visible] ?? 0;
    const tagsGaps = visible > 1 ? gapPx * (visible - 1) : 0;

    if (hidden === 0) {
      if (tagsWidth + tagsGaps <= containerWidth) return visible;
      continue;
    }

    // We need one more gap between the last visible tag and the overflow tag (if any visible).
    const overflowGap = visible > 0 ? gapPx : 0;
    const needsSpacer = visible > 0 ? (prefixHasLeftElement[visible] ?? false) : false;
    const overflowWidths = needsSpacer
      ? overflowWidthsWithSpacerByHiddenCount
      : overflowWidthsByHiddenCount;
    const overflowWidth =
      overflowWidths.get(hidden) ??
      // Fallback: use the widest (+total) measurement if specific one isn't available.
      overflowWidths.get(total) ??
      0;

    const required = tagsWidth + tagsGaps + overflowGap + overflowWidth;
    if (required <= containerWidth) return visible;
  }

  return 0;
}

export function TableTagList({
  className,
  tags,
  overflowLabel = (n) => `+${n}`,
}: TableTagListProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [gapPx, setGapPx] = React.useState(0);
  const [tagWidths, setTagWidths] = React.useState<number[]>([]);
  const [overflowWidthsByHiddenCount, setOverflowWidthsByHiddenCount] = React.useState<
    Map<number, number>
  >(() => new Map());
  const [overflowWidthsWithSpacerByHiddenCount, setOverflowWidthsWithSpacerByHiddenCount] =
    React.useState<Map<number, number>>(() => new Map());

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const rowEl = rowRef.current;
    const measureEl = measureRef.current;
    if (!rowEl || !measureEl) return;

    const computed = window.getComputedStyle(rowEl);
    const nextGap = parsePx(computed.columnGap || computed.gap || "0");
    setGapPx(nextGap);

    const nextTagWidths: number[] = [];
    const tagNodes = Array.from(measureEl.querySelectorAll<HTMLElement>("[data-ttl-tag]"));
    for (const node of tagNodes) {
      const idx = Number.parseInt(node.dataset.ttlTag ?? "", 10);
      if (!Number.isFinite(idx)) continue;
      nextTagWidths[idx] = node.getBoundingClientRect().width;
    }

    const nextOverflow = new Map<number, number>();
    const nextOverflowWithSpacer = new Map<number, number>();
    const overflowNodes = Array.from(
      measureEl.querySelectorAll<HTMLElement>("[data-ttl-overflow]"),
    );
    for (const node of overflowNodes) {
      const hidden = Number.parseInt(node.dataset.ttlOverflow ?? "", 10);
      if (!Number.isFinite(hidden)) continue;
      nextOverflow.set(hidden, node.getBoundingClientRect().width);
    }

    const overflowSpacerNodes = Array.from(
      measureEl.querySelectorAll<HTMLElement>("[data-ttl-overflow-spacer]"),
    );
    for (const node of overflowSpacerNodes) {
      const hidden = Number.parseInt(node.dataset.ttlOverflowSpacer ?? "", 10);
      if (!Number.isFinite(hidden)) continue;
      nextOverflowWithSpacer.set(hidden, node.getBoundingClientRect().width);
    }

    // Normalize sparse arrays.
    const normalized = Array.from({ length: tags.length }).map((_, i) => nextTagWidths[i] ?? 0);
    setTagWidths(normalized);
    setOverflowWidthsByHiddenCount(nextOverflow);
    setOverflowWidthsWithSpacerByHiddenCount(nextOverflowWithSpacer);
  }, [tags]);

  const prefixHasLeftElement = React.useMemo(() => {
    const acc: boolean[] = new Array(tags.length + 1).fill(false);
    for (let i = 0; i < tags.length; i++) {
      acc[i + 1] = acc[i] || Boolean(tags[i]?.leftElement);
    }
    return acc;
  }, [tags]);

  const visibleCount = React.useMemo(() => {
    return computeVisibleCount({
      containerWidth,
      tagWidths,
      overflowWidthsByHiddenCount,
      overflowWidthsWithSpacerByHiddenCount,
      prefixHasLeftElement,
      gapPx,
    });
  }, [
    containerWidth,
    tagWidths,
    overflowWidthsByHiddenCount,
    overflowWidthsWithSpacerByHiddenCount,
    prefixHasLeftElement,
    gapPx,
  ]);

  const hiddenCount = Math.max(0, tags.length - visibleCount);
  const visibleTags = tags.slice(0, visibleCount);
  const needsOverflowSpacer = visibleTags.some((t) => Boolean(t.leftElement));

  return (
    <div ref={containerRef} className={cx("relative min-w-0", className)}>
      <div
        ref={rowRef}
        className="flex min-w-0 items-center gap-xs overflow-hidden whitespace-nowrap"
      >
        {visibleTags.map((t) => (
          <div key={t.id} className="shrink-0">
            <Tag color={t.color} leftElement={t.leftElement}>
              {t.label}
            </Tag>
          </div>
        ))}

        {hiddenCount > 0 ? (
          <div className="inline-flex w-fit shrink-0">
            <Tag
              leftElement={
                needsOverflowSpacer
                  ? {
                      type: "Icon",
                      icon: (
                        <span className="block size-2 rounded-full bg-current opacity-0" />
                      ),
                    }
                  : undefined
              }
            >
              {overflowLabel(hiddenCount)}
            </Tag>
          </div>
        ) : null}
      </div>

      {/* Hidden measurement row: same Tag rendering, offscreen/transparent. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 overflow-hidden opacity-0"
      >
        <div className="flex items-center gap-xs whitespace-nowrap">
          {tags.map((t, idx) => (
            <div key={t.id} data-ttl-tag={String(idx)} className="shrink-0">
              <Tag color={t.color} leftElement={t.leftElement}>
                {t.label}
              </Tag>
            </div>
          ))}

          {/* Pre-measure +N tags for each possible hidden count (1..N). */}
          {Array.from({ length: tags.length }).map((_, i) => {
            const hidden = i + 1;
            return (
              <div key={`overflow-${hidden}`} data-ttl-overflow={String(hidden)} className="shrink-0">
                <Tag>{overflowLabel(hidden)}</Tag>
              </div>
            );
          })}

          {Array.from({ length: tags.length }).map((_, i) => {
            const hidden = i + 1;
            return (
              <div
                key={`overflow-spacer-${hidden}`}
                data-ttl-overflow-spacer={String(hidden)}
                className="shrink-0"
              >
                <Tag
                  leftElement={{
                    type: "Icon",
                    icon: <span className="block size-2 rounded-full bg-current opacity-0" />,
                  }}
                >
                  {overflowLabel(hidden)}
                </Tag>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

