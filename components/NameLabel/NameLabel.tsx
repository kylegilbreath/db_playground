"use client";

import * as React from "react";

import { Icon } from "@/components/icons";
import { Popularity } from "@/components/Popularity";
import { Tag, type TagColor } from "@/components/Tag";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type NameLabelDecorator =
  | {
      kind: "certified" | "favorited" | "trending" | "shared" | "pinned" | "popular";
      /** Optional tooltip text override. */
      tooltip?: string;
      /** Optional accessible name override. */
      ariaLabel?: string;
    }
  | {
      kind: "tag";
      label: React.ReactNode;
      color?: TagColor;
    }
  | {
      kind: "custom";
      icon: React.ReactNode;
      tooltip?: string;
      ariaLabel?: string;
    };

export type NameLabelProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Leading icon that represents the item type. */
  leadingIcon?: React.ReactNode;
  /** Primary label text. Truncates with ellipsis as needed. */
  label: React.ReactNode;
  /** 0+ trailing “signal” icons (certified, trending, etc.). */
  decorators?: NameLabelDecorator[];
};

type BuiltInDecoratorKind = "certified" | "favorited" | "trending" | "shared" | "pinned" | "popular";

function getDecoratorIcon(kind: BuiltInDecoratorKind) {
  switch (kind) {
    case "certified":
      return <Icon name="CertifiedFillIcon" size={15} />;
    case "favorited":
      return <Icon name="starFillIcon" size={15} />;
    case "trending":
      return <Icon name="trendingIcon" size={15} />;
    case "shared":
      return <Icon name="userGroupFillIcon" size={15} />;
    case "pinned":
      return <Icon name="pinFilledIcon" size={15} />;
    case "popular":
      return <Popularity level={4} size={15} />;
  }
}

function getDefaultTooltip(kind: BuiltInDecoratorKind) {
  switch (kind) {
    case "certified":
      return "Certified";
    case "favorited":
      return "Favorited";
    case "trending":
      return "Trending";
    case "shared":
      return "Shared";
    case "pinned":
      return "Pinned";
    case "popular":
      return "Popular";
  }
}

function getDecoratorColorClass(kind: BuiltInDecoratorKind | "custom") {
  switch (kind) {
    case "certified":
      return "text-signal-icon-certified";
    case "favorited":
      return "text-signal-icon-favorited";
    case "trending":
      return "text-signal-icon-trending";
    case "shared":
      return "text-signal-icon-shared";
    case "pinned":
      return "text-signal-icon-pinned";
    case "popular":
      return undefined;
    case "custom":
      return "text-text-secondary";
  }
}

export function NameLabel({ leadingIcon, label, decorators, className, ...rest }: NameLabelProps) {
  const items = decorators ?? [];
  const hasLeadingIcon = Boolean(leadingIcon);

  return (
    <div
      {...rest}
      className={cx(
        "flex w-full min-w-0 items-center",
        hasLeadingIcon && "gap-sm",
        className,
      )}
    >
      {hasLeadingIcon ? (
        <span
          className="inline-flex min-h-4 min-w-4 shrink-0 items-center justify-center text-text-primary"
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
        <div className="flex w-full min-w-0 items-center gap-xs">
          <span className="min-w-0 truncate text-paragraph font-medium leading-5 text-text-primary">
            {label}
          </span>

          {items.length > 0 ? (
            <span className="inline-flex shrink-0 items-center justify-center gap-xs">
              {items.map((d, idx) => {
                if (d.kind === "tag") {
                  return (
                    <span key={`tag-${idx}`} className="shrink-0">
                      <Tag color={d.color ?? "Indigo"}>{d.label}</Tag>
                    </span>
                  );
                }

                const tooltip =
                  d.tooltip ?? (d.kind === "custom" ? undefined : getDefaultTooltip(d.kind));
                const ariaLabel =
                  d.ariaLabel ?? tooltip;
                const colorClass = getDecoratorColorClass(d.kind);
                const icon = d.kind === "custom" ? d.icon : getDecoratorIcon(d.kind);

                // Important: apply the signal color directly to the Icon element.
                // Some browsers can behave unexpectedly with inherited `color` when using CSS masks.
                const normalizedIcon =
                  React.isValidElement(icon) && icon.type === Icon
                    ? React.cloneElement(
                        icon as React.ReactElement<React.ComponentProps<typeof Icon>>,
                        {
                          size: 15,
                          className: cx((icon.props as { className?: string }).className, colorClass),
                        },
                      )
                    : icon;

                // We don't have a tooltip primitive yet; use `title` for now.
                return (
                  <span
                    // Stable ordering is important; also allow repeated kinds.
                    key={`${d.kind}-${idx}`}
                    className={cx(
                      "inline-flex size-[15px] items-center justify-center overflow-hidden",
                    )}
                    title={tooltip}
                    aria-label={ariaLabel}
                  >
                    {normalizedIcon}
                  </span>
                );
              })}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

