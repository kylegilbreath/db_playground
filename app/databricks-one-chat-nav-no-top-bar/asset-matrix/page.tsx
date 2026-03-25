"use client";

import * as React from "react";

import { DetailCard, SmallCard, ThumbnailCard } from "@/components/Card";
import { Table, TableRow, TableCell, TableCellContent } from "@/components/Table";
import { Tag } from "@/components/Tag";
import { Icon, SemanticStateIcon } from "@/components/icons";
import { Menu } from "@/components/Menu";
import { Popularity } from "@/components/Popularity";
import { AssetTypes } from "@/components/AssetVisuals/assetTypeIcons";
import type {
  CardItem,
  SmallCardItem,
  ThumbnailCardItem,
  CardMetadataItem,
  CardTag,
} from "@/components/Card/types";

import {
  type FieldSpec,
  type AssetEntry,
  type ViewMode,
  VIEW_MODES,
  type ThemeMode,
  type FieldToggles,
  ASSET_SPECS,
  SAMPLE_SUBTITLES,
  SAMPLE_OWNERS,
  SAMPLE_DOMAINS,
  getDomainColor,
  DOMAIN_ICON_MAP,
  DETAIL_DESCRIPTIONS,
  applyFieldToggles,
  buildDecorators,
  getFieldsForViewMode,
  getTableColumnHeaders,
  getTableCellValue,
} from "@/lib/assetSpecs";

// ---------------------------------------------------------------------------
// Domain icon helpers (JSX — must stay in the component file)
// ---------------------------------------------------------------------------

function getDomainIcon(domain: string, size = 16): React.ReactNode {
  const mapping = DOMAIN_ICON_MAP[domain];
  if (!mapping) return <Icon name="DomainsIcon" size={size} />;
  return <Icon name={mapping.name} size={size} className={mapping.colorClass} />;
}

function getDomainTagIcon(domain: string): { type: "Icon"; icon: React.ReactNode } {
  return { type: "Icon", icon: getDomainIcon(domain, 12) };
}

// ---------------------------------------------------------------------------
// Field → card-prop helpers
// ---------------------------------------------------------------------------

function withLastSeparatorOff(items: CardMetadataItem[]): CardMetadataItem[] {
  if (items.length === 0) return items;
  return items.map((item, i) =>
    i === items.length - 1 ? { ...item, separator: false } : item,
  );
}

function buildGridMetadata(
  fields: FieldSpec,
  index: number,
): CardMetadataItem[] {
  const items: CardMetadataItem[] = [];
  const timeAgo = ["2h ago", "1d ago", "3d ago"];
  if (fields.includes("Owner"))
    items.push({ label: SAMPLE_OWNERS[index % SAMPLE_OWNERS.length] });
  if (fields.includes("Updated"))
    items.push({ label: `Updated ${timeAgo[index % timeAgo.length]}` });
  if (fields.includes("# of assets")) items.push({ label: "24 assets" });
  if (fields.includes("Last viewed"))
    items.push({ label: "Viewed 1d ago" });
  if (fields.includes("Views"))
    items.push({ label: "67 views" });
  return withLastSeparatorOff(items);
}

function buildDetailLocationRow(fields: FieldSpec, toggles: FieldToggles): CardMetadataItem[] {
  const items: CardMetadataItem[] = [];
  if (fields.includes("Workspace") || toggles.isAccountLevel)
    items.push({ label: "rnd_eudev" });
  if (
    fields.includes("File location") ||
    fields.includes("File Location")
  )
    items.push({ label: "/Shared/Reports" });
  return withLastSeparatorOff(items);
}

function buildDetailMetadata(fields: FieldSpec): CardMetadataItem[] {
  const items: CardMetadataItem[] = [];
  if (fields.includes("Owner"))
    items.push({ label: SAMPLE_OWNERS[0] });
  if (fields.includes("Updated"))
    items.push({ label: "Updated 2h ago" });
  if (fields.includes("# of assets")) items.push({ label: "24 assets" });
  if (fields.includes("Last viewed"))
    items.push({ label: "Viewed 1d ago" });
  if (fields.includes("Views"))
    items.push({ label: "67 views" });
  return withLastSeparatorOff(items);
}

function buildCardTags(
  fields: FieldSpec,
  domainIndex = 0,
  includeDomain = true,
): CardTag[] {
  const tags: CardTag[] = [];
  if (includeDomain && fields.includes("Domain")) {
    const domain = SAMPLE_DOMAINS[domainIndex % SAMPLE_DOMAINS.length];
    tags.push({ label: domain, color: getDomainColor(domain), leftElement: getDomainTagIcon(domain) });
  }
  if (fields.includes("Tags"))
    tags.push({ label: "Production" }, { label: "Q1" });
  return tags;
}

