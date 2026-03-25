"use client";

import * as React from "react";

import { AssetTypes, type AssetType, getAssetTypeIcon } from "@/components/AssetVisuals";
import { FilterSection } from "@/components/Filters/FilterSection";
import { FilterSectionContent, type FilterSectionChipItem } from "@/components/Filters/FilterSectionContent";
import { SemanticStateIcon, Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

type DemoSectionId = "assetType" | "domain" | "status" | "modified" | "owner";

type Domain = { id: string; label: string; iconName: string; iconClassName: string };

const DOMAINS: Domain[] = [
  { id: "finance", label: "Finance", iconName: "CreditCardIcon", iconClassName: "text-tag-iconColor-indigo" },
  { id: "marketing", label: "Marketing", iconName: "MegaphoneIcon", iconClassName: "text-tag-iconColor-pink" },
  { id: "sales", label: "Sales", iconName: "chartLineIcon", iconClassName: "text-tag-iconColor-teal" },
  { id: "hr", label: "HR", iconName: "UserSparkleIcon", iconClassName: "text-tag-iconColor-purple" },
  { id: "operations", label: "Operations", iconName: "BarStackedPercentageIcon", iconClassName: "text-tag-iconColor-coral" },
  { id: "security", label: "Security", iconName: "shieldIcon", iconClassName: "text-tag-iconColor-turquoise" },
  { id: "support", label: "Support", iconName: "speechBubbleIcon", iconClassName: "text-tag-iconColor-brown" },
  { id: "product", label: "Product", iconName: "TagIcon", iconClassName: "text-tag-iconColor-indigo" },
  { id: "legal", label: "Legal", iconName: "fileIcon", iconClassName: "text-tag-iconColor-purple" },
  { id: "engineering", label: "Engineering", iconName: "beakerIcon", iconClassName: "text-tag-iconColor-teal" },
];

type Owner = { id: string; name: string };

const OWNERS: Owner[] = [
  { id: "o1", name: "Ava Chen" },
  { id: "o2", name: "Marcus Reed" },
  { id: "o3", name: "Priya Nair" },
  { id: "o4", name: "Noah Martinez" },
  { id: "o5", name: "Sofia Kim" },
  { id: "o6", name: "Ethan Patel" },
  { id: "o7", name: "Isabella Lopez" },
  { id: "o8", name: "Liam Johnson" },
  { id: "o9", name: "Mia Nguyen" },
  { id: "o10", name: "Oliver Brown" },
];

const TAG_COLORS = ["Charcoal", "Lime", "Teal", "Turquoise", "Indigo", "Purple", "Pink", "Coral", "Brown"] as const;

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}

function avatarColorForId(id: string) {
  const idx = hashString(id) % TAG_COLORS.length;
  return TAG_COLORS[idx]!;
}

function initialsForName(name: string) {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

function OwnerAvatar({ ownerId, name }: { ownerId: string; name: string }) {
  const color = avatarColorForId(ownerId);
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex size-4 items-center justify-center rounded-full",
        color === "Charcoal"
          ? "bg-tag-background-charcoal text-tag-text-charcoal"
          : color === "Lime"
            ? "bg-tag-background-lime text-tag-text-lime"
            : color === "Teal"
              ? "bg-tag-background-teal text-tag-text-teal"
              : color === "Turquoise"
                ? "bg-tag-background-turquoise text-tag-text-turquoise"
                : color === "Indigo"
                  ? "bg-tag-background-indigo text-tag-text-indigo"
                  : color === "Purple"
                    ? "bg-tag-background-purple text-tag-text-purple"
                    : color === "Pink"
                      ? "bg-tag-background-pink text-tag-text-pink"
                      : color === "Coral"
                        ? "bg-tag-background-coral text-tag-text-coral"
                        : "bg-tag-background-brown text-tag-text-brown",
      )}
    >
      <span className="text-[10px] font-semibold leading-none">{initialsForName(name)}</span>
    </span>
  );
}

