"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type CustomTextWidgetAction = {
  id: string;
  ariaLabel: string;
  iconName: string;
  onClick?: () => void;
  disabled?: boolean;
};

type CollapsibleModeProps = {
  mode?: "collapsible";
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Uncontrolled initial expanded state. */
  defaultExpanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  /** Collapsed height in px. Defaults to 200 (matches Figma collapsed frame height). */
  collapsedHeightPx?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
};

type PreviewModeProps = {
  mode: "preview";
  /** Preview height in px. Defaults to 296 (matches Figma preview frame height). */
  previewHeightPx?: number;
  seeMoreLabel?: string;
  onSeeMore?: () => void;
};

export type CustomTextWidgetProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: string;
  actions?: CustomTextWidgetAction[];
  children: React.ReactNode;
} & (CollapsibleModeProps | PreviewModeProps);

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

export function CustomTextWidget(props: CustomTextWidgetProps) {
  const {
    className,
    actions = [],
    children,
    // Destructure collapsible/preview props so they don't leak onto the <div>
    mode,
    // CollapsibleModeProps
    // @ts-expect-error union narrowing — safe to destructure
    expanded: _expanded,
    // @ts-expect-error union narrowing
    defaultExpanded: _defaultExpanded,
    // @ts-expect-error union narrowing
    onExpandedChange: _onExpandedChange,
    // @ts-expect-error union narrowing
    collapsedHeightPx: _collapsedHeightPx,
    // @ts-expect-error union narrowing
    showMoreLabel: _showMoreLabel,
    // @ts-expect-error union narrowing
    showLessLabel: _showLessLabel,
    // PreviewModeProps
    // @ts-expect-error union narrowing
    previewHeightPx: _previewHeightPx,
    // @ts-expect-error union narrowing
    seeMoreLabel: _seeMoreLabel,
    // @ts-expect-error union narrowing
    onSeeMore: _onSeeMore,
    ...rest
  } = props;

  const isPreview = props.mode === "preview";
  const collapsible = isPreview ? null : (props as CustomTextWidgetProps & CollapsibleModeProps);
  const preview = isPreview ? (props as CustomTextWidgetProps & PreviewModeProps) : null;

  const collapsedHeightPx = collapsible?.collapsedHeightPx ?? 200;
  const previewHeightPx = preview?.previewHeightPx ?? 296;

  const [expanded, setExpanded] = useControllableBool({
    value: collapsible?.expanded,
    defaultValue: collapsible?.defaultExpanded ?? false,
    onChange: collapsible?.onExpandedChange,
  });

  const showMoreLabel = collapsible?.showMoreLabel ?? "Show more";
  const showLessLabel = collapsible?.showLessLabel ?? "Show less";
  const seeMoreLabel = preview?.seeMoreLabel ?? "See more";

  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const surfaceRef = React.useRef<HTMLDivElement | null>(null);

  const [animatedHeight, setAnimatedHeight] = React.useState<number | "auto">(() => {
    if (isPreview) return previewHeightPx;
    return collapsible?.defaultExpanded ? "auto" : collapsedHeightPx;
  });

  // Animate between a fixed collapsed height and the full content height (like AiOverview).
  React.useLayoutEffect(() => {
    if (isPreview) return;
    const outer = outerRef.current;
    const surface = surfaceRef.current;
    if (!outer || !surface) return;

    // Freeze current height to start the transition.
    const startHeight = outer.getBoundingClientRect().height;
    setAnimatedHeight(startHeight);

    // Then transition to the next height on the next frame.
    requestAnimationFrame(() => {
      const expandedHeight = surface.scrollHeight + BORDER_FRAME_PX * 2;
      setAnimatedHeight(expanded ? expandedHeight : collapsedHeightPx);
    });
  }, [collapsedHeightPx, expanded, isPreview]);

  const showFooterFade = isPreview || !expanded;

  return (
    <div
      {...rest}
      className={cx(
        "relative w-full overflow-hidden",
        "rounded-[16px] border border-border bg-background-primary",
        "shadow-[var(--elevation-shadow-xs)] transition-shadow",
        !isPreview && "transition-[height] duration-300 ease-out motion-reduce:transition-none",
        className,
      )}
      style={{
        ...(animatedHeight === "auto" ? {} : { height: `${animatedHeight}px` }),
        ...rest.style,
      }}
      ref={outerRef}
      onTransitionEnd={(e) => {
        if (isPreview) return;
        if (e.propertyName !== "height") return;
        if (expanded) setAnimatedHeight("auto");
      }}
    >
      <div
        className={cx(
          "relative flex h-full w-full flex-col overflow-hidden p-md",
          showFooterFade && "h-full",
        )}
        ref={surfaceRef}
      >
        {actions.length > 0 ? (
          <div className="absolute right-[15px] top-[15px] z-10 flex items-center gap-xs">
            {actions.map((a) => (
              <IconButton
                key={a.id}
                aria-label={a.ariaLabel}
                icon={<Icon name={a.iconName} size={16} />}
                size="small"
                tone="neutral"
                disabled={a.disabled}
                onClick={a.onClick}
              />
            ))}
          </div>
        ) : null}

        <div className="min-w-0 flex-1">{children}</div>

        {!isPreview && expanded ? (
          <div className="mt-md flex w-full justify-center">
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
              <span>{showLessLabel}</span>
              <Icon name="chevronUpIcon" size={16} className="text-action-default-icon-default" />
            </button>
          </div>
        ) : null}

        {showFooterFade ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background-primary to-transparent">
            <div className="pointer-events-auto absolute inset-0 flex items-center justify-center">
              {isPreview ? (
                <DefaultButton radius="full" onClick={preview?.onSeeMore}>
                  {seeMoreLabel}
                </DefaultButton>
              ) : (
                <DefaultButton menu radius="full" onClick={() => setExpanded(true)}>
                  {showMoreLabel}
                </DefaultButton>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