// ---------------------------------------------------------------------------
// Grid card builder
// ---------------------------------------------------------------------------

function buildGridCard(
  entry: AssetEntry,
  fields: FieldSpec,
  index: number,
  toggles: FieldToggles,
): { item: SmallCardItem | ThumbnailCardItem; hasThumbnail: boolean } {
  const hasThumbnail = fields.includes("Thumbnail");
  const decorators = buildDecorators(toggles);
  const metadataRow = buildGridMetadata(fields, index);

  const tags = buildCardTags(fields, index);

  const isDomain = entry.key === "Domains";
  const sampleName = entry.sampleNames[index % entry.sampleNames.length];
  const leadingIcon = isDomain
    ? getDomainIcon(sampleName)
    : <Icon name={entry.iconName} size={16} />;

  const base: SmallCardItem = {
    id: `grid-${entry.key}-${index}`,
    title: {
      leadingIcon,
      label: sampleName,
      decorators: decorators.length > 0 ? decorators : undefined,
    },
    subtitle: fields.includes("Subtitle")
      ? SAMPLE_SUBTITLES[index % SAMPLE_SUBTITLES.length]
      : undefined,
    metadataRow: metadataRow.length > 0 ? metadataRow : undefined,
    tags: tags.length > 0 ? tags : undefined,
  };

  if (hasThumbnail) {
    const isDashboard = entry.assetType === AssetTypes.Dashboards;
    const isApp = entry.assetType === AssetTypes.Apps;
    const hasDomain = fields.includes("Domain");
    const domainName = SAMPLE_DOMAINS[index % SAMPLE_DOMAINS.length];
    const tagsWithoutDomain = buildCardTags(fields, index, false);

    let thumbnail: ThumbnailCardItem["thumbnail"];
    if (isDashboard && toggles.hasThumbnail) {
      thumbnail = { variant: "image", dashboardIndex: (index % 6) + 1, alt: "Dashboard preview" };
    } else if (isApp && toggles.hasThumbnail) {
      const nn = String(1 + (index % 10)).padStart(2, "0");
      const src = { light: `/images/app-thumbnail-${nn}.png`, dark: `/images/app-thumbnail-${nn}.png` };
      thumbnail = { variant: "image", src, alt: "App preview" };
    } else if (entry.assetType === AssetTypes.GenieSpaces && toggles.hasThumbnail) {
      const src = { light: "/images/genie-space-thumbnail.png", dark: "/images/genie-space-thumbnail.png" };
      thumbnail = { variant: "image", src, alt: "Genie Space preview" };
    } else {
      thumbnail = { variant: "placeholder", icon: <Icon name={entry.iconName} size={32} /> };
    }

    return {
      hasThumbnail: true,
      item: {
        ...base,
        tags: tagsWithoutDomain.length > 0 ? tagsWithoutDomain : undefined,
        thumbnail,
        description: hasDomain ? (
          <Tag color={getDomainColor(domainName)} leftElement={getDomainTagIcon(domainName)}>{domainName}</Tag>
        ) : undefined,
      },
    };
  }

  return { hasThumbnail: false, item: base };
}

// ---------------------------------------------------------------------------
// Detail card builder
// ---------------------------------------------------------------------------

function buildSpecDetailCard(
  entry: AssetEntry,
  fields: FieldSpec,
  toggles: FieldToggles,
): CardItem {
  const decorators = buildDecorators(toggles);
  const locationRow = buildDetailLocationRow(fields, toggles);
  const metadataRow = buildDetailMetadata(fields);
  const tags = buildCardTags(fields);

  const isDomain = entry.key === "Domains";
  const sampleName = entry.sampleNames[0];
  const leadingIcon = isDomain
    ? getDomainIcon(sampleName)
    : <Icon name={entry.iconName} size={16} />;

  const descriptionText = fields.includes("Description")
    ? DETAIL_DESCRIPTIONS[entry.key] ?? undefined
    : undefined;
  const assetCount = isDomain && fields.includes("# of assets") ? "24 assets" : undefined;

  let description: React.ReactNode | undefined;
  if (descriptionText && assetCount) {
    description = (
      <>
        {descriptionText}
        <div className="mt-xs text-hint text-text-tertiary">{assetCount}</div>
      </>
    );
  } else if (descriptionText) {
    description = descriptionText;
  } else if (assetCount) {
    description = <span className="text-text-tertiary">{assetCount}</span>;
  }

  const filteredMetadata = isDomain
    ? metadataRow.filter((m) => m.label !== "24 assets")
    : metadataRow;

  return {
    id: `detail-${entry.key}`,
    title: {
      leadingIcon,
      label: sampleName,
      decorators: decorators.length > 0 ? decorators : undefined,
    },
    subtitle: fields.includes("Subtitle") ? SAMPLE_SUBTITLES[0] : undefined,
    locationRow: locationRow.length > 0 ? locationRow : undefined,
    metadataRow: filteredMetadata.length > 0 ? filteredMetadata : undefined,
    description,
    tags: tags.length > 0 ? tags : undefined,
  };
}

