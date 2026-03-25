import type { AssetEntry } from "@/lib/assetSpecs";
import {
  ASSET_SPECS,
  SAMPLE_OWNERS,
  SAMPLE_DOMAINS,
  getDomainColor,
  DOMAIN_ICON_MAP,
  DETAIL_DESCRIPTIONS,
  TABLE_SAMPLE_VALUES,
  getTableColumnHeaders,
} from "@/lib/assetSpecs";

export type SearchLayoutViewMode = "list" | "grid" | "detail";

export type SearchLayoutAssetTypeTokenValue =
  | "Tables"
  | "Dashboards"
  | "Notebooks"
  | "Models"
  | "Jobs"
  | "GenieSpaces"
  | "Queries"
  | "Alerts"
  | "Folders"
  | "Files"
  | "Marketplace"
  | "MetricViews"
  | "Pipelines"
  | "Endpoints"
  | "Functions"
  | "Volumes"
  | "Apps";

export type SearchLayoutPhosphorIconName =
  | "CirclesThree"
  | "CreditCard"
  | "Megaphone"
  | "ChartLineUp"
  | "ShieldCheck"
  | "GearSix"
  | "Headset"
  | "Flask"
  | "Tag";

export type SearchLayoutIconToken =
  | { kind: "assetType"; value: SearchLayoutAssetTypeTokenValue }
  | { kind: "icon"; name: string; className?: string }
  | {
      kind: "phosphor";
      name: SearchLayoutPhosphorIconName;
      /** Defaults: fill for most icons; CirclesThree defaults to regular. */
      weight?: "fill" | "regular";
      className?: string;
    };

/**
 * SearchLayoutChipModel
 *
 * Filter-chip models for the Menu chips row (summary controls). Keep serializable.
 *
 * Semantic chip types (favorite/certified/...) are intentionally constrained so teams
 * cannot choose the wrong icon/color for those concepts. Use `custom` for ad-hoc chips.
 *
 * Note: dropdown behavior is not implemented at this layer; `kind: "dropdown"` is visual-only.
 */
export type SearchLayoutChipModel =
  | {
      type: "favorite";
      id: string;
      applied?: boolean;
    }
  | {
      type: "certified";
      id: string;
      applied?: boolean;
    }
  | {
      type: "owned";
      id: string;
      applied?: boolean;
    }
  | {
      type: "modifiedDropdown";
      id: string;
      applied?: boolean;
    }
  | {
      type: "domainDropdown";
      id: string;
      applied?: boolean;
    }
  | {
      type: "typeDropdown";
      id: string;
      applied?: boolean;
    }
  | {
      type: "assetType";
      id: string;
      assetType: SearchLayoutAssetTypeTokenValue;
      applied?: boolean;
    }
  | {
      type: "custom";
      id: string;
      label: string;
      kind?: "dropdown";
      icon?: SearchLayoutIconToken;
      applied?: boolean;
    };

export type SearchLayoutFiltersModel = {
  placeholder: string;
  appliedCount: number;
  hasFiltersApplied: boolean;
  chips: SearchLayoutChipModel[];
};

export type SearchLayoutAiOverviewModel = {
  text: string;
  refs?: Array<{ id: string; label: string }>;
  defaultExpanded?: boolean;
  showCollapseButton?: boolean;
  followUpMode?: "input" | "button" | "none";
  followUpPlaceholder?: string;
  followUpSuggestions?: Array<{ id: string; label: string }>;
};

export type SearchLayoutTagColor =
  | "Default"
  | "Charcoal"
  | "Lemon"
  | "Lime"
  | "Teal"
  | "Turquoise"
  | "Indigo"
  | "Purple"
  | "Pink"
  | "Coral"
  | "Brown";

export type SearchLayoutTagModel = {
  label: string;
  color?: SearchLayoutTagColor;
  /** Icon name token for rendering a leading icon inside the tag. */
  iconName?: string;
  /** Tailwind color class for the tag icon (e.g. "text-tag-iconColor-lime"). */
  iconColorClass?: string;
};

export type SearchLayoutDecoratorKind =
  | "certified"
  | "favorited"
  | "trending"
  | "shared"
  | "pinned"
  | "popular";

export type SearchLayoutCardTitleModel = {
  label: string;
  icon?: SearchLayoutIconToken;
  decorators?: SearchLayoutDecoratorKind[];
};

export type SearchLayoutCardBaseModel = {
  id: string;
  title: SearchLayoutCardTitleModel;
  /** Optional tags row. */
  tags?: SearchLayoutTagModel[];
};

export type SearchLayoutSmallCardModel = SearchLayoutCardBaseModel & {
  kind: "small";
  subtitle?: string;
  metadata?: string;
};

export type SearchLayoutThumbnailCardModel = SearchLayoutCardBaseModel & {
  kind: "thumbnail";
  subtitle?: string;
  metadata?: string;
  /** Optional longer description (2 lines max in UI). */
  description?: string;
  thumbnail:
    | { kind: "placeholder"; iconName?: string; phosphorIcon?: string; tagColor?: string }
    | { kind: "dashboard"; index: number; alt: string }
    | { kind: "image"; src: { light: string; dark: string }; alt: string }
    | { kind: "code"; language?: string; code: string };
};

export type SearchLayoutDetailCardModel = SearchLayoutCardBaseModel & {
  kind: "detail";
  metadataParts?: string[];
  description?: string;
  /** Optional right-side thumbnail shown in some detail-card variants. */
  thumbnail?: SearchLayoutThumbnailCardModel["thumbnail"];
  /** Optional code snippet shown in the detail card body (demo). */
  codeSnippet?: { code: string; language?: string; highlightedTokens?: string[] };
  /**
   * Optional indented snippet used to show matching columns/context (demo).
   * Use `<<...>>` to denote highlighted spans.
   */
  indentedSnippet?: { text: string };
  /** Per-column values keyed by SearchLayoutTableColumnModel.key. */
  tableFields?: Record<string, string>;
};

export type SearchLayoutCardModel =
  | SearchLayoutSmallCardModel
  | SearchLayoutThumbnailCardModel
  | SearchLayoutDetailCardModel;

/**
 * Placeholder for future policy-driven rendering.
 * In the future we may support `cardKind: "auto"` driven by entity + asset type
 * (e.g. only dashboards/apps get thumbnails).
 */
export type SearchLayoutCardKind = SearchLayoutCardModel["kind"];

export type SearchLayoutSectionCardsGrid = {
  kind: "cardsGrid";
  cardKind: SearchLayoutCardKind;
  /** Visual background for cards in this section. Defaults to primary. */
  cardBackground?: "primary" | "secondary";
  columns: { sm?: number; lg?: number };
  items: SearchLayoutCardModel[];
};

export type SearchLayoutSectionCardsList = {
  kind: "cardsList";
  cardKind: SearchLayoutCardKind;
  items: SearchLayoutCardModel[];
};

export type SearchLayoutSectionCardsWrap = {
  kind: "cardsWrap";
  cardKind: SearchLayoutCardKind;
  /** Visual background for cards in this section. Defaults to primary. */
  cardBackground?: "primary" | "secondary";
  items: SearchLayoutCardModel[];
};

export type SearchLayoutLogoCardModel = {
  id: string;
  logo: { src: string; alt: string };
  title: string;
  subtitle?: string;
  /** Optional metadata shown under subtitle (used by SmallLogoCard). */
  metadata?: string;
};

