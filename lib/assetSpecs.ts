import type { TagColor } from "@/components/Tag/Tag";
import type { NameLabelDecorator } from "@/components/NameLabel";
import {
  AssetTypes,
  type AssetType,
} from "@/components/AssetVisuals/assetTypeIcons";

// ---------------------------------------------------------------------------
// Spec types
// ---------------------------------------------------------------------------

export type FieldSpec = string[];

export type ViewSpecs = {
  grid: FieldSpec;
  table: FieldSpec | null;
  detail: FieldSpec;
};

export type AssetEntry = {
  key: string;
  label: string;
  iconName: string;
  assetType?: AssetType;
  sampleNames: string[];
  one: ViewSpecs;
  lakehouse: ViewSpecs;
};

export type ViewMode = "grid" | "detail" | "table";

export const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: "grid", label: "Grid" },
  { id: "detail", label: "Detail" },
  { id: "table", label: "Table" },
];

export type ThemeMode = "lakehouse" | "one" | "both";

export type FieldToggles = {
  hasDomain: boolean;
  hasThumbnail: boolean;
  isCertified: boolean;
  isFavorite: boolean;
  isTrending: boolean;
  isPopular: boolean;
  isAccountLevel: boolean;
  hasViewed: boolean;
};

// ---------------------------------------------------------------------------
// Spec data (derived from JSON)
// ---------------------------------------------------------------------------

export const ASSET_SPECS: AssetEntry[] = [
  {
    key: "Dashboards",
    label: "Dashboards",
    iconName: "dashboardIcon",
    assetType: AssetTypes.Dashboards,
    sampleNames: ["Q1 Revenue Summary", "Marketing Attribution", "Ops Health"],
    one: {
      grid: ["Name", "Certified, Favorite", "Owner", "Thumbnail", "Domain", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Updated", "Description", "Last viewed", "Views", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Updated", "Domain", "Description", "Last viewed", "Views"],
    },
    lakehouse: {
      grid: ["Name", "Certified, Favorite", "Owner", "Thumbnail", "Domain", "Trending/popular", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Trending/popular", "Description", "File location", "Last viewed", "Views", "Tags", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Domain", "Tags", "Popularity", "File location", "Description", "Last viewed", "Views"],
    },
  },
  {
    key: "GenieSpaces",
    label: "Genie Spaces",
    iconName: "SparkleRectangleIcon",
    assetType: AssetTypes.GenieSpaces,
    sampleNames: ["Revenue Insights", "Customer 360", "Supply Chain Q&A"],
    one: {
      grid: ["Name", "Certified, Favorite", "Owner", "Thumbnail", "Domain", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Updated", "Description", "Last viewed", "Views", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Updated", "Domain", "Description", "Last viewed", "Views"],
    },
    lakehouse: {
      grid: ["Name", "Certified, Favorite", "Trending/popular", "Owner", "Thumbnail", "Domain", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Trending/popular", "Description", "File Location", "Last viewed", "Views", "Tags", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Domain", "Tags", "Popularity", "File Location", "Description", "Last viewed", "Views"],
    },
  },
  {
    key: "Apps",
    label: "Apps",
    iconName: "AppsAssetIcon",
    assetType: AssetTypes.Apps,
    sampleNames: ["Inventory Optimizer", "Partner Portal", "Data Quality Monitor"],
    one: {
      grid: ["Name", "Certified, Favorite", "Owner", "Thumbnail", "Domain", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Updated", "Description", "Last viewed", "Views", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Updated", "Domain", "Description", "Last viewed", "Views"],
    },
    lakehouse: {
      grid: ["Name", "Certified, Favorite", "Owner", "Thumbnail", "Domain", "Trending/popular", "Last viewed", "Views"],
      table: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Trending/popular", "Description", "File Location", "Last viewed", "Views", "Tags", "Domain"],
      detail: ["Name", "Certified, Favorite", "Owner", "Workspace", "Updated", "Domain", "Tags", "Popularity", "File Location", "Description", "Last viewed", "Views"],
    },
  },
  {
    key: "Domains",
    label: "Domains / Subdomains",
    iconName: "DomainsIcon",
    sampleNames: ["Sales & Marketing", "Engineering", "Data Science"],
    one: {
      grid: ["Name", "Subtitle", "# of assets"],
      table: ["Name", "Description", "Status (Published/draft)"],
      detail: ["Name", "Subtitle", "# of assets", "Description"],
    },
    lakehouse: {
      grid: ["Name", "Subtitle", "# of assets"],
      table: ["Name", "Description", "Status (Published/draft)"],
      detail: ["Name", "Subtitle", "# of assets", "Description"],
    },
  },
];

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

export const SAMPLE_SUBTITLES = [
  "Curated datasets and dashboards for revenue, pipeline, and campaign performance across all regions.",
  "Shared tools, infrastructure metrics, and operational runbooks for platform engineering teams.",
  "Feature stores, experiment tracking, and model registries for the applied ML organization.",
];

