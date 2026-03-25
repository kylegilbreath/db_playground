"use client";

import * as React from "react";

import { Icon } from "@/components/icons";
import { Tooltip } from "@/components/Tooltip";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type LeftNavTrailingAction = {
  iconName: string;
  ariaLabel: string;
  onClick: () => void;
};

export type LeftNavItemProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children" | "onClick" | "disabled"
> & {
  iconName?: string;
  selectedIconName?: string;
  /** Override the icon color (Tailwind `text-*` class). Defaults to `text-text-primary`. */
  iconColorClass?: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  variant?: "horizontal" | "stacked" | "icon-only";
  /** When true, use One accent CSS variables for selected/hover backgrounds. */
  useOneAccent?: boolean;
  /** Icon button shown on the right side on hover (horizontal variant only). */
  trailingAction?: LeftNavTrailingAction;
  onClick?: () => void;
};

export function LeftNavItem({
  iconName,
  selectedIconName,
  iconColorClass,
  label,
  selected = false,
  disabled = false,
  variant = "horizontal",
  useOneAccent = false,
  trailingAction,
  className,
  onClick,
  ...rest
}: LeftNavItemProps) {
  const isStacked = variant === "stacked";
  const resolvedIconName = selected && selectedIconName ? selectedIconName : iconName;

  const defaultIconColor = "text-text-primary";
  const iconColor = disabled
    ? cx(defaultIconColor, "group-hover/leftnav:text-action-disabled-text")
    : iconColorClass ?? defaultIconColor;

  const labelColor = disabled
    ? cx("text-text-primary", "group-hover/leftnav:text-action-disabled-text")
    : "text-text-primary";

  if (variant === "icon-only") {
    const iconBg = disabled
      ? "bg-transparent"
      : selected
        ? (useOneAccent ? "bg-[var(--one-accent-bg,var(--background-tertiary))]" : "bg-background-tertiary")
        : (useOneAccent
            ? "bg-transparent hover:bg-[var(--one-accent-bg-hover,var(--background-tertiary))] active:bg-[var(--one-accent-bg-hover,var(--background-tertiary))]"
            : "bg-transparent hover:bg-background-tertiary active:bg-background-tertiary");

    return (
      <Tooltip content={label} side="right">
        <button
          {...rest}
          aria-current={selected ? "page" : undefined}
          aria-label={label}
          className={cx(
            "inline-flex size-8 items-center justify-center rounded-sm",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-default-border-focus focus-visible:outline-offset-0",
            disabled && "cursor-not-allowed",
            iconBg,
            className,
          )}
          disabled={disabled}
          onClick={(e) => {
            onClick?.();
            if (e.defaultPrevented) return;
          }}
          type="button"
        >
          {resolvedIconName ? (
            <Icon name={resolvedIconName} size={16} className={iconColor} />
          ) : null}
        </button>
      </Tooltip>
    );
  }

  if (isStacked) {
    const iconBg = disabled
      ? "bg-transparent"
      : selected
        ? (useOneAccent ? "bg-[var(--one-accent-bg,var(--background-tertiary))]" : "bg-background-tertiary")
        : (useOneAccent
            ? "bg-transparent hover:bg-[var(--one-accent-bg-hover,var(--background-tertiary))] active:bg-[var(--one-accent-bg-hover,var(--background-tertiary))]"
            : "bg-transparent hover:bg-background-tertiary active:bg-background-tertiary");

    return (
      <button
        {...rest}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "group inline-flex w-14 flex-col items-center justify-center gap-[3px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
          disabled && "group-hover/leftnav:cursor-not-allowed",
          className,
        )}
        disabled={disabled}
        onClick={(e) => {
          onClick?.();
          if (e.defaultPrevented) return;
        }}
        type="button"
      >
        <div className={cx(
          "relative flex items-center justify-center rounded-lg p-sm transition-[background-color,transform] duration-300 ease-in-out",
          selected ? "scale-105" : "hover:scale-105 active:scale-105",
          iconBg,
        )}>
          {selectedIconName && iconName ? (
            <>
              <Icon name={iconName} size={20} className={cx(iconColor, "transition-opacity duration-150 ease-in-out", selected ? "opacity-0" : "opacity-100")} />
              <Icon name={selectedIconName} size={20} className={cx(iconColor, "absolute transition-opacity duration-150 ease-in-out", selected ? "opacity-100" : "opacity-0")} />
            </>
          ) : resolvedIconName ? (
            <Icon name={resolvedIconName} size={20} className={iconColor} />
          ) : null}
        </div>
        <span
          className={cx(
            "min-w-full truncate text-center text-hint font-medium leading-4",
            labelColor,
          )}
        >
          {label}
        </span>
      </button>
    );
  }

  const hasTrailing = Boolean(trailingAction) && !disabled;

  const background = disabled
    ? "bg-transparent"
    : selected
      ? (useOneAccent ? "bg-[var(--one-accent-bg,var(--background-tertiary))]" : "bg-background-tertiary")
      : (useOneAccent
          ? cx("bg-transparent", "hover:bg-[var(--one-accent-bg-hover,var(--background-tertiary))]", "active:bg-[var(--one-accent-bg-hover,var(--background-tertiary))]")
          : cx("bg-transparent", "hover:bg-background-tertiary", "active:bg-background-tertiary"));

  return (
    <div
      aria-current={selected ? "page" : undefined}
      className={cx(
        "group/navitem flex h-7 w-full items-center gap-sm rounded-sm px-mid",
        background,
        disabled && "group-hover/leftnav:cursor-not-allowed",
        className,
      )}
    >
      <button
        {...rest}
        className={cx(
          "inline-flex min-w-0 flex-1 items-center gap-sm bg-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        )}
        disabled={disabled}
        onClick={(e) => {
          onClick?.();
          if (e.defaultPrevented) return;
        }}
        type="button"
      >
        {iconName ? (
          selectedIconName ? (
            <span className="relative inline-flex shrink-0">
              <Icon name={iconName} size={16} className={cx(iconColor, "transition-opacity duration-150 ease-in-out", selected ? "opacity-0" : "opacity-100")} />
              <Icon name={selectedIconName} size={16} className={cx(iconColor, "absolute inset-0 transition-opacity duration-150 ease-in-out", selected ? "opacity-100" : "opacity-0")} />
            </span>
          ) : (
            <Icon name={resolvedIconName!} size={16} className={iconColor} />
          )
        ) : null}
        <span
          className={cx(
            "min-w-0 truncate text-paragraph leading-5",
            "font-normal",
            labelColor,
          )}
        >
          {label}
        </span>
      </button>

      {hasTrailing ? (
        <button
          type="button"
          aria-label={trailingAction!.ariaLabel}
          className={cx(
            "hidden size-5 shrink-0 items-center justify-center rounded-sm",
            "group-hover/navitem:inline-flex focus-visible:inline-flex",
            "text-text-primary",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-action-default-border-focus focus-visible:outline-offset-0",
          )}
          onClick={(e) => {
            e.stopPropagation();
            trailingAction!.onClick();
          }}
        >
          <Icon name={trailingAction!.iconName} size={14} />
        </button>
      ) : null}
    </div>
  );
}