export type SearchLayoutSectionLogoCardsGrid = {
  kind: "logoCardsGrid";
  columns: { sm?: number; lg?: number };
  items: SearchLayoutLogoCardModel[];
};

export type SearchLayoutSuggestedRowModel = {
  id: string;
  name: string;
  reason: string;
  owner: string;
  icon?: SearchLayoutIconToken;
};

export type SearchLayoutSectionSuggestedTable = {
  kind: "suggestedTable";
  rows: SearchLayoutSuggestedRowModel[];
};

export type SearchLayoutSectionContent =
  | SearchLayoutSectionCardsGrid
  | SearchLayoutSectionCardsList
  | SearchLayoutSectionCardsWrap
  | SearchLayoutSectionLogoCardsGrid
  | SearchLayoutSectionSuggestedTable;

export type SearchLayoutSectionModel = {
  id: string;
  title: string;
  /** Optional icon displayed next to the title (view-layer renders it). */
  titleIcon?: SearchLayoutIconToken;
  /** Optional linked-title variant (renders title as a link with chevron). */
  titleHref?: string;
  description?: string;
  /**
   * Optional RHS header actions (presentational only).
   * Used by the default list-page template for results (Sort + View mode).
   */
  headerActions?: {
    sort?: { label: string };
    viewMode?: { label: string };
  };
  content: SearchLayoutSectionContent;
};

export type SearchLayoutTableColumnModel = {
  key: string;
  label: string;
  /** Lower priority columns collapse first on narrow screens. */
  collapsePriority?: number;
};

export type SearchLayoutResultsShellModel = {
  viewMode: SearchLayoutViewMode;
  /** Optional asset type context used for view-mode rendering policy (e.g. grid thumbnails). */
  assetType?: SearchLayoutAssetTypeTokenValue;
  /** Custom table columns. When omitted, ResultsTable uses the default hardcoded columns. */
  tableColumns?: SearchLayoutTableColumnModel[];
};

export type SearchLayoutMenuTabModel = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SearchLayoutModel = {
  filters: SearchLayoutFiltersModel;
  /** Optional menu tabs row under the search input. */
  menuTabs?: SearchLayoutMenuTabModel[];
  /** Optional AI overview card rendered above sections/results. */
  aiOverview?: SearchLayoutAiOverviewModel;
  sections: SearchLayoutSectionModel[];
  resultsShell: SearchLayoutResultsShellModel;
};

export type SearchLayoutTemplateTab = {
  groupId: string;
  value: string;
  label: string;
};

export type SearchLayoutTemplate = {
  id: string;
  label: string;
  model: SearchLayoutModel;
  /**
   * Optional tab metadata for the few pages that treat tabs as separate templates.
   * When present, the UI can switch templates by switching tabs (filters/sections may differ).
   */
  tab?: SearchLayoutTemplateTab;
  /** Hide this template from the TEMP preview sidebar (still selectable via tabs). */
  hiddenInPreview?: boolean;
};

function makeTemplate({
  id,
  label,
  primaryAssetType,
}: {
  id: string;
  label: string;
  primaryAssetType: SearchLayoutAssetTypeTokenValue;
}): SearchLayoutTemplate {
  const primaryIcon: SearchLayoutIconToken = { kind: "assetType", value: primaryAssetType };
  const moreSectionTitle =
    primaryAssetType === "Notebooks"
      ? "More notebook"
      : primaryAssetType === "Tables"
        ? "More tables"
        : primaryAssetType === "Models"
          ? "More models"
          : primaryAssetType === "Dashboards"
            ? "More dashboards"
            : primaryAssetType === "Apps"
              ? "More apps"
              : "Results";
  const suggestedThumbnailMode =
    primaryAssetType === "Dashboards"
      ? ("dashboard" as const)
      : primaryAssetType === "Notebooks"
        ? ("code" as const)
        : primaryAssetType === "Tables" || primaryAssetType === "Models" || primaryAssetType === "GenieSpaces" || primaryAssetType === "Apps"
          ? ("placeholder" as const)
          : null;

  return {
    id,
    label,
    model: {
      filters: {
        placeholder: `Search ${label.toLowerCase()}...`,
        appliedCount: 0,
        hasFiltersApplied: false,
        // Default filter chips are static + overridable. Later we may introduce
        // user/content-driven “suggested” filters which likely require a richer model.
        chips: [
          { type: "favorite", id: "chip_favorite" },
          { type: "certified", id: "chip_certified" },
          { type: "owned", id: "chip_owned" },
          { type: "modifiedDropdown", id: "chip_modified" },
          { type: "domainDropdown", id: "chip_domain" },
        ],
      },
      menuTabs: undefined,
      sections: [
        // Note: default list-page templates aim to keep grids aligned across sections
        // (e.g. matching 4-up rows) so the page feels cohesive.
        //
        // Also: keep non-asset sections (domains, "create new", etc.) out of the middle of
        // asset sections; don’t insert them between asset rows when we add more sections later.
        {
          id: "suggested",
          title: "Suggested",
          content: {
            kind: "cardsGrid",
            cardKind: suggestedThumbnailMode ? "thumbnail" : "small",
            columns: { sm: 2, lg: 4 },
            items: [
              ...(suggestedThumbnailMode === "dashboard"
                ? ([
                    {
                      kind: "thumbnail",
                      id: "suggested_1",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                      thumbnail: { kind: "dashboard", index: 7, alt: "Dashboard preview" },
                    },
                    {
                      kind: "thumbnail",
                      id: "suggested_2",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                      thumbnail: { kind: "dashboard", index: 8, alt: "Dashboard preview" },
                    },
                    {
                      kind: "thumbnail",
                      id: "suggested_3",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                      thumbnail: { kind: "dashboard", index: 9, alt: "Dashboard preview" },
                    },
                    {
                      kind: "thumbnail",
                      id: "suggested_4",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                      thumbnail: { kind: "dashboard", index: 10, alt: "Dashboard preview" },
                    },
                  ] satisfies SearchLayoutCardModel[])
                : suggestedThumbnailMode === "code"
                  ? ([
                      {
                        kind: "thumbnail",
                        id: "suggested_1",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: {
                          kind: "code",
                          language: "python",
                          code: ["import pandas as pd", "", "df = spark.table('catalog.schema.table')", "df.head()"].join("\n"),
                        },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_2",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: {
                          kind: "code",
                          language: "sql",
                          code: ["SELECT", "  date_trunc('day', ts) AS day,", "  count(*) AS events", "FROM events", "GROUP BY 1"].join(
                            "\n",
                          ),
                        },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_3",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: {
                          kind: "code",
                          language: "typescript",
                          code: ["type Row = { id: string; value: number };", "export const rows: Row[] = [];"].join("\n"),
                        },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_4",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: {
                          kind: "code",
                          language: "python",
                          code: ["from sklearn.model_selection import train_test_split", "", "X_train, X_test = train_test_split(X)"].join(
                            "\n",
                          ),
                        },
                      },
                    ] satisfies SearchLayoutCardModel[])
                : suggestedThumbnailMode === "placeholder"
                  ? ([
                      {
                        kind: "thumbnail",
                        id: "suggested_1",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: { kind: "placeholder" },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_2",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: { kind: "placeholder" },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_3",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: { kind: "placeholder" },
                      },
                      {
                        kind: "thumbnail",
                        id: "suggested_4",
                        title: { label: `${id}.name`, icon: primaryIcon },
                        subtitle: "You view frequently",
                        thumbnail: { kind: "placeholder" },
                      },
                    ] satisfies SearchLayoutCardModel[])
                : ([
                    {
                      kind: "small",
                      id: "suggested_1",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                    },
                    {
                      kind: "small",
                      id: "suggested_2",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                    },
                    {
                      kind: "small",
                      id: "suggested_3",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                    },
                    {
                      kind: "small",
                      id: "suggested_4",
                      title: { label: `${id}.name`, icon: primaryIcon },
                      subtitle: "You view frequently",
                    },
                  ] satisfies SearchLayoutCardModel[])),
            ],
          },
        },
        {
          id: "results",
          title: moreSectionTitle,
          headerActions: {
            sort: { label: "Relevance" },
            viewMode: { label: "List" },
          },
          content: {
            kind: "cardsList",
            cardKind: "detail",
            items: Array.from({ length: 20 }, (_, idx) => {
              const n = idx + 1;
              return {
                kind: "detail",
                id: `result_${n}`,
                title: { label: `${id}.name_${n}`, icon: primaryIcon },
                metadataParts: ["catalog.schema", `Updated ${n}d ago`, `Viewed ${n + 3}d ago`],
                description:
                  "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
              };
            }),
          },
        },
      ],
      resultsShell: {
        viewMode: "list",
        assetType: primaryAssetType,
      },
    },
  };
}