export const SAMPLE_OWNERS = ["Jack Reidy", "Sarah Mitchell", "Alex Kim"];

export const SAMPLE_DOMAINS = ["Sales & Marketing", "Engineering", "Data Science"];

export const DOMAIN_COLOR_MAP: Record<string, TagColor> = {
  "Sales & Marketing": "Lime",
  "Engineering": "Teal",
  "Data Science": "Purple",
};

export function getDomainColor(domain: string): TagColor {
  return DOMAIN_COLOR_MAP[domain] ?? "Default";
}

export const DETAIL_DESCRIPTIONS: Record<string, string> = {
  Dashboards:
    "Tracks quarterly revenue performance across regions, with breakdowns by product line, customer segment, and sales channel.",
  GenieSpaces:
    "Ask natural-language questions about revenue trends, forecast accuracy, and pipeline health across all business units.",
  Apps:
    "Monitors real-time stock levels, flags reorder thresholds, and suggests optimal replenishment quantities based on demand forecasts.",
  Domains:
    "Curated collection of dashboards, models, and datasets supporting go-to-market strategy, campaign attribution, and pipeline analytics.",
};

export const TABLE_SAMPLE_VALUES: Record<string, string[]> = {
  Owner: SAMPLE_OWNERS,
  Workspace: ["rnd_eudev", "rnd_eudev", "rnd_eudev"],
  Updated: ["2h ago", "1d ago", "3d ago"],
  "Trending/popular": ["↑ Trending", "Popular", "↑ Trending"],
  Description: [
    "Revenue tracking dashboard",
    "Customer analytics workspace",
    "Supply chain metrics",
  ],
  "Status (Published/draft)": ["Published", "Draft", "Published"],
  "File location": ["/Shared/Reports", "/Shared/Reports", "/Shared/Reports"],
  "File Location": ["/Shared/Reports", "/Shared/Reports", "/Shared/Reports"],
  "Last viewed": ["1d ago", "2d ago", "3d ago"],
  Views: ["67", "142", "23"],
};

// ---------------------------------------------------------------------------
// Domain icon mapping (pure data — JSX rendering lives in consumers)
// ---------------------------------------------------------------------------

export const DOMAIN_ICON_MAP: Record<string, { name: string; colorClass: string }> = {
  "Sales & Marketing": { name: "MegaphoneIcon", colorClass: "text-tag-iconColor-lime" },
  "Engineering": { name: "WrenchIcon", colorClass: "text-tag-iconColor-teal" },
  "Data Science": { name: "beakerIcon", colorClass: "text-tag-iconColor-purple" },
};

// ---------------------------------------------------------------------------
// Field-toggle helpers (pure logic, no JSX)
// ---------------------------------------------------------------------------

export function applyFieldToggles(fields: FieldSpec, toggles: FieldToggles): FieldSpec {
  let result = fields.filter((f) => {
    if (f === "Domain" && !toggles.hasDomain) return false;
    if (f === "Certified, Favorite" && !toggles.isCertified && !toggles.isFavorite) return false;
    if (f === "Trending/popular" && !toggles.isTrending) return false;
    if (f === "Popularity" && !toggles.isPopular) return false;
    if (f === "Workspace" && !toggles.isAccountLevel) return false;
    if (f === "Last viewed" && !toggles.hasViewed) return false;
    return true;
  });
  if (toggles.isAccountLevel && !result.includes("Workspace")) {
    const ownerIdx = result.indexOf("Owner");
    if (ownerIdx !== -1) {
      result = [...result.slice(0, ownerIdx + 1), "Workspace", ...result.slice(ownerIdx + 1)];
    } else {
      result = [...result, "Workspace"];
    }
  }
  return result;
}

export function buildDecorators(toggles: FieldToggles): NameLabelDecorator[] {
  const decorators: NameLabelDecorator[] = [];
  if (toggles.isCertified) decorators.push({ kind: "certified" });
  if (toggles.isFavorite) decorators.push({ kind: "favorited" });
  if (toggles.isTrending) decorators.push({ kind: "trending" });
  if (toggles.isPopular) decorators.push({ kind: "popular" });
  return decorators;
}

export function getFieldsForViewMode(specs: ViewSpecs, vm: ViewMode): FieldSpec | null {
  if (vm === "table") return specs.table;
  if (vm === "grid") return specs.grid;
  return specs.detail;
}

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------

const NAME_ADJACENT_FIELDS = new Set(["Name", "Certified, Favorite"]);

export function getTableColumnHeaders(fields: FieldSpec): string[] {
  return fields.filter(
    (f) => !NAME_ADJACENT_FIELDS.has(f) && !f.endsWith(":"),
  );
}

export function getTableCellValue(field: string, rowIndex: number): string {
  const values = TABLE_SAMPLE_VALUES[field];
  return values ? values[rowIndex % values.length] : field;
}
