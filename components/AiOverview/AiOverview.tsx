"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { Tag } from "@/components/Tag/Tag";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const COLLAPSED_HEIGHT_PX = 200;
const BORDER_FRAME_PX = 1;

function useControllableBool({
  value,
  defaultValue,
  onChange,
}: {
  value: boolean | undefined;
  defaultValue: boolean;
  onChange?: (next: boolean) => void;
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = isControlled ? Boolean(value) : uncontrolled;
  const set = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set] as const;
}

export type AiOverviewRef = {
  id: string;
  label: string;
};

export type AiOverviewProps = {
  className?: string;
  /** Formatted overview content. Caller provides markup. */
  children: React.ReactNode;
  /** Optional reference tags rendered under the content. */
  refs?: AiOverviewRef[];
  /** Optional follow-up UI rendered inside the card when expanded. */
  followUp?: React.ReactNode;

  /** Expanded state (controlled). */
  expanded?: boolean;
  /** Expanded state (uncontrolled). */
  defaultExpanded?: boolean;
  /** Called when expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * When true, show a collapse control when expanded.
   * Default: false (matches Figma frames where “Show more” appears only when collapsed).
   */
  showCollapseButton?: boolean;

  /** Feedback callbacks (optional). */
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;

  /** Disclaimer text shown in the footer. */
  disclaimer?: string;
};

export function AiOverview({
  className,
  children,
  refs,
  followUp,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  showCollapseButton = false,
  onThumbsUp,
  onThumbsDown,
  disclaimer = "Always review the accuracy of responses.",
}: AiOverviewProps) {
  const [isExpanded, setExpanded] = useControllableBool({
    value: expanded,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  });

  const collapsed = !isExpanded;
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const [animatedHeight, setAnimatedHeight] = React.useState<number | "auto">(
    defaultExpanded ? "auto" : COLLAPSED_HEIGHT_PX,
  );

  // Animate between a fixed collapsed height and the full content height.
  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const surface = surfaceRef.current;
    if (!outer || !surface) return;

    // Freeze current height to start the transition.
    const startHeight = outer.getBoundingClientRect().height;
    setAnimatedHeight(startHeight);

    // Then transition to the next height on the next frame.
    requestAnimationFrame(() => {
      const expandedHeight = surface.scrollHeight + BORDER_FRAME_PX * 2;
      setAnimatedHeight(isExpanded ? expandedHeight : COLLAPSED_HEIGHT_PX);
    });
  }, [isExpanded]);

  const outerStyle: React.CSSProperties = {
    background:
      "var(--ai-gradient, linear-gradient(45deg, #4299e0 24%, #ca42e0 47%, #ff5f46 76%))",
    ...(animatedHeight === "auto" ? {} : { height: `${animatedHeight}px` }),
  };

  return (
    <div
      className={cx(
        // Gradient frame (1px) for the AI border.
        "relative w-full overflow-hidden rounded-[16px] p-[1px]",
        "transition-[height] duration-300 ease-out",
        className,
      )}
      style={outerStyle}
      ref={outerRef}
      onTransitionEnd={(e) => {
        if (e.propertyName !== "height") return;
        if (isExpanded) setAnimatedHeight("auto");
      }}
    >
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-[15px] bg-background-primary",
          "flex flex-col",
          collapsed && "h-full",
          isExpanded ? "gap-md" : "gap-sm",
          "p-[18px]",
        )}
        ref={surfaceRef}
      >
        <div className="w-full text-paragraph leading-5 text-text-primary">
          {children}
        </div>

        {refs && refs.length ? (
          <div className="flex flex-wrap items-center gap-[11px]">
            {refs.map((r) => (
              <Tag
                key={r.id}
                leftElement={{ type: "Icon", icon: <Icon name="tableIcon" size={16} /> }}
              >
                {r.label}
              </Tag>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex h-6 w-full items-center justify-between">
          <div className="flex items-center gap-xs">
            <IconButton
              aria-label="Thumbs up"
              icon={<Icon name="ThumbsUpIcon" size={16} />}
              onClick={onThumbsUp}
              size="small"
            />
            <IconButton
              aria-label="Thumbs down"
              icon={<Icon name="ThumbsDownIcon" size={16} />}
              onClick={onThumbsDown}
              size="small"
            />
          </div>

          <p className="text-hint leading-4 text-text-secondary">{disclaimer}</p>
        </div>

        {isExpanded && followUp ? <div className="w-full">{followUp}</div> : null}

        {isExpanded && showCollapseButton ? (
          <div className="flex w-full justify-center">
            <button
              className={cx(
                "inline-flex h-8 items-center gap-xs overflow-clip rounded-full border border-border bg-background-primary px-mid",
                "text-paragraph leading-5 text-action-default-text-default",
                "hover:bg-action-default-background-hover hover:border-action-default-border-hover hover:text-action-default-text-hover",
                "active:bg-action-default-background-press active:border-action-default-border-press active:text-action-default-text-press",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
              )}
              onClick={() => setExpanded(false)}
              type="button"
            >
              <span>Show less</span>
              <Icon name="chevronUpIcon" size={16} className="text-action-default-icon-default" />
            </button>
          </div>
        ) : null}

        {/* Collapsed fade + show more affordance (clipped inside surface radius) */}
        {collapsed ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background-primary to-transparent">
            <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
              <DefaultButton menu onClick={() => setExpanded(true)} radius="full">
                Show more
              </DefaultButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