/**
 * Build a SearchLayoutTemplate from a shared AssetEntry, using the "one" view
 * specs for field / column configuration (Databricks One list pages).
 */
const VALID_ASSET_TYPES: Set<string> = new Set<SearchLayoutAssetTypeTokenValue>([
  "Tables", "Dashboards", "Notebooks", "Models", "Jobs", "GenieSpaces",
  "Queries", "Alerts", "Folders", "Files", "Marketplace", "MetricViews",
  "Pipelines", "Endpoints", "Functions", "Volumes", "Apps",
]);

export function makeTemplateFromSpec(entry: AssetEntry): SearchLayoutTemplate {
  const assetType = entry.key as SearchLayoutAssetTypeTokenValue;
  const primaryIcon: SearchLayoutIconToken = VALID_ASSET_TYPES.has(entry.key)
    ? { kind: "assetType", value: assetType }
    : { kind: "icon", name: entry.iconName };
  const names = entry.sampleNames;
  const oneSpecs = entry.one;

  function pickDecorators(idx: number, frequent: boolean): SearchLayoutDecoratorKind[] | undefined {
    const out: SearchLayoutDecoratorKind[] = [];
    if (frequent) {
      if (idx % 2 === 0) out.push("certified");
      if (idx % 3 === 0) out.push("favorited");
      if (idx === 1) out.push("trending");
      if (idx === 2) out.push("popular");
    } else {
      if (idx % 5 === 0) out.push("certified");
      if (idx % 7 === 0) out.push("favorited");
      if (idx % 11 === 0) out.push("trending");
      if (idx % 13 === 0) out.push("popular");
    }
    return out.length > 0 ? out : undefined;
  }

  const domainTag = (idx: number): SearchLayoutTagModel => {
    const d = SAMPLE_DOMAINS[idx % SAMPLE_DOMAINS.length];
    const iconMapping = DOMAIN_ICON_MAP[d];
    return {
      label: d,
      color: getDomainColor(d) as SearchLayoutTagColor,
      iconName: iconMapping?.name,
      iconColorClass: iconMapping?.colorClass,
    };
  };

  const tableFields = oneSpecs.table;
  const tableColumnDefs: SearchLayoutTableColumnModel[] | undefined = tableFields
    ? getTableColumnHeaders(tableFields).map((col, i) => ({
        key: col,
        label: col,
        collapsePriority: (i + 1) * 10,
      }))
    : undefined;

  function buildTableFieldValues(rowIndex: number): Record<string, string> | undefined {
    if (!tableColumnDefs) return undefined;
    const fields: Record<string, string> = {};
    for (const col of tableColumnDefs) {
      const values = TABLE_SAMPLE_VALUES[col.key];
      fields[col.key] = values ? values[rowIndex % values.length] : col.key;
    }
    return fields;
  }

  const GENIE_PLACEHOLDER_POOL: { phosphorIcon: string; tagColor: string }[] = [
    { phosphorIcon: "ChartLineUp", tagColor: "Indigo" },
    { phosphorIcon: "CreditCard", tagColor: "Lemon" },
    { phosphorIcon: "Flask", tagColor: "Purple" },
    { phosphorIcon: "Megaphone", tagColor: "Coral" },
    { phosphorIcon: "ShieldCheck", tagColor: "Teal" },
    { phosphorIcon: "GearSix", tagColor: "Charcoal" },
    { phosphorIcon: "Headset", tagColor: "Turquoise" },
    { phosphorIcon: "CirclesThree", tagColor: "Lime" },
  ];

  function genieSpaceThumbnail(idx: number): SearchLayoutThumbnailCardModel["thumbnail"] {
    if (idx % 5 === 0) {
      const nn = String(1 + (idx % 4)).padStart(2, "0");
      return { kind: "image" as const, src: { light: `/images/genie-space-thumbnail-${nn}.png`, dark: `/images/genie-space-thumbnail-${nn}.png` }, alt: "Genie Space preview" };
    }
    const pool = GENIE_PLACEHOLDER_POOL[idx % GENIE_PLACEHOLDER_POOL.length];
    if (idx % 3 !== 0) {
      return { kind: "placeholder" as const };
    }
    return { kind: "placeholder" as const, phosphorIcon: pool.phosphorIcon, tagColor: pool.tagColor };
  }

  const suggestedItems: SearchLayoutCardModel[] = Array.from({ length: 4 }, (_, idx) => ({
    kind: "thumbnail" as const,
    id: `suggested_${idx + 1}`,
    title: { label: names[idx % names.length], icon: primaryIcon, decorators: pickDecorators(idx, true) },
    subtitle: "You view frequently",
    thumbnail: assetType === "Apps"
      ? { kind: "image" as const, src: { light: `/images/app-thumbnail-${String(1 + (idx % 10)).padStart(2, "0")}.png`, dark: `/images/app-thumbnail-${String(1 + (idx % 10)).padStart(2, "0")}.png` }, alt: "App preview" }
      : assetType === "GenieSpaces"
        ? genieSpaceThumbnail(idx)
        : entry.assetType
          ? { kind: "dashboard" as const, index: 16 + idx, alt: `${entry.label} preview` }
          : { kind: "placeholder" as const },
    tags: idx % 3 === 0 ? [domainTag(idx)] : undefined,
  }));

  const resultItems: SearchLayoutCardModel[] = Array.from({ length: 20 }, (_, idx) => {
    const name = names[idx % names.length];
    const n = idx + 1;
    return {
      kind: "detail" as const,
      id: `result_${n}`,
      title: { label: `${name} ${n}`, icon: primaryIcon, decorators: pickDecorators(idx, false) },
      metadataParts: [
        SAMPLE_OWNERS[idx % SAMPLE_OWNERS.length],
        `Updated ${n}d ago`,
        `Viewed ${n + 3}d ago`,
      ],
      description: DETAIL_DESCRIPTIONS[entry.key] ?? "Brief description of the item.",
      tags: idx % 3 !== 1 ? [domainTag(idx)] : undefined,
      tableFields: buildTableFieldValues(idx),
    };
  });

  return {
    id: entry.key.toLowerCase().replace(/\s+/g, "-"),
    label: entry.label,
    model: {
      filters: {
        placeholder: `Search ${entry.label.toLowerCase()}...`,
        appliedCount: 0,
        hasFiltersApplied: false,
        chips: [
          { type: "favorite", id: "chip_favorite" },
          { type: "certified", id: "chip_certified" },
          { type: "owned", id: "chip_owned" },
          { type: "modifiedDropdown", id: "chip_modified" },
          { type: "domainDropdown", id: "chip_domain" },
        ],
      },
      menuTabs: undefined,
      sections: [
        {
          id: "suggested",
          title: "Suggested",
          content: {
            kind: "cardsGrid",
            cardKind: "thumbnail",
            columns: { sm: 2, lg: 4 },
            items: suggestedItems,
          },
        },
        {
          id: "results",
          title: `More ${entry.label.toLowerCase()}`,
          headerActions: {
            sort: { label: "Relevance" },
            viewMode: { label: "List" },
          },
          content: {
            kind: "cardsList",
            cardKind: "detail",
            items: resultItems,
          },
        },
      ],
      resultsShell: {
        viewMode: "list",
        assetType,
        tableColumns: tableColumnDefs,
      },
    },
  };
}

