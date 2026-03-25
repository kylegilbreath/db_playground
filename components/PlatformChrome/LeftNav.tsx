"use client";

import * as React from "react";

import { TextInput } from "@/components/TextInput";
import { Icon } from "@/components/icons";

import type { AppNavSection } from "./appConfig";
import { LeftNavItem } from "./LeftNavItem";
import { LeftNavNewButton } from "./LeftNavNewButton";
import { LeftNavSectionHeader } from "./LeftNavSectionHeader";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const current = isControlled ? (value as T) : uncontrolled;
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set] as const;
}

export type LeftNavProps = {
  className?: string;
  /** Visual container style. */
  variant?: "docked" | "floating";
  /** Item layout variant passed to each LeftNavItem. */
  navVariant?: "horizontal" | "stacked";
  /** When true, renders in icon-only mode showing only sections with showWhenCollapsed. */
  collapsed?: boolean;
  sections: AppNavSection[];
  showNewButton?: boolean;
  showSectionHeaders?: boolean;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectedIdChange?: (next: string) => void;
  onNewClick?: () => void;
  /** Optional content rendered at the top of the nav (e.g. logos). */
  header?: React.ReactNode;
  /** Optional content rendered at the bottom of the nav (e.g. app switcher, avatar). */
  footer?: React.ReactNode;
  /** When true, use One accent CSS variables for selected/hover nav item backgrounds. */
  useOneAccent?: boolean;
};

export function LeftNav({
  className,
  variant = "docked",
  navVariant = "horizontal",
  collapsed = false,
  sections,
  showNewButton = true,
  showSectionHeaders = true,
  selectedId,
  defaultSelectedId = "",
  onSelectedIdChange,
  onNewClick,
  header,
  footer,
  useOneAccent,
}: LeftNavProps) {
  const isStacked = navVariant === "stacked";
  const isCompact = isStacked || collapsed;

  const [currentSelected, setCurrentSelected] = useControllableState<string>({
    value: selectedId,
    defaultValue: defaultSelectedId,
    onChange: onSelectedIdChange,
  });

  const [openSectionIds, setOpenSectionIds] = React.useState<Set<string>>(() => {
    return new Set(
      sections
        .filter((s) => Boolean(s.label) && s.defaultOpen !== false)
        .map((s) => s.id),
    );
  });

  const toggleSection = React.useCallback((sectionId: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const containerClasses =
    variant === "floating"
      ? cx(
          "bg-background-secondary",
          "border border-border",
          "shadow-[var(--elevation-shadow-lg)]",
          "w-[192px]",
          "rounded-tl-lg rounded-tr-lg rounded-bl-md rounded-br-md",
        )
      : collapsed
        ? cx("w-14")
        : isStacked
          ? cx("w-20")
          : cx("w-[200px]");

  const paddingClasses =
    variant === "floating"
      ? "px-sm pt-sm pb-sm"
      : isCompact
        ? "items-center pt-sm"
        : "pl-mid pr-sm pt-sm";

  return (
    <nav
      aria-label="Primary navigation"
      className={cx(
        "group/leftnav shrink-0",
        containerClasses,
        className,
      )}
    >
      <div
        className={cx(
          "flex h-full flex-col gap-md pb-sm",
          isCompact ? "items-center" : "items-start",
          paddingClasses,
        )}
      >
        {header ? <div className="w-full">{header}</div> : null}

        {showNewButton && !isCompact ? (
          <LeftNavNewButton
            aria-label="New"
            onClick={() => onNewClick?.()}
          />
        ) : null}

        <div className={cx(
          "flex w-full flex-col",
          collapsed ? "items-center gap-md" : isStacked ? "items-center gap-lg" : "gap-md",
        )}>
          {(collapsed ? sections.filter((s) => s.showWhenCollapsed) : sections).map((section) => (
            <div key={section.id} className={cx(
              "flex w-full flex-col",
              collapsed ? "items-center gap-xs" : isStacked ? "items-center gap-lg" : "items-start gap-[2px]",
            )}>
              {showSectionHeaders && !collapsed && section.label ? (
                <LeftNavSectionHeader
                  aria-expanded={openSectionIds.has(section.id)}
                  label={section.label}
                  open={openSectionIds.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                />
              ) : null}

              {(!showSectionHeaders || !section.label || openSectionIds.has(section.id)) ? (
                section.items.map((item) => {
                  if (!collapsed && item.expandAsSearch && currentSelected === item.id) {
                    return (
                      <TextInput
                        key={`${section.id}:${item.id}`}
                        iconPrefix={item.iconName ? <Icon name={item.iconName} size={16} /> : undefined}
                        placeholder={item.label}
                        autoFocus
                        onBlur={() => setCurrentSelected("")}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setCurrentSelected("");
                        }}
                      />
                    );
                  }
                  return (
                    <LeftNavItem
                      key={`${section.id}:${item.id}`}
                      variant={collapsed ? "icon-only" : navVariant}
                      disabled={item.disabled}
                      iconName={item.iconName}
                      selectedIconName={item.selectedIconName}
                      iconColorClass={item.iconColorClass}
                      label={item.label}
                      selected={currentSelected === item.id}
                      useOneAccent={useOneAccent}
                      onClick={() => setCurrentSelected(item.id)}
                      trailingAction={
                        !collapsed && item.trailingActionIcon
                          ? {
                              iconName: item.trailingActionIcon === true ? "overflowHorizontalIcon" : item.trailingActionIcon,
                              ariaLabel: `Actions for ${item.label}`,
                              onClick: () => setCurrentSelected(item.id),
                            }
                          : undefined
                      }
                    />
                  );
                })
              ) : null}
            </div>
          ))}
        </div>

        {footer ? (
          <>
            <div className="min-h-0 flex-1" />
            <div className="shrink-0">{footer}</div>
          </>
        ) : null}
      </div>
    </nav>
  );
}