function assetTypeLabel(assetType: AssetType) {
  // Human-friendly labels for the filter panel.
  switch (assetType) {
    case AssetTypes.GenieSpaces:
      return "Genie";
    case AssetTypes.GitFolders:
      return "Git folders";
    case AssetTypes.MetricViews:
      return "Metric views";
    case AssetTypes.LegacyAlerts:
      return "Legacy alerts";
    default:
      // Capitalize snake-ish ids.
      return assetType
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
  }
}

function useToggleSet(initial: string[] = []) {
  const [set, setSet] = React.useState<Set<string>>(() => new Set(initial));
  const toggle = React.useCallback((id: string, next?: boolean) => {
    setSet((prev) => {
      const n = new Set(prev);
      const shouldAdd = next ?? !n.has(id);
      if (shouldAdd) n.add(id);
      else n.delete(id);
      return n;
    });
  }, []);
  const clear = React.useCallback(() => setSet(new Set()), []);
  return { set, toggle, clear };
}

export type FilterPanelProps = {
  className?: string;
  variant?: "popover" | "inline";
};

export function FilterPanel({ className, variant = "inline" }: FilterPanelProps) {
  const [openSectionIds, setOpenSectionIds] = React.useState<Set<DemoSectionId>>(
    // Default: keep the top sections expanded; collapse the rest.
    () => new Set<DemoSectionId>(["assetType", "domain"]),
  );

  const [showAll, setShowAll] = React.useState<Record<DemoSectionId, boolean>>({
    assetType: false,
    domain: false,
    status: true,
    modified: true,
    owner: false,
  });

  const assetTypeState = useToggleSet([]);
  const domainState = useToggleSet([]);
  const statusState = useToggleSet([]);
  const modifiedState = useToggleSet([]);
  const ownerState = useToggleSet([]);

  const [ownerSearch, setOwnerSearch] = React.useState("");

  const toggleSection = React.useCallback((id: DemoSectionId) => {
    setOpenSectionIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const resetAll = React.useCallback(() => {
    assetTypeState.clear();
    domainState.clear();
    statusState.clear();
    modifiedState.clear();
    ownerState.clear();
    setOwnerSearch("");
    setShowAll((prev) => ({ ...prev, assetType: false, domain: false, owner: false }));
  }, [assetTypeState, domainState, modifiedState, ownerState, statusState]);

  const appliedCount =
    assetTypeState.set.size +
    domainState.set.size +
    statusState.set.size +
    modifiedState.set.size +
    ownerState.set.size;

  const assetTypeItems: FilterSectionChipItem[] = (Object.values(AssetTypes) as AssetType[]).map((t) => ({
    id: t,
    label: assetTypeLabel(t),
    // Intentionally no leading icons in the Type section (per current design).
    applied: assetTypeState.set.has(t),
    onAppliedChange: (next) => assetTypeState.toggle(t, next),
  }));

  const domainItems: FilterSectionChipItem[] = DOMAINS.map((d) => ({
    id: d.id,
    label: d.label,
    leadingIcon: <Icon name={d.iconName} size={16} className={d.iconClassName} />,
    applied: domainState.set.has(d.id),
    onAppliedChange: (next) => domainState.toggle(d.id, next),
  }));

  const statusItems: FilterSectionChipItem[] = [
    {
      id: "favorite",
      label: "Favorite",
      leadingIcon: <SemanticStateIcon kind="favorite" selected={statusState.set.has("favorite")} size={16} />,
      applied: statusState.set.has("favorite"),
      onAppliedChange: (next) => statusState.toggle("favorite", next),
    },
    {
      id: "certified",
      label: "Certified",
      leadingIcon: <SemanticStateIcon kind="certified" selected={statusState.set.has("certified")} size={16} />,
      applied: statusState.set.has("certified"),
      onAppliedChange: (next) => statusState.toggle("certified", next),
    },
  ];

  const modifiedItems: FilterSectionChipItem[] = [
    { id: "today", label: "Today", applied: modifiedState.set.has("today"), onAppliedChange: (n) => modifiedState.toggle("today", n) },
    { id: "last_7d", label: "Last 7d", applied: modifiedState.set.has("last_7d"), onAppliedChange: (n) => modifiedState.toggle("last_7d", n) },
    { id: "last_30d", label: "Last 30d", applied: modifiedState.set.has("last_30d"), onAppliedChange: (n) => modifiedState.toggle("last_30d", n) },
  ];

  const filteredOwners = OWNERS.filter((o) =>
    ownerSearch.trim()
      ? o.name.toLowerCase().includes(ownerSearch.trim().toLowerCase())
      : true,
  );

  const ownerItems: FilterSectionChipItem[] = filteredOwners.map((o) => ({
    id: o.id,
    label: o.name,
    leadingIcon: <OwnerAvatar ownerId={o.id} name={o.name} />,
    applied: ownerState.set.has(o.id),
    onAppliedChange: (next) => ownerState.toggle(o.id, next),
  }));

  const panelHeader = (
    <div
      className={cx(
        "flex w-full items-center justify-between",
        variant === "popover" ? "px-4" : "pl-0 pr-4",
        variant === "popover" ? "py-3" : "py-0",
      )}
    >
      <div className="text-[16px] font-medium leading-6 text-text-primary">
        Filters{appliedCount > 0 ? ` (${appliedCount})` : ""}
      </div>
      <button
        className={cx(
          "text-paragraph leading-5",
          "text-action-primary-text-default",
          "hover:underline",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        )}
        onClick={resetAll}
        type="button"
      >
        Reset
      </button>
    </div>
  );

  return (
    <div
      className={cx(
        "w-[280px]",
        variant === "popover"
          ? "rounded-md border border-border bg-background-primary shadow-[var(--elevation-shadow-lg)] overflow-hidden"
          : "rounded-md",
        className,
      )}
    >
      {panelHeader}
      {variant === "popover" ? (
        <div className="h-px w-full bg-border" aria-hidden="true" />
      ) : null}

      <div
        className={cx(
          "w-full",
          variant === "popover" ? "px-4 max-h-[70vh] overflow-y-auto" : "px-0",
        )}
      >
        <FilterSection
          title="Type"
          open={openSectionIds.has("assetType")}
          count={assetTypeState.set.size > 0 ? assetTypeState.set.size : undefined}
          onToggle={() => toggleSection("assetType")}
          className="border-b border-border"
        >
          <FilterSectionContent
            chips={assetTypeItems}
            collapsedVisibleCount={7}
            showAll={showAll.assetType}
            onShowAllChange={(next) => setShowAll((p) => ({ ...p, assetType: next }))}
          />
        </FilterSection>

        <FilterSection
          title="Domains"
          open={openSectionIds.has("domain")}
          count={domainState.set.size > 0 ? domainState.set.size : undefined}
          onToggle={() => toggleSection("domain")}
          className="border-b border-border"
        >
          <FilterSectionContent
            chips={domainItems}
            collapsedVisibleCount={4}
            showAll={showAll.domain}
            onShowAllChange={(next) => setShowAll((p) => ({ ...p, domain: next }))}
          />
        </FilterSection>

        <FilterSection
          title="Status"
          open={openSectionIds.has("status")}
          count={statusState.set.size > 0 ? statusState.set.size : undefined}
          onToggle={() => toggleSection("status")}
          className="border-b border-border"
        >
          <FilterSectionContent chips={statusItems} />
        </FilterSection>

        <FilterSection
          title="Modified"
          open={openSectionIds.has("modified")}
          count={modifiedState.set.size > 0 ? modifiedState.set.size : undefined}
          onToggle={() => toggleSection("modified")}
          className="border-b border-border"
        >
          <FilterSectionContent chips={modifiedItems} />
        </FilterSection>

        <FilterSection
          title="Owner"
          open={openSectionIds.has("owner")}
          count={ownerState.set.size > 0 ? ownerState.set.size : undefined}
          onToggle={() => toggleSection("owner")}
        >
          <FilterSectionContent
            searchValue={ownerSearch}
            onSearchValueChange={setOwnerSearch}
            chips={ownerItems}
            collapsedVisibleCount={8}
            showAll={showAll.owner}
            onShowAllChange={(next) => setShowAll((p) => ({ ...p, owner: next }))}
          />
        </FilterSection>
      </div>
    </div>
  );
}