function makeResultsOnlySection({
  id,
  title,
  primaryIcon,
  viewModeLabel,
  titleHref,
}: {
  id: string;
  title: string;
  primaryIcon: SearchLayoutIconToken;
  viewModeLabel: string;
  titleHref?: string;
}): SearchLayoutSectionModel {
  return {
    id,
    title,
    titleHref,
    headerActions: {
      sort: { label: "Relevance" },
      viewMode: { label: viewModeLabel },
    },
    content: {
      kind: "cardsList",
      cardKind: "detail",
      items: Array.from({ length: 20 }, (_, idx) => {
        const n = idx + 1;
        return {
          kind: "detail",
          id: `result_${n}`,
          title: { label: `match.name_${n}`, icon: primaryIcon },
          metadataParts: ["catalog.schema", `Updated ${n}d ago`, `Viewed ${n + 3}d ago`],
          description:
            "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
        };
      }),
    },
  };
}

function domainTag(domain: string): SearchLayoutTagModel {
  const d = domain.trim().toLowerCase();
  const color: SearchLayoutTagColor =
    d === "finance"
      ? "Indigo"
      : d === "sales"
        ? "Teal"
        : d === "marketing"
          ? "Pink"
          : d === "support"
            ? "Brown"
            : d === "product"
              ? "Indigo"
              : d === "security"
                ? "Turquoise"
                : d === "operations"
                  ? "Coral"
                  : d === "engineering"
                    ? "Lime"
                    : "Default";
  return { label: domain, color };
}

