"use client";

import * as React from "react";

import { AnythingBox, type AnythingBoxProps } from "@/components/AnythingBox/AnythingBox";
import { IconButton } from "@/components/IconButton";
import {
  TabsCollection,
  TabsItem,
  TabsList,
  type TabsActivationMode,
} from "@/components/Tabs/Tabs";
import { Icon } from "@/components/icons";

import { MenuChipsRow, type MenuChipsRowProps } from "./MenuChipsRow";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type MenuTabItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type MenuChipItem = MenuChipsRowProps["chips"][number];

export type MenuProps = {
  className?: string;

  /** Optional page title row shown above the search bar. */
  title?: React.ReactNode;
  /** Optional RHS title action(s), e.g. overflow button. */
  titleRight?: React.ReactNode;

  /** Optional tabs row under the search bar. */
  tabs?: MenuTabItem[];
  /** Selected tab (controlled). */
  tabValue?: string;
  /** Selected tab (uncontrolled). Required when `tabs` provided and `tabValue` omitted. */
  defaultTabValue?: string;
  /** Called when user changes tabs. */
  onTabValueChange?: (next: string) => void;
  /** Tabs keyboard activation behavior. */
  tabsActivationMode?: TabsActivationMode;

  /** Search bar props. We force `phase="search"` and `mode="search"` for this Menu. */
  anythingBoxProps?: Omit<AnythingBoxProps, "phase" | "mode">;
  /**
   * Optional ref to the wrapper around the `AnythingBox`.
   * Used by page-level transitions/measurement (e.g. search → chat demo).
   */
  anythingBoxWrapperRef?: React.Ref<HTMLDivElement>;

  /** When true, the search bar (AnythingBox) is not rendered. */
  hideSearchBar?: boolean;

  /** Chips row props. When omitted, the chips row is not rendered. */
  chipsRowProps?: Omit<MenuChipsRowProps, "className">;
};

export function Menu({
  className,
  title,
  titleRight,
  tabs,
  tabValue,
  defaultTabValue,
  onTabValueChange,
  tabsActivationMode = "automatic",
  hideSearchBar,
  anythingBoxProps,
  anythingBoxWrapperRef,
  chipsRowProps,
}: MenuProps) {
  const showTabs = Boolean(tabs && tabs.length);
  const showChipsRow = Boolean(chipsRowProps);
  const showTitle = Boolean(title);

  return (
    <div className={cx("flex w-full flex-col items-start gap-md", className)}>
      <div className={cx("flex w-full flex-col items-start", showTitle && "pt-md")}>
        {showTitle ? (
          <div className="flex w-full items-center gap-xs">
            <div className="min-w-0 text-title2 font-semibold leading-7 text-text-primary">
              {title}
            </div>
            {titleRight ? (
              <div className="shrink-0">{titleRight}</div>
            ) : (
              <IconButton
                aria-label="More"
                icon={<Icon name="overflowIcon" size={16} />}
                size="small"
                tone="neutral"
              />
            )}
          </div>
        ) : null}

        <div className={cx("flex w-full flex-col items-start gap-sm", showTitle && "mt-4")}>
          {hideSearchBar ? null : (
            <div ref={anythingBoxWrapperRef} className="w-full">
              <AnythingBox
                {...anythingBoxProps}
                className={cx("max-w-none", anythingBoxProps?.className)}
                mode="search"
                phase="search"
              />
            </div>
          )}

          {showTabs ? (
            <TabsCollection
              activationMode={tabsActivationMode}
              defaultValue={defaultTabValue ?? tabs![0]!.value}
              onValueChange={onTabValueChange}
              value={tabValue}
              type="lined"
            >
              <TabsList aria-label="Menu tabs">
                {tabs!.map((t) => (
                  <TabsItem key={t.value} disabled={t.disabled} value={t.value}>
                    {t.label}
                  </TabsItem>
                ))}
              </TabsList>
            </TabsCollection>
          ) : null}
        </div>
      </div>

      {showChipsRow ? <MenuChipsRow {...chipsRowProps!} /> : null}

      <div className="h-px w-full shrink-0 bg-border" aria-hidden="true" />
    </div>
  );
}

