"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { useResponsive } from "@/components/Responsive";

import { SectionTabs, type SectionTab } from "./SectionTabs";
import { SectionTitle } from "./SectionTitle";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SectionSmallScreenOverflowX = "none" | "cards";

function useHorizontalOverflowFades(
  viewportRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  const [canFadeRight, setCanFadeRight] = React.useState(false);
  const [canFadeLeft, setCanFadeLeft] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) {
      setCanFadeLeft(false);
      setCanFadeRight(false);
      return;
    }

    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      // Small epsilon to avoid flicker from subpixel rounding.
      const eps = 1;
      const left = el.scrollLeft > eps;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - eps;
      setCanFadeLeft(left);
      setCanFadeRight(right);
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
  }, [viewportRef, enabled]);

  return { canFadeLeft, canFadeRight };
}

type SectionBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  className?: string;
  /** Optional RHS header content (secondary actions / menus). */
  headerRight?: React.ReactNode;
};

export type SectionDefaultProps = SectionBaseProps & {
  mode?: "default";
  title: React.ReactNode;
  /** When provided, the title is rendered as a link (Figma linked-title variant). */
  titleHref?: string;
  /**
   * Opt-in: on small screens, allow section content to scroll horizontally with gradient edge fades.
   * Intended for left-to-right card rows/grids.
   */
  smallScreenOverflowX?: SectionSmallScreenOverflowX;
  /**
   * Optional description under the title.
   * Note: descriptions do not appear in tab mode (Figma).
   */
  description?: React.ReactNode;
  children: React.ReactNode;
};

export type SectionTabItem = SectionTab & {
  content: React.ReactNode;
};

export type SectionTabModeProps = SectionBaseProps & {
  mode: "tabs";
  tabs: SectionTabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (tabId: string) => void;
  /**
   * Optional description under the tabs.
   *
   * Note: descriptions do not appear in tab mode in Figma, but we support it
   * for flexibility. Prefer avoiding it unless needed.
   */
  description?: React.ReactNode;
};

export type SectionProps = SectionDefaultProps | SectionTabModeProps;

function SectionTabsMode({
  className,
  headerRight,
  tabs,
  value,
  defaultValue,
  onValueChange,
  description,
  ...divProps
}: Omit<SectionTabModeProps, "mode">) {
  const idBase = React.useId();
  const isControlled = value !== undefined;
  const firstId = tabs[0]?.id ?? "";
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? firstId,
  );
  const selectedId = isControlled ? String(value) : uncontrolledValue;

  const selectedTab = tabs.find((t) => t.id === selectedId) ?? tabs[0];

  const setSelected = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div {...divProps} className={cx("flex w-full flex-col gap-mid", className)}>
      <div className="flex w-full flex-col gap-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <SectionTabs
            idBase={idBase}
            tabs={tabs}
            value={selectedTab?.id ?? ""}
            onValueChange={setSelected}
          />
          {description ? (
            <div className="max-w-[800px]">
              <p className="min-w-0 text-paragraph leading-5 text-text-secondary line-clamp-3">
                {description}
              </p>
            </div>
          ) : null}
        </div>
        {headerRight ? (
          <div className="flex shrink-0 items-center gap-mid sm:pt-px">
            {headerRight}
          </div>
        ) : null}
      </div>
      <div className="w-full">
        {tabs.map((t) => (
          <div
            key={t.id}
            id={`${idBase}-panel-${t.id}`}
            role="tabpanel"
            aria-labelledby={`${idBase}-tab-${t.id}`}
            hidden={t.id !== (selectedTab?.id ?? "")}
          >
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionDefaultMode({
  className,
  headerRight,
  title,
  titleHref,
  smallScreenOverflowX = "none",
  description,
  children,
  ...divProps
}: Omit<SectionDefaultProps, "mode">) {
  const { isSmallScreen } = useResponsive();
  const enableHorizontalScroll = isSmallScreen && smallScreenOverflowX === "cards";
  const pathname = usePathname();
  const isDatabricksOneRoute = pathname.startsWith("/one") || pathname.startsWith("/databricks-one");
  const fadeFromClass = isDatabricksOneRoute ? "from-background-shell" : "from-background-primary";

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const { canFadeLeft, canFadeRight } = useHorizontalOverflowFades(
    viewportRef,
    enableHorizontalScroll,
  );

  return (
    <div {...divProps} className={cx("flex w-full flex-col gap-mid", className)}>
      <div className="flex w-full flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-[2px]">
          <SectionTitle href={titleHref}>{title}</SectionTitle>
          {description ? (
            <div className="max-w-[800px]">
              <p className="min-w-0 text-paragraph leading-5 text-text-secondary line-clamp-3">
                {description}
              </p>
            </div>
          ) : null}
        </div>
        {headerRight ? (
          <div className="flex shrink-0 items-center gap-mid sm:pt-px">
            {headerRight}
          </div>
        ) : null}
      </div>
      {enableHorizontalScroll ? (
        <div className="relative w-full min-w-0">
          <div
            ref={viewportRef}
            className={cx(
              "overflow-x-auto overflow-y-hidden",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {children}
          </div>

          {canFadeLeft ? (
            <div
              className={cx(
                "pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r to-transparent",
                fadeFromClass,
              )}
            />
          ) : null}
          {canFadeRight ? (
            <div
              className={cx(
                "pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l to-transparent",
                fadeFromClass,
              )}
            />
          ) : null}
        </div>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}

export function Section(props: SectionProps) {
  if (props.mode === "tabs") {
    const { mode: _mode, ...rest } = props;
    void _mode;
    return <SectionTabsMode {...rest} />;
  }

  const { mode: _mode, ...rest } = props;
  void _mode;
  return <SectionDefaultMode {...(rest as Omit<SectionDefaultProps, "mode">)} />;
}