/** Serializable templates for design review (temporary). */
export const SEARCH_LAYOUT_TEMPLATES: SearchLayoutTemplate[] = [
  makeTemplate({ id: "tables", label: "Tables", primaryAssetType: "Tables" }),
  makeTemplate({ id: "notebooks", label: "Notebooks", primaryAssetType: "Notebooks" }),
  (() => {
    const spec = ASSET_SPECS.find((s) => s.key === "Dashboards");
    if (!spec) return makeTemplate({ id: "dashboards", label: "Dashboards", primaryAssetType: "Dashboards" });
    const t = makeTemplateFromSpec(spec);
    return {
      ...t,
      id: "dashboards",
      label: "Dashboards",
      model: { ...t.model, resultsShell: { ...t.model.resultsShell, viewMode: "grid" as const } },
    };
  })(),
  (() => {
    const spec = ASSET_SPECS.find((s) => s.key === "GenieSpaces");
    if (!spec) return makeTemplate({ id: "genie-spaces", label: "Genie", primaryAssetType: "GenieSpaces" });
    const t = makeTemplateFromSpec(spec);
    return { ...t, id: "genie-spaces", label: "Genie Spaces" };
  })(),
  (() => {
    const t = makeTemplate({ id: "legacy_dashboards", label: "Legacy Dashboards", primaryAssetType: "Dashboards" });
    return {
      ...t,
      model: {
        ...t.model,
        // Legacy dashboards page does not have a Suggested section.
        sections: t.model.sections.filter((s) => s.id !== "suggested"),
      },
    };
  })(),
  makeTemplate({ id: "models", label: "Models", primaryAssetType: "Models" }),
  (() => {
    const spec = ASSET_SPECS.find((s) => s.key === "Apps");
    if (!spec) return makeTemplate({ id: "apps", label: "Apps", primaryAssetType: "Apps" });
    const t = makeTemplateFromSpec(spec);
    return {
      ...t,
      id: "apps",
      label: "Apps",
      model: { ...t.model, resultsShell: { ...t.model.resultsShell, viewMode: "grid" as const } },
    };
  })(),
  (() => {
    const spec = ASSET_SPECS.find((s) => s.key === "Domains");
    if (!spec) return makeTemplate({ id: "domains", label: "Domains", primaryAssetType: "Tables" });
    const t = makeTemplateFromSpec(spec);
    const domainNames = spec.sampleNames;
    function applyDomainIcons(items: SearchLayoutCardModel[]): SearchLayoutCardModel[] {
      return items.map((item) => {
        const baseName = domainNames.find((d) => item.title.label.startsWith(d));
        const mapping = baseName ? DOMAIN_ICON_MAP[baseName] : undefined;
        return {
          ...item,
          tags: undefined,
          ...(mapping
            ? { title: { ...item.title, icon: { kind: "icon" as const, name: mapping.name, className: mapping.colorClass } } }
            : {}),
        };
      });
    }

    const sections = t.model.sections
      .filter((s) => s.id !== "suggested")
      .map((s) => {
        if (s.content.kind === "cardsList") {
          return { ...s, content: { ...s.content, items: applyDomainIcons(s.content.items) } };
        }
        if (s.content.kind === "cardsGrid") {
          return { ...s, content: { ...s.content, items: applyDomainIcons(s.content.items) } };
        }
        return s;
      });
    return {
      ...t,
      id: "domains",
      label: "Domains",
      model: {
        ...t.model,
        resultsShell: { ...t.model.resultsShell, viewMode: "detail" as const },
        sections,
      },
    };
  })(),
  {
    id: "insights",
    label: "Insights",
    model: {
      filters: {
        placeholder: "Search insights",
        appliedCount: 0,
        hasFiltersApplied: false,
        chips: [
          { type: "custom", id: "chip_subscriptions", label: "My subscriptions" },
          { type: "custom", id: "chip_dashboard", label: "Dashboard", icon: { kind: "assetType", value: "Dashboards" } },
          { type: "custom", id: "chip_report", label: "Report", icon: { kind: "icon", name: "fileDocumentIcon" } },
        ],
      },
      sections: [
        {
          id: "today",
          title: "Today, March 16",
          content: {
            kind: "cardsList",
            cardKind: "detail",
            items: [
              {
                kind: "detail",
                id: "insight_1",
                title: {
                  label: "Surge in Running Footwear Demand Across North America",
                  icon: { kind: "assetType", value: "Dashboards" },
                },
                metadataParts: ["Pipeline Health", "2h ago"],
                description:
                  "Demand for running shoes increased +14 % week-over-week, driven largely by new product launches and seasonal training activity. Inventory levels remain stable, though several top SKUs are approaching low-stock thresholds.",
                thumbnail: { kind: "dashboard", index: 1, alt: "Dashboard preview" },
              },
              {
                kind: "detail",
                id: "insight_2",
                title: {
                  label: "Daily Warehouse Cost Report",
                  icon: { kind: "icon", name: "fileDocumentIcon" },
                },
                metadataParts: ["Daily Warehouse Cost Report", "2h ago"],
                description:
                  'This document is a Daily Warehouse Cost Report for March 8, 2026. It details spending, top warehouse, and workspaces. Total spending increased slightly by +0.5% with no anomalies detected. Key insights include the dominance of workspace and the high cost of the "0-shared SQL Warehouse".',
              },
              {
                kind: "detail",
                id: "insight_3",
                title: {
                  label: "Surge in Running Footwear Demand Across North America",
                  icon: { kind: "assetType", value: "Dashboards" },
                },
                metadataParts: ["Pipeline Health", "2h ago"],
                tags: [{ label: "Paused" }],
                description:
                  "Demand for running shoes increased +14 % week-over-week, driven largely by new product launches and seasonal training activity. Inventory levels remain stable, though several top SKUs are approaching low-stock thresholds.",
                thumbnail: { kind: "dashboard", index: 4, alt: "Dashboard preview" },
              },
              {
                kind: "detail",
                id: "insight_4",
                title: {
                  label: "Daily Warehouse Cost Report",
                  icon: { kind: "icon", name: "fileDocumentIcon" },
                },
                metadataParts: ["Daily Warehouse Cost Report", "2h ago"],
                description:
                  'This document is a Daily Warehouse Cost Report for March 8, 2026. It details spending, top warehouse, and workspaces. Total spending increased slightly by +0.5% with no anomalies detected. Key insights include the dominance of workspace and the high cost of the "0-shared SQL Warehouse".',
              },
            ] satisfies SearchLayoutCardModel[],
          },
        },
        {
          id: "yesterday",
          title: "Yesterday, March 15",
          content: {
            kind: "cardsList",
            cardKind: "detail",
            items: [
              {
                kind: "detail",
                id: "insight_5",
                title: {
                  label: "Surge in Running Footwear Demand Across North America",
                  icon: { kind: "assetType", value: "Dashboards" },
                },
                metadataParts: ["Pipeline Health", "2h ago"],
                description:
                  "Demand for running shoes increased +14 % week-over-week, driven largely by new product launches and seasonal training activity. Inventory levels remain stable, though several top SKUs are approaching low-stock thresholds.",
                thumbnail: { kind: "dashboard", index: 7, alt: "Dashboard preview" },
              },
              {
                kind: "detail",
                id: "insight_6",
                title: {
                  label: "Surge in Running Footwear Demand Across North America",
                  icon: { kind: "assetType", value: "Dashboards" },
                },
                metadataParts: ["Pipeline Health", "2h ago"],
                description:
                  "Demand for running shoes increased +14 % week-over-week, driven largely by new product launches and seasonal training activity. Inventory levels remain stable, though several top SKUs are approaching low-stock thresholds.",
                thumbnail: { kind: "dashboard", index: 8, alt: "Dashboard preview" },
              },
              {
                kind: "detail",
                id: "insight_7",
                title: {
                  label: "Daily Warehouse Cost Report",
                  icon: { kind: "icon", name: "fileDocumentIcon" },
                },
                metadataParts: ["Daily Warehouse Cost Report", "2h ago"],
                description:
                  'This document is a Daily Warehouse Cost Report for March 8, 2026. It details spending, top warehouse, and workspaces. Total spending increased slightly by +0.5% with no anomalies detected. Key insights include the dominance of workspace and the high cost of the "0-shared SQL Warehouse".',
              },
            ] satisfies SearchLayoutCardModel[],
          },
        },
      ],
      resultsShell: { viewMode: "detail" },
    },
  },
  {
    id: "discover",
    label: "Discover",
    model: {
      filters: {
        placeholder: "Search...",
        appliedCount: 0,
        hasFiltersApplied: false,
        chips: [
          // Status first.
          { type: "certified", id: "chip_certified" },
          // Type is a single dropdown (no type pills in the row).
          { type: "custom", id: "chip_type", label: "Type", kind: "dropdown" },
          { type: "domainDropdown", id: "chip_domain" },
        ],
      },
      sections: [
        {
          id: "domains",
          title: "Browse by domain",
          titleHref: "/search?template=discover#domains",
          content: {
            kind: "cardsGrid",
            cardKind: "small",
            cardBackground: "secondary",
            columns: { sm: 2, lg: 4 },
            items: [
              {
                kind: "small",
                id: "domain_finance",
                title: { label: "Finance", icon: { kind: "phosphor", name: "CreditCard", className: "text-tag-iconColor-indigo" } },
                subtitle: "Spend, billing, and forecasting.",
                metadata: "312 assets",
              },
              {
                kind: "small",
                id: "domain_sales",
                title: { label: "Sales", icon: { kind: "phosphor", name: "ChartLineUp", className: "text-tag-iconColor-teal" } },
                subtitle: "Pipeline, bookings, and performance.",
                metadata: "228 assets",
              },
              {
                kind: "small",
                id: "domain_marketing",
                title: { label: "Marketing", icon: { kind: "phosphor", name: "Megaphone", className: "text-tag-iconColor-pink" } },
                subtitle: "Campaigns, attribution, and growth.",
                metadata: "184 assets",
              },
              {
                kind: "small",
                id: "domain_security",
                title: { label: "Security", icon: { kind: "phosphor", name: "ShieldCheck", className: "text-tag-iconColor-turquoise" } },
                subtitle: "Access, audit, and compliance.",
                metadata: "96 assets",
              },
              {
                kind: "small",
                id: "domain_operations",
                title: { label: "Operations", icon: { kind: "phosphor", name: "GearSix", className: "text-tag-iconColor-coral" } },
                subtitle: "Reliability, process, and efficiency.",
                metadata: "141 assets",
              },
              {
                kind: "small",
                id: "domain_support",
                title: { label: "Support", icon: { kind: "phosphor", name: "Headset", className: "text-tag-iconColor-brown" } },
                subtitle: "Tickets, SLAs, and satisfaction.",
                metadata: "73 assets",
              },
              {
                kind: "small",
                id: "domain_engineering",
                title: { label: "Engineering", icon: { kind: "phosphor", name: "Flask", className: "text-tag-iconColor-lime" } },
                subtitle: "Build health, incidents, and delivery.",
                metadata: "267 assets",
              },
              {
                kind: "small",
                id: "domain_product",
                title: { label: "Product", icon: { kind: "phosphor", name: "Tag", className: "text-tag-iconColor-indigo" } },
                subtitle: "Roadmaps, experiments, and usage.",
                metadata: "119 assets",
              },
            ],
          },
        },
        {
          id: "suggested",
          title: "Suggested",
          titleHref: "/search?template=discover#suggested",
          content: {
            kind: "suggestedTable",
            rows: [
              {
                id: "s1",
                icon: { kind: "icon", name: "tableIcon" },
                name: "Sales Supply Chain Optimization",
                reason: "You view frequently",
                owner: "Nina Adams",
              },
              {
                id: "s2",
                icon: { kind: "icon", name: "dashboardIcon" },
                name: "Sales Pipeline Manager",
                reason: "Viewed 2 hours ago",
                owner: "Liam Baker",
              },
              {
                id: "s3",
                icon: { kind: "icon", name: "notebookIcon" },
                name: "User Experience Assessment",
                reason: "Trending",
                owner: "Olivia Carter",
              },
              {
                id: "s4",
                icon: { kind: "icon", name: "modelsIcon" },
                name: "Customer Cohort Analysis",
                reason: "You view frequently",
                owner: "Samantha Green",
              },
              {
                id: "s5",
                icon: { kind: "icon", name: "SparkleRectangleIcon" },
                name: "R&D Planning Dashboard",
                reason: "Viewed 1 day ago",
                owner: "Quincy James",
              },
              {
                id: "s6",
                icon: { kind: "icon", name: "tableIcon" },
                name: "Revenue Forecasting (FY27)",
                reason: "Trending",
                owner: "Ava Patel",
              },
              {
                id: "s7",
                icon: { kind: "icon", name: "dashboardIcon" },
                name: "Customer Support Triage",
                reason: "Viewed 3 hours ago",
                owner: "Ethan Brooks",
              },
              {
                id: "s8",
                icon: { kind: "icon", name: "notebookIcon" },
                name: "Product Experiment Tracker",
                reason: "You view frequently",
                owner: "Mia Chen",
              },
            ],
          },
        },
        {
          id: "certified",
          title: "Certified",
          titleHref: "/search?template=discover#certified",
          description: "High-confidence assets reviewed for quality",
          titleIcon: { kind: "icon", name: "CertifiedIcon", className: "text-signal-icon-certified" },
          content: {
            kind: "cardsGrid",
            cardKind: "thumbnail",
            columns: { sm: 2, lg: 4 },
            items: [
              {
                kind: "thumbnail",
                id: "cert_table_1",
                title: { label: "main.sales.pipeline_events", icon: { kind: "assetType", value: "Tables" } },
                // Not all assets have domains.
                thumbnail: { kind: "placeholder" },
              },
              {
                kind: "thumbnail",
                id: "cert_table_2",
                title: { label: "main.marketing.campaign_attribution", icon: { kind: "assetType", value: "Tables" } },
                tags: [domainTag("Marketing")],
                thumbnail: { kind: "placeholder" },
              },
              {
                kind: "thumbnail",
                id: "cert_dashboard_1",
                title: { label: "finance_kpi_tracker", icon: { kind: "assetType", value: "Dashboards" } },
                // Not all assets have domains.
                thumbnail: { kind: "dashboard", index: 9, alt: "Dashboard preview" },
              },
              {
                kind: "thumbnail",
                id: "cert_genie_1",
                title: { label: "Sales pipeline assistant", icon: { kind: "assetType", value: "GenieSpaces" } },
                tags: [domainTag("Sales")],
                thumbnail: { kind: "placeholder" },
              },
            ],
          },
        },
        {
          id: "types",
          title: "Browse by type",
          titleHref: "/search?template=discover#types",
          content: {
            kind: "cardsGrid",
            cardKind: "small",
            cardBackground: "secondary",
            columns: { sm: 2, lg: 4 },
            items: [
              {
                kind: "small",
                id: "type_tables",
                title: { label: "Tables", icon: { kind: "assetType", value: "Tables" } },
              },
              {
                kind: "small",
                id: "type_dashboards",
                title: { label: "Dashboards", icon: { kind: "assetType", value: "Dashboards" } },
              },
              {
                kind: "small",
                id: "type_apps",
                title: { label: "Apps", icon: { kind: "icon", name: "AppsAssetIcon" } },
              },
              {
                kind: "small",
                id: "type_genie",
                title: { label: "Genie spaces", icon: { kind: "assetType", value: "GenieSpaces" } },
              },
              {
                kind: "small",
                id: "type_models",
                title: { label: "Models", icon: { kind: "assetType", value: "Models" } },
              },
              {
                kind: "small",
                id: "type_notebooks",
                title: { label: "Notebooks", icon: { kind: "assetType", value: "Notebooks" } },
              },
              {
                kind: "small",
                id: "type_jobs",
                title: { label: "Jobs", icon: { kind: "assetType", value: "Jobs" } },
              },
              {
                kind: "small",
                id: "type_queries",
                title: { label: "Queries", icon: { kind: "assetType", value: "Queries" } },
              },
            ],
          },
        },
        {
          id: "genie_spaces",
          title: "Genie spaces",
          titleHref: "/search?template=discover#genie_spaces",
          description: "Conversational spaces for exploring data and generating insights.",
          content: {
            kind: "cardsGrid",
            cardKind: "small",
            columns: { sm: 2, lg: 2 },
            items: [
              {
                kind: "small",
                id: "genie_1",
                title: { label: "Support triage copilot", icon: { kind: "phosphor", name: "Headset", className: "text-tag-iconColor-brown" } },
                subtitle: "Ask questions about ticket volume, SLAs, and escalation trends. Summarize drivers behind spikes and outliers.",
                tags: [domainTag("Support")],
              },
              {
                kind: "small",
                id: "genie_2",
                title: { label: "Finance Q&A space", icon: { kind: "phosphor", name: "CreditCard", className: "text-tag-iconColor-indigo" } },
                subtitle: "Explore spend, forecasts, and budget variance with conversational analysis.",
                // Not all assets have domains.
              },
              {
                kind: "small",
                id: "genie_3",
                title: { label: "Sales pipeline assistant", icon: { kind: "phosphor", name: "ChartLineUp", className: "text-tag-iconColor-teal" } },
                subtitle: "Investigate pipeline changes and key drivers across segments and regions. Compare week-over-week movement and identify top contributors. Draft quick follow-up questions for deeper dives.",
                tags: [domainTag("Sales")],
              },
              {
                kind: "small",
                id: "genie_4",
                title: { label: "Product insights space", icon: { kind: "phosphor", name: "Tag", className: "text-tag-iconColor-indigo" } },
                subtitle: "Generate insights on activation, retention, and feature adoption patterns. Turn questions into clear takeaways for stakeholders.",
                // Not all assets have domains.
              },
            ],
          },
        },
        {
          id: "foundational_models",
          title: "Foundational models",
          titleHref: "/search?template=discover#foundational_models",
          description:
            "General-purpose AI models that serve as the foundation for downstream applications and workflows",
          content: {
            kind: "logoCardsGrid",
            columns: { sm: 2, lg: 4 },
            items: [
              // Provider labels: left to right.
              { id: "fm_gpt_5_2", logo: { src: "/logos/OpenAI.png", alt: "OpenAI" }, title: "GPT-5.2", subtitle: "OpenAI" },
              { id: "fm_claude_opus", logo: { src: "/logos/Claude.png", alt: "Anthropic" }, title: "Claude Opus 4.6", subtitle: "Anthropic" },
              { id: "fm_gemini_3", logo: { src: "/logos/Gemini.png", alt: "Google" }, title: "Gemini 3 Pro", subtitle: "Google" },
              { id: "fm_gpt_oss", logo: { src: "/logos/OpenAI.png", alt: "OpenAI" }, title: "GPT OSS 120B", subtitle: "OpenAI" },
            ],
          },
        },
        {
          id: "dashboards",
          title: "Dashboards",
          titleHref: "/search?template=discover#dashboards",
          description: "Visual views for tracking metrics and trends.",
          content: {
            kind: "cardsGrid",
            cardKind: "thumbnail",
            columns: { sm: 2, lg: 4 },
            items: [
              {
                kind: "thumbnail",
                id: "dashboard_1",
                title: { label: "Sales pipeline overview", icon: { kind: "assetType", value: "Dashboards" } },
                tags: [domainTag("Sales")],
                thumbnail: { kind: "dashboard", index: 7, alt: "Dashboard preview" },
              },
              {
                kind: "thumbnail",
                id: "dashboard_2",
                title: { label: "Weekly marketing performance", icon: { kind: "assetType", value: "Dashboards" } },
                // Not all assets have domains.
                thumbnail: { kind: "dashboard", index: 8, alt: "Dashboard preview" },
              },
              {
                kind: "thumbnail",
                id: "dashboard_3",
                title: { label: "Finance KPI tracker", icon: { kind: "assetType", value: "Dashboards" } },
                tags: [domainTag("Finance")],
                thumbnail: { kind: "dashboard", index: 9, alt: "Dashboard preview" },
              },
              {
                kind: "thumbnail",
                id: "dashboard_4",
                title: { label: "Support queue health", icon: { kind: "assetType", value: "Dashboards" } },
                // Not all assets have domains.
                thumbnail: { kind: "dashboard", index: 10, alt: "Dashboard preview" },
              },
            ],
          },
        },
        {
          id: "apps",
          title: "Apps",
          titleHref: "/search?template=discover#apps",
          description: "Purpose-built experiences built on data and logic.",
          content: {
            kind: "cardsGrid",
            cardKind: "thumbnail",
            columns: { sm: 2, lg: 4 },
            items: [
              {
                kind: "thumbnail",
                id: "app_1",
                title: { label: "Churn explorer", icon: { kind: "icon", name: "AppsAssetIcon" } },
                tags: [domainTag("Sales")],
                thumbnail: { kind: "placeholder" },
              },
              {
                kind: "thumbnail",
                id: "app_2",
                title: { label: "Revenue forecasts", icon: { kind: "icon", name: "AppsAssetIcon" } },
                // Not all assets have domains.
                thumbnail: { kind: "placeholder" },
              },
              {
                kind: "thumbnail",
                id: "app_3",
                title: { label: "Campaign QA", icon: { kind: "icon", name: "AppsAssetIcon" } },
                tags: [domainTag("Marketing")],
                thumbnail: { kind: "placeholder" },
              },
              {
                kind: "thumbnail",
                id: "app_4",
                title: { label: "Support insights", icon: { kind: "icon", name: "AppsAssetIcon" } },
                // Not all assets have domains.
                thumbnail: { kind: "placeholder" },
              },
            ],
          },
        },
        {
          id: "tables",
          title: "Tables",
          titleHref: "/search?template=discover#tables",
          description: "Core datasets used across workflows",
          content: {
            kind: "cardsGrid",
            cardKind: "small",
            columns: { sm: 2, lg: 2 },
            items: [
              {
                kind: "small",
                id: "table_1",
                title: { label: "main.finance.revenue_daily", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "Daily revenue by product and region used for executive reporting. Includes standardized calendar and currency fields.",
                tags: [domainTag("Finance")],
              },
              {
                kind: "small",
                id: "table_2",
                title: { label: "main.sales.pipeline_events", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "Stage changes and activity events used across Sales dashboards. Helpful for funnel, velocity, and conversion analysis.",
                // Not all assets have domains.
              },
              {
                kind: "small",
                id: "table_3",
                title: { label: "main.marketing.campaign_attribution", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "Campaign touchpoints and attribution signals for weekly performance tracking.",
                tags: [domainTag("Marketing")],
              },
              {
                kind: "small",
                id: "table_4",
                title: { label: "main.product.user_events", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "User interaction events for product usage analytics and experiments. Supports activation and retention metrics. Commonly joined to user and account dimensions.",
                // Not all assets have domains.
              },
              {
                kind: "small",
                id: "table_5",
                title: { label: "main.support.ticket_events", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "Support ticket lifecycle events with SLA timestamps and outcomes. Useful for queue health and staffing reviews.",
                tags: [domainTag("Support")],
              },
              {
                kind: "small",
                id: "table_6",
                title: { label: "main.security.audit_logs", icon: { kind: "assetType", value: "Tables" } },
                subtitle:
                  "Audit logs for access and administrative actions across key systems.",
                // Not all assets have domains.
              },
            ],
          },
        },
      ],
      resultsShell: { viewMode: "list" },
    },
  },
  {
    id: "search_results",
    label: "Search results",
    model: {
      filters: {
        placeholder: "Search...",
        appliedCount: 0,
        hasFiltersApplied: false,
        chips: [
          { type: "assetType", id: "chip_notebooks", assetType: "Notebooks" },
          { type: "assetType", id: "chip_tables", assetType: "Tables" },
          { type: "assetType", id: "chip_jobs", assetType: "Jobs" },
          { type: "typeDropdown", id: "chip_type" },
          { type: "owned", id: "chip_owned" },
          { type: "modifiedDropdown", id: "chip_modified" },
          { type: "certified", id: "chip_certified" },
          { type: "domainDropdown", id: "chip_domain" },
        ],
      },
      sections: [
        makeResultsOnlySection({
          id: "results",
          title: "Search results",
          primaryIcon: { kind: "assetType", value: "Tables" },
          viewModeLabel: "Detail",
        }),
      ],
      resultsShell: { viewMode: "detail" },
    },
  },
  {
    id: "ai_search",
    label: "AI search",
    model: {
      filters: {
        placeholder: "Ask a question...",
        appliedCount: 0,
        hasFiltersApplied: false,
        chips: [
          { type: "assetType", id: "chip_notebooks", assetType: "Notebooks" },
          { type: "assetType", id: "chip_tables", assetType: "Tables" },
          { type: "assetType", id: "chip_jobs", assetType: "Jobs" },
          { type: "typeDropdown", id: "chip_type" },
          { type: "owned", id: "chip_owned" },
          { type: "modifiedDropdown", id: "chip_modified" },
          { type: "certified", id: "chip_certified" },
          { type: "domainDropdown", id: "chip_domain" },
        ],
      },
      aiOverview: {
        defaultExpanded: false,
        followUpMode: "input",
        showCollapseButton: true,
        text:
          "Here’s what I found based on your question.\n\nSummary\n- 20 matching assets across Tables, Notebooks, and Jobs\n- Most of the matches cluster around a single schema (catalog.schema)\n- Recent activity suggests the freshest items are the best starting point\n\nHow to narrow quickly\n1) Use Type to restrict to the asset kind you actually want (Table vs Notebook vs Job).\n2) Use Domain to focus on the area of the business you care about.\n3) If you’re looking for something current, sort by Updated and start from the top.\n\nWhat I’m doing (high level)\n- Prioritizing assets with similar names + metadata patterns\n- Using recent updates and views as a relevance signal\n- Surfacing a small set of references you can inspect to verify correctness",
        refs: [
          { id: "ref_1", label: "catalog.schema" },
          { id: "ref_2", label: "run_history" },
        ],
      },
      sections: [
        makeResultsOnlySection({
          id: "results",
          title: "Search results",
          primaryIcon: { kind: "assetType", value: "Tables" },
          viewModeLabel: "Detail",
        }),
      ],
      resultsShell: { viewMode: "detail" },
    },
  },
];

export function buildSearchLayoutModel(): SearchLayoutModel {
  return SEARCH_LAYOUT_TEMPLATES[0]!.model;
}

function normalizeTerms(q: string) {
  return q
    .toLowerCase()
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

function matchesQuery(haystack: string, terms: string[]) {
  if (terms.length === 0) return true;
  const h = haystack.toLowerCase();
  // Simple substring matching for the demo: require at least one term match.
  return terms.some((t) => h.includes(t));
}

export function buildSearchDemoModel(q: string): SearchLayoutModel {
  const query = q.trim();
  const terms = normalizeTerms(query);

  const filters: SearchLayoutFiltersModel = {
    placeholder: "Search...",
    appliedCount: 0,
    hasFiltersApplied: false,
    chips: [
      { type: "assetType", id: "chip_notebooks", assetType: "Notebooks" },
      { type: "assetType", id: "chip_tables", assetType: "Tables" },
      { type: "assetType", id: "chip_jobs", assetType: "Jobs" },
      { type: "typeDropdown", id: "chip_type" },
      { type: "owned", id: "chip_owned" },
      { type: "modifiedDropdown", id: "chip_modified" },
      { type: "certified", id: "chip_certified" },
      { type: "domainDropdown", id: "chip_domain" },
    ],
  };

  const aiOverview: SearchLayoutAiOverviewModel = {
    defaultExpanded: false,
    followUpMode: "input",
    showCollapseButton: true,
    followUpPlaceholder: "Ask a follow-up question",
    followUpSuggestions: [
      { id: "s1", label: "Which churn features are most predictive, and where are they defined?" },
      { id: "s2", label: "How is the churn model trained and kept in sync with governed tables?" },
    ],
    text:
      `Here’s what I found for “${query || "customer churn"}”.\n\n` +
      "Summary\n" +
      "- This workspace contains governed assets for analyzing customer churn.\n" +
      "- There are certified churn tables, feature engineering notebooks, a production churn model, and supporting dashboards.\n" +
      "- Governance helps keep definitions and access consistent across teams (lineage, permissions, and shared metrics).\n\n" +
      "What I recommend\n" +
      "1) Start with the certified churn tables as the source of truth.\n" +
      "2) Validate feature definitions in the feature engineering notebooks.\n" +
      "3) Review the production model + training job to ensure it stays in sync with the underlying tables.\n",
    refs: [
      { id: "ref_1", label: "main.customer_churn.customer_events" },
      { id: "ref_2", label: "main.customer_churn.churn_labels" },
      { id: "ref_3", label: "prod_models.customer_churn_prediction" },
      { id: "ref_4", label: "dashboards.customer_churn_overview" },
    ],
  };

  const curated: SearchLayoutDetailCardModel[] = [
    {
      kind: "detail",
      id: "table_churn_labels",
      title: { label: "main.customer_churn.churn_labels", icon: { kind: "assetType", value: "Tables" } },
      metadataParts: ["main.customer_churn", "Updated 2d ago", "Viewed 1d ago"],
      description:
        "Certified customer churn labels table used for training and evaluation.",
      indentedSnippet: {
        text:
          "Schema\n- customer_id\n- snapshot_date\n- <<churn_label>>\n- churn_reason\n- tenure_days",
      },
    },
    {
      kind: "detail",
      id: "table_customer_events",
      title: { label: "main.customer_churn.customer_events", icon: { kind: "assetType", value: "Tables" } },
      metadataParts: ["main.customer_churn", "Updated 4d ago", "Viewed 2d ago"],
      description:
        "Customer interaction events table with consistent access controls and lineage.",
      indentedSnippet: {
        text:
          "Top columns\n- customer_id\n- event_ts\n- event_type\n- plan_tier\n- <<churn_risk_score>>",
      },
    },
    {
      kind: "detail",
      id: "notebook_feature_engineering",
      title: { label: "customer_churn_feature_engineering", icon: { kind: "assetType", value: "Notebooks" } },
      metadataParts: ["Workspace", "Updated 1d ago", "Viewed 3h ago"],
      description:
        "Feature engineering notebook that produces a churn feature set from customer churn tables.",
      codeSnippet: {
        language: "python",
        highlightedTokens: ["churn_label", "feature_df"],
        code: [
          "from pyspark.sql import functions as F",
          "",
          "labels = spark.table('main.customer_churn.churn_labels')",
          "events = spark.table('main.customer_churn.customer_events')",
          "",
          "feature_df = (events",
          "  .join(labels, on='customer_id', how='left')",
          "  .groupBy('customer_id')",
          "  .agg(",
          "    F.max('churn_label').alias('churn_label'),",
          "    F.count('*').alias('event_count'),",
          "  )",
          ")",
        ].join("\n"),
      },
    },
    {
      kind: "detail",
      id: "dashboard_churn_overview",
      title: { label: "customer_churn_overview", icon: { kind: "assetType", value: "Dashboards" } },
      metadataParts: ["main.customer_churn", "Updated 5d ago", "Viewed 2d ago"],
      description:
        "Dashboard tracking churn KPIs and segments backed by the customer churn tables.",
      thumbnail: { kind: "dashboard", index: 9, alt: "Dashboard preview" },
    },
    {
      kind: "detail",
      id: "model_churn_prod",
      title: { label: "prod_models.customer_churn_prediction", icon: { kind: "assetType", value: "Models" } },
      metadataParts: ["Model Registry", "Updated 3d ago", "Viewed 2d ago"],
      description:
        "Production churn model trained from labels and features with lineage retained.",
    },
    {
      kind: "detail",
      id: "job_churn_training",
      title: { label: "daily_customer_churn_training_job", icon: { kind: "assetType", value: "Jobs" } },
      metadataParts: ["Workflows", "Updated 1w ago", "Viewed 6d ago"],
      description:
        "Scheduled job that refreshes features and retrains the churn model from governed tables.",
    },
    {
      kind: "detail",
      id: "genie_space_churn",
      title: {
        label: "Customer churn analysis",
        icon: { kind: "assetType", value: "GenieSpaces" },
      },
      metadataParts: ["Genie", "Updated 2w ago", "Viewed 1w ago"],
      description:
        "Genie space for technical/business users to ask questions about churn using governed assets.",
    },
    {
      kind: "detail",
      id: "notebook_lineage_check",
      title: { label: "lineage_checks_for_customer_churn", icon: { kind: "assetType", value: "Notebooks" } },
      metadataParts: ["Workspace", "Updated 6d ago", "Viewed 3d ago"],
      description:
        "Notebook validating lineage and access controls for churn assets.",
    },
  ];

  const filtered = curated.filter((r) => {
    const haystack = [r.title.label, r.description ?? "", ...(r.metadataParts ?? [])].join(" ");
    return matchesQuery(haystack, terms);
  });

  const results = filtered.length >= 4 ? filtered : curated;

  return {
    filters,
    aiOverview,
    sections: [
      {
        id: "results",
        title: "Search results",
        headerActions: { sort: { label: "Relevance" }, viewMode: { label: "Detail" } },
        content: { kind: "cardsList", cardKind: "detail", items: results },
      },
    ],
    resultsShell: { viewMode: "detail", assetType: "Tables" },
  };
}