// ---------------------------------------------------------------------------
// SpecAssetRow — renders one view mode for one asset
// ---------------------------------------------------------------------------

function SpecAssetRow({
  entry,
  viewMode,
  fields,
  toggles,
}: {
  entry: AssetEntry;
  viewMode: ViewMode;
  fields: FieldSpec;
  toggles: FieldToggles;
}) {
  const allTableColumns = React.useMemo(
    () => (viewMode === "table" ? getTableColumnHeaders(fields) : []),
    [viewMode, fields],
  );
  const DEFAULT_VISIBLE = new Set(["Owner", "File location", "File Location", "Views", "Domain"]);
  const [hiddenCols, setHiddenCols] = React.useState<Set<string>>(
    () => new Set(allTableColumns.filter((c) => !DEFAULT_VISIBLE.has(c))),
  );
  const visibleColumns = React.useMemo(
    () => new Set(allTableColumns.filter((c) => !hiddenCols.has(c))),
    [allTableColumns, hiddenCols],
  );

  const toggleColumn = React.useCallback((col: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  }, []);

  if (viewMode === "table") {
    const columns = allTableColumns.filter((c) => visibleColumns.has(c));
    const isManageDomainTable = fields.some((f) =>
      f.includes("Manage Domain"),
    );

    return (
      <div className="w-full">
        {isManageDomainTable && (
          <p className="mb-xs text-hint italic text-text-tertiary">
            Manage Domain table view only
          </p>
        )}
        <div className="overflow-hidden rounded-md bg-background-primary">
          <Table disableResponsiveHiding>
            <TableRow state="Header">
              <TableCell>
                <TableCellContent type="Header">Name</TableCellContent>
              </TableCell>
              {columns.map((col) => (
                <TableCell key={col} data-col-width={col === "Domain" ? 200 : undefined}>
                  <TableCellContent type="Header">{col}</TableCellContent>
                </TableCell>
              ))}
            </TableRow>
            {entry.sampleNames.map((name, i) => {
              const isDomain = entry.key === "Domains";
              const rowIcon = isDomain
                ? getDomainIcon(name, 16)
                : <Icon name={entry.iconName} size={16} className="shrink-0 text-text-secondary" />;

              return (
              <TableRow key={name}>
                <TableCell>
                  <div className="flex w-full min-w-0 items-center gap-sm">
                    <span className="shrink-0">{rowIcon}</span>
                    <span className="truncate text-paragraph">{name}</span>
                    {(toggles.isCertified || toggles.isFavorite || toggles.isTrending || toggles.isPopular) && (
                      <span className="inline-flex shrink-0 items-center gap-xs">
                        {toggles.isCertified && (
                          <Icon name="CertifiedFillIcon" size={15} className="text-signal-icon-certified" />
                        )}
                        {toggles.isFavorite && (
                          <Icon name="starFillIcon" size={15} className="text-signal-icon-favorited" />
                        )}
                        {toggles.isTrending && (
                          <Icon name="trendingIcon" size={15} className="text-signal-icon-trending" />
                        )}
                        {toggles.isPopular && (
                          <Popularity level={4} size={15} />
                        )}
                      </span>
                    )}
                  </div>
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {col === "Domain" ? (
                      <Tag
                        className="self-start"
                        color={getDomainColor(SAMPLE_DOMAINS[i % SAMPLE_DOMAINS.length])}
                        leftElement={getDomainTagIcon(SAMPLE_DOMAINS[i % SAMPLE_DOMAINS.length])}
                      >
                        {SAMPLE_DOMAINS[i % SAMPLE_DOMAINS.length]}
                      </Tag>
                    ) : col === "Tags" ? (
                      <span className="inline-flex items-center gap-xs self-start">
                        <Tag className="self-start">Production</Tag>
                        <Tag className="self-start" color="Default">+1</Tag>
                      </span>
                    ) : col === "Status (Published/draft)" ? (
                      <Tag
                        className="self-start"
                        color={
                          getTableCellValue(col, i) === "Published"
                            ? "Lime"
                            : "Lemon"
                        }
                      >
                        {getTableCellValue(col, i)}
                      </Tag>
                    ) : (
                      <TableCellContent type="Text">
                        {getTableCellValue(col, i)}
                      </TableCellContent>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              );
            })}
          </Table>
        </div>
      </div>
    );
  }

  if (viewMode === "grid") {
    const { item, hasThumbnail } = buildGridCard(entry, fields, 0, toggles);
    if (hasThumbnail) {
      return (
        <div className="w-[300px]">
          <ThumbnailCard item={item as ThumbnailCardItem} />
        </div>
      );
    }
    return (
      <div className="w-[300px]">
        <SmallCard item={item} />
      </div>
    );
  }

  // detail
  const detailItem = buildSpecDetailCard(entry, fields, toggles);
  return (
    <div className="max-w-[900px]">
      <DetailCard item={detailItem} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme toggle & layout
// ---------------------------------------------------------------------------

/* eslint-disable @next/next/no-img-element */
const THEME_LOGO_LAKEHOUSE = <img src="/logos/Lakehouse.svg" alt="" className="size-4" />;
const THEME_LOGO_ONE = <img src="/logos/DatabricksOne.svg" alt="" className="size-4" />;

function ThemeShell({
  theme,
  children,
}: {
  theme: "lakehouse" | "one";
  children: React.ReactNode;
}) {
  return (
    <div className={theme === "one" ? "databricks-one" : ""}>
      {children}
    </div>
  );
}


function ThemeLabel({ theme }: { theme: "lakehouse" | "one" }) {
  const logo = theme === "lakehouse" ? "/logos/Lakehouse.svg" : "/logos/DatabricksOne.svg";
  const label = theme === "lakehouse" ? "Lakehouse" : "Databricks One";
  return (
    <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-background-secondary px-sm py-xs text-paragraph font-medium text-text-primary">
      <img src={logo} alt="" className="size-5 object-contain" />
      {label}
    </span>
  );
}

function SingleViewMode({
  entry,
  theme,
  viewMode,
  toggles,
}: {
  entry: AssetEntry;
  theme: "lakehouse" | "one";
  viewMode: ViewMode;
  toggles: FieldToggles;
}) {
  const specs = theme === "one" ? entry.one : entry.lakehouse;
  const rawFields = getFieldsForViewMode(specs, viewMode);
  if (!rawFields) return null;

  return (
    <ThemeShell theme={theme}>
      <SpecAssetRow
        entry={entry}
        viewMode={viewMode}
        fields={applyFieldToggles(rawFields, toggles)}
        toggles={toggles}
      />
    </ThemeShell>
  );
}

function CardColumn({
  entry,
  theme,
  toggles,
}: {
  entry: AssetEntry;
  theme: "lakehouse" | "one";
  toggles: FieldToggles;
}) {
  const specs = theme === "one" ? entry.one : entry.lakehouse;
  const gridFields = applyFieldToggles(specs.grid, toggles);
  const detailFields = applyFieldToggles(specs.detail, toggles);

  return (
    <div className={`flex flex-col gap-lg ${theme === "one" ? "databricks-one" : ""}`}>
      <ThemeLabel theme={theme} />
      <SpecAssetRow entry={entry} viewMode="grid" fields={gridFields} toggles={toggles} />
      <SpecAssetRow entry={entry} viewMode="detail" fields={detailFields} toggles={toggles} />
    </div>
  );
}

function BothThemeColumns({
  entry,
  toggles,
}: {
  entry: AssetEntry;
  toggles: FieldToggles;
}) {
  const hasTable =
    entry.lakehouse.table !== null || entry.one.table !== null;

  return (
    <div className="flex flex-col gap-[80px]">
      <div className="grid grid-cols-2 gap-[80px]">
        <CardColumn entry={entry} theme="lakehouse" toggles={toggles} />
        <CardColumn entry={entry} theme="one" toggles={toggles} />
      </div>

      {hasTable && (
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <ThemeLabel theme="lakehouse" />
            {entry.lakehouse.table ? (
              <SingleViewMode entry={entry} theme="lakehouse" viewMode="table" toggles={toggles} />
            ) : (
              <span className="text-paragraph italic text-text-tertiary">N/A</span>
            )}
          </div>
          <div className="flex flex-col gap-sm">
            <ThemeLabel theme="one" />
            {entry.one.table ? (
              <SingleViewMode entry={entry} theme="one" viewMode="table" toggles={toggles} />
            ) : (
              <span className="text-paragraph italic text-text-tertiary">N/A</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ViewModeColumn({
  entry,
  theme,
  toggles,
}: {
  entry: AssetEntry;
  theme: "lakehouse" | "one";
  toggles: FieldToggles;
}) {
  const specs = theme === "one" ? entry.one : entry.lakehouse;
  const activeViewModes = VIEW_MODES.filter((vm) => {
    if (vm.id === "table") return specs.table !== null;
    return true;
  });

  return (
    <ThemeShell theme={theme}>
      <div className="flex flex-col gap-[80px]">
        {activeViewModes.map((vm) => {
          const rawFields = getFieldsForViewMode(specs, vm.id);
          if (!rawFields) return null;
          return (
            <SpecAssetRow
              key={vm.id}
              entry={entry}
              viewMode={vm.id}
              fields={applyFieldToggles(rawFields, toggles)}
              toggles={toggles}
            />
          );
        })}
      </div>
    </ThemeShell>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssetMatrixPage() {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("both");
  const [hasDomain, setHasDomain] = React.useState(true);
  const [hasThumbnail, setHasThumbnail] = React.useState(true);
  const [isCertified, setIsCertified] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isTrending, setIsTrending] = React.useState(false);
  const [isPopular, setIsPopular] = React.useState(false);
  const [isAccountLevel, setIsAccountLevel] = React.useState(false);
  const [hasViewed, setHasViewed] = React.useState(false);

  const fieldToggles: FieldToggles = { hasDomain, hasThumbnail, isCertified, isFavorite, isTrending, isPopular, isAccountLevel, hasViewed };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col gap-[40px] px-6 pb-8 pt-10">
      <Menu
        title="Asset Matrix"
        hideSearchBar
        chipsRowProps={{
          hideFilterToggle: true,
          chips: [
            ...(themeMode !== "one" ? [{
              id: "lakehouse",
              label: "LH Only",
              leadingIcon: THEME_LOGO_LAKEHOUSE,
              applied: themeMode === "lakehouse",
              onAppliedChange: (next: boolean) => setThemeMode(next ? "lakehouse" : "both"),
            }] : []),
            ...(themeMode !== "lakehouse" ? [{
              id: "one",
              label: "DB1 Only",
              leadingIcon: THEME_LOGO_ONE,
              applied: themeMode === "one",
              onAppliedChange: (next: boolean) => setThemeMode(next ? "one" : "both"),
            }] : []),
            { id: "domain", label: "Domain", applied: hasDomain, onAppliedChange: setHasDomain },
            { id: "thumbnail", label: "Thumbnail", applied: hasThumbnail, onAppliedChange: setHasThumbnail },
            { id: "certified", label: "Certified", applied: isCertified, onAppliedChange: setIsCertified, leadingIcon: <SemanticStateIcon kind="certified" selected={isCertified} size={16} /> },
            { id: "favorite", label: "Favorite", applied: isFavorite, onAppliedChange: setIsFavorite, leadingIcon: <SemanticStateIcon kind="favorite" selected={isFavorite} size={16} /> },
            { id: "trending", label: "Trending", applied: isTrending, onAppliedChange: setIsTrending, leadingIcon: <Icon name="trendingIcon" size={16} className="text-signal-icon-trending" /> },
            { id: "popular", label: "Popular", applied: isPopular, onAppliedChange: setIsPopular, leadingIcon: <Popularity level={5} size={16} /> },
            { id: "account", label: "Account level", applied: isAccountLevel, onAppliedChange: setIsAccountLevel },
            { id: "viewed", label: "Viewed", applied: hasViewed, onAppliedChange: setHasViewed },
          ],
        }}
      />

      <div className="flex flex-col gap-[120px]">
        {ASSET_SPECS.map((entry) => (
          <section key={entry.key} className="flex flex-col gap-lg">
            <div className="border-b border-border pb-sm">
              <h2 className="text-title3 font-semibold">{entry.label}</h2>
            </div>

            {themeMode === "both" ? (
              <BothThemeColumns entry={entry} toggles={fieldToggles} />
            ) : (
              <ViewModeColumn entry={entry} theme={themeMode} toggles={fieldToggles} />
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
