"use client";

import * as React from "react";

import { Icon, SemanticStateIcon } from "@/components/icons";

import { Menu } from "./Menu";
import type { MenuChipItem, MenuTabItem } from "./Menu";

function makeChip(partial: Partial<MenuChipItem> & { id: string; label: string }): MenuChipItem {
  return {
    id: partial.id,
    label: partial.label,
    applied: partial.applied ?? false,
    kind: partial.kind ?? "toggle",
    leadingIcon: partial.leadingIcon,
    disabled: partial.disabled ?? false,
    onAppliedChange: partial.onAppliedChange,
    onClick: partial.onClick,
  };
}

export function MenuShowcase() {
  const tabs: MenuTabItem[] = [
    { value: "dashboards", label: "Dashboards" },
    { value: "legacy", label: "Legacy Dashboards" },
  ];

  const dashboardChips: MenuChipItem[] = [
    makeChip({
      id: "favorite",
      label: "Favorite",
      leadingIcon: <SemanticStateIcon kind="favorite" selected={false} size={16} />,
    }),
    makeChip({
      id: "certified",
      label: "Certified",
      leadingIcon: <SemanticStateIcon kind="certified" selected={false} size={16} />,
    }),
    makeChip({ id: "owned", label: "Owned by me" }),
    makeChip({ id: "modified", label: "Modified this week" }),
    makeChip({ id: "published", label: "Published" }),
    makeChip({ id: "draft", label: "Draft" }),
  ];

  // Intentionally long list so the chips carousel can overflow in the gallery (to validate paging UI).
  const overflowChips: MenuChipItem[] = [
    makeChip({
      id: "favorite",
      label: "Favorite",
      leadingIcon: <SemanticStateIcon kind="favorite" selected={false} size={16} />,
    }),
    makeChip({
      id: "certified",
      label: "Certified",
      leadingIcon: <SemanticStateIcon kind="certified" selected={false} size={16} />,
    }),
    makeChip({ id: "type", label: "Type", kind: "dropdown" }),
    makeChip({ id: "owned", label: "Owned by me" }),
    makeChip({ id: "modified", label: "Modified this week" }),
    makeChip({ id: "catalog", label: "catalog", leadingIcon: <Icon name="catalogIcon" size={16} /> }),
    makeChip({
      id: "owner",
      label: "jocelyn.hickcox@…",
      leadingIcon: <SemanticStateIcon kind="folder" selected={false} size={16} />,
    }),
    makeChip({ id: "workspace", label: "Workspace: All", kind: "dropdown" }),
    makeChip({ id: "status", label: "Status: Active", kind: "dropdown" }),
    makeChip({ id: "source", label: "Source system: Very long label", kind: "dropdown" }),
    makeChip({ id: "region", label: "Region: United States (West)", kind: "dropdown" }),
    makeChip({ id: "team", label: "Team: Platform Engineering", kind: "dropdown" }),
    makeChip({ id: "env", label: "Environment: Production", kind: "dropdown" }),
    makeChip({ id: "tag", label: "Tag: Something fairly long", kind: "toggle" }),
    makeChip({ id: "extra", label: "Extra long filter chip label", kind: "toggle" }),
  ];

  const legacyChips: MenuChipItem[] = [
    makeChip({
      id: "favorite",
      label: "Favorite",
      applied: true,
      leadingIcon: <SemanticStateIcon kind="favorite" selected size={16} />,
    }),
    makeChip({
      id: "certified",
      label: "Certified",
      applied: true,
      leadingIcon: <SemanticStateIcon kind="certified" selected size={16} />,
    }),
    makeChip({
      id: "owner",
      label: "jocelyn.hickcox@…",
      applied: true,
      leadingIcon: <SemanticStateIcon kind="folder" selected size={16} />,
    }),
    makeChip({ id: "type", label: "Type", kind: "dropdown" }),
    makeChip({ id: "owned", label: "Owned by me" }),
    makeChip({ id: "catalog", label: "catalog", leadingIcon: <Icon name="catalogIcon" size={16} /> }),
  ];

  const [tab, setTab] = React.useState(tabs[0]!.value);

  const chips = tab === "legacy" ? legacyChips : dashboardChips;
  const appliedCount = chips.filter((c) => c.applied).length;

  return (
    <div className="flex w-full flex-col gap-lg">
      <Menu
        chipsRowProps={{
          chips: overflowChips,
          appliedCount: 0,
          hasFiltersApplied: false,
          onResetFilters: () => {},
        }}
      />

      <Menu
        chipsRowProps={{
          chips: legacyChips,
          appliedCount: 3,
          hasFiltersApplied: true,
          onResetFilters: () => {},
        }}
      />

      <Menu
        tabs={tabs}
        tabValue={tab}
        onTabValueChange={setTab}
        chipsRowProps={{
          chips,
          appliedCount,
          hasFiltersApplied: appliedCount > 0,
          onResetFilters: () => {},
        }}
      />
    </div>
  );
}

