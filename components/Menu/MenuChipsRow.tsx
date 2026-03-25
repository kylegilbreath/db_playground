"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { FilterChip, type FilterChipProps } from "@/components/FilterChip";
import { FilterChipToggle, type FilterChipToggleProps } from "@/components/FilterChipToggle";
import { IconButton } from "@/components/IconButton";
import { TertiaryButton } from "@/components/TertiaryButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type MenuChipItem = {
  id: string;
  label: string;
  kind?: FilterChipProps["kind"];
  leadingIcon?: React.ReactNode;
  className?: string;
  /**
   * Whether this chip is applied/selected.
   * This component will render applied chips first (presentational ordering only).
   */
  applied?: boolean;
  disabled?: boolean;
  onClick?: FilterChipProps["onClick"];
  onAppliedChange?: FilterChipProps["onAppliedChange"];
};

export type MenuChipsRowForceOverflow = "none" | "left" | "right" | "both";

export type MenuChipsRowProps = {
  className?: string;

  /** Filter-toggle chip (sliders icon + optional applied count badge). */
  filterToggleProps?: Omit<FilterChipToggleProps, "type">;

  /**
   * Whether any filters are applied.
   *
   * Note: `appliedCount` is the preferred source of truth for showing both the count badge
   * and the Reset button (per current design). We keep `hasFiltersApplied` to support future
   * states where a badge may be shown without a reliable count (or for compatibility with
   * `FilterChipToggle`’s existing API).
   */
  hasFiltersApplied?: boolean;

  /** Applied filter count used for the toggle badge and for showing Reset. */
  appliedCount?: number;

  /** Filter chips to display. */
  chips: MenuChipItem[];

  /** Optional Reset control (renders outside the carousel). */
  onResetFilters?: () => void;

  /** When true, the filter-toggle button (sliders icon) is hidden. */
  hideFilterToggle?: boolean;

  /** Optional element rendered before the chip carousel (e.g. a dropdown chip). */
  leadingElement?: React.ReactNode;

  /**
   * Forces arrow visibility for demos/tests.
   * When omitted, arrows are derived from carousel scroll position + overflow.
   */
  forceOverflow?: MenuChipsRowForceOverflow;
};

function useOverflowPaging(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  forceOverflow?: MenuChipsRowForceOverflow,
) {
  const [canPageLeft, setCanPageLeft] = React.useState(false);
  const [canPageRight, setCanPageRight] = React.useState(false);

  React.useEffect(() => {
    if (forceOverflow) {
      setCanPageLeft(forceOverflow === "left" || forceOverflow === "both");
      setCanPageRight(forceOverflow === "right" || forceOverflow === "both");
      return;
    }

    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      // Small epsilon to avoid flicker from subpixel rounding.
      const eps = 1;
      const left = el.scrollLeft > eps;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - eps;
      setCanPageLeft(left);
      setCanPageRight(right);
    };

    update();

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Update on resize + content changes.
    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [viewportRef, forceOverflow]);

  const pageBy = React.useCallback(
    (dir: -1 | 1) => {
      const el = viewportRef.current;
      if (!el) return;
      // Page by ~80% of the visible width so the user always sees new chips.
      const amount = Math.max(160, Math.floor(el.clientWidth * 0.8));
      el.scrollBy({ left: dir * amount, behavior: "smooth" });
    },
    [viewportRef],
  );

  return { canPageLeft, canPageRight, pageBy };
}

export function MenuChipsRow({
  className,
  filterToggleProps,
  hasFiltersApplied,
  appliedCount,
  chips,
  onResetFilters,
  hideFilterToggle,
  leadingElement,
  forceOverflow,
}: MenuChipsRowProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const { canPageLeft, canPageRight, pageBy } = useOverflowPaging(viewportRef, forceOverflow);
  const pathname = usePathname();
  const isDatabricksOneRoute = pathname.startsWith("/one") || pathname.startsWith("/databricks-one");
  const fadeFromClass = isDatabricksOneRoute ? "from-background-shell" : "from-background-primary";

  // Keep `hasFiltersApplied` for API flexibility, but drive UI from count when present.
  // If `hasFiltersApplied` is true but count is omitted, default to 1 (matches existing
  // `FilterChipToggle` default and avoids a “badge but no number” inconsistency).
  const count = appliedCount ?? (hasFiltersApplied ? 1 : 0);
  const hasApplied = count > 0;

  const { appliedChips, unappliedChips } = React.useMemo(() => {
    const applied: MenuChipItem[] = [];
    const unapplied: MenuChipItem[] = [];
    for (const c of chips) {
      (c.applied ? applied : unapplied).push(c);
    }
    return { appliedChips: applied, unappliedChips: unapplied };
  }, [chips]);

  const ordered = React.useMemo(
    () => [...appliedChips, ...unappliedChips],
    [appliedChips, unappliedChips],
  );

  return (
    <div className={cx("flex w-full items-center gap-sm", className)}>
      {hideFilterToggle ? null : (
        <FilterChipToggle
          aria-label="All filters"
          {...filterToggleProps}
          appliedCount={count}
          hasFiltersApplied={hasApplied}
        />
      )}

      {leadingElement}

      <div className="flex min-w-0 flex-1 items-center gap-sm">
        {canPageLeft ? (
          <IconButton
            aria-label="Scroll filters left"
            className="shrink-0"
            icon={<Icon name="chevronLeftIcon" size={16} />}
            onClick={() => pageBy(-1)}
            radius="full"
          />
        ) : null}

        <div className="relative min-w-0 flex-1">
          {/* Scroll viewport (scrollbar hidden; paging via buttons). */}
          <div
            ref={viewportRef}
            className={cx(
              "flex items-center gap-sm overflow-x-auto overflow-y-hidden",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {ordered.map((c) => (
              <FilterChip
                key={c.id}
                applied={c.applied}
                disabled={c.disabled}
                kind={c.kind}
                label={c.label}
                leadingIcon={c.leadingIcon}
                onAppliedChange={c.onAppliedChange}
                onClick={c.onClick}
                className={cx("shrink-0", c.className)}
              />
            ))}
          </div>

          {/* Edge fades to mimic Figma masks (only when overflow exists). */}
          {canPageLeft ? (
            <div
              className={cx(
                "pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent",
                fadeFromClass,
              )}
            />
          ) : null}
          {canPageRight ? (
            <div
              className={cx(
                "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent",
                fadeFromClass,
              )}
            />
          ) : null}
        </div>

        {canPageRight ? (
          <IconButton
            aria-label="Scroll filters right"
            className="shrink-0"
            icon={<Icon name="chevronRightIcon" size={16} />}
            onClick={() => pageBy(1)}
            radius="full"
          />
        ) : null}
      </div>

      {hasApplied && onResetFilters ? (
        <TertiaryButton onClick={onResetFilters}>Reset filters</TertiaryButton>
      ) : null}
    </div>
  );
}

