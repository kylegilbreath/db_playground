"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { AssetTypes, getAssetTypeIcon } from "@/components/AssetVisuals";
import { AiFollowUp, AiOverview } from "@/components/AiOverview";
import {
  DetailCard,
  SmallCard,
  SmallLogoCard,
  ThumbnailCard,
  type CardItem,
  type SmallCardItem,
  type ThumbnailCardItem,
} from "@/components/Card";
import { DropdownMenu } from "@/components/DropdownMenu";
import { FilterPanel } from "@/components/Filters";
import { Menu } from "@/components/Menu";
import { useResponsive } from "@/components/Responsive";
import { IndentedTextSnippet, IndentedTextSnippetHighlight } from "@/components/IndentedTextSnippet/IndentedTextSnippet";
import { Section } from "@/components/Section";
import { Table, TableCell, TableCellContent, TableRow } from "@/components/Table";
import type { AvatarSecondaryColor } from "@/components/Table/Table";
import { TertiaryButton } from "@/components/TertiaryButton";
import { WrappingText } from "@/components/WrappingText";
import { Icon, PhIcon, SemanticStateIcon } from "@/components/icons";
import { GridDashIcon } from "@/components/icons/GridDashIcon";
import {
  ChartLineUp,
  CirclesThree,
  CreditCard,
  Flask,
  GearSix,
  Headset,
  Megaphone,
  ShieldCheck,
  Tag,
} from "@phosphor-icons/react";

import type { NameLabelDecorator } from "@/components/NameLabel";

import type {
  SearchLayoutCardModel,
  SearchLayoutChipModel,
  SearchLayoutDecoratorKind,
  SearchLayoutIconToken,
  SearchLayoutModel,
  SearchLayoutSuggestedRowModel,
  SearchLayoutTableColumnModel,
  SearchLayoutTagModel,
  SearchLayoutViewMode,
} from "./model";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const PHOSPHOR_ICON_POOL = [
  { name: "ChartLineUp", icon: ChartLineUp, tagColor: "Indigo" },
  { name: "CreditCard", icon: CreditCard, tagColor: "Lemon" },
  { name: "Flask", icon: Flask, tagColor: "Purple" },
  { name: "Megaphone", icon: Megaphone, tagColor: "Coral" },
  { name: "ShieldCheck", icon: ShieldCheck, tagColor: "Teal" },
  { name: "GearSix", icon: GearSix, tagColor: "Charcoal" },
  { name: "Headset", icon: Headset, tagColor: "Turquoise" },
  { name: "CirclesThree", icon: CirclesThree, tagColor: "Lime" },
] as const;

function assertNever(x: never): never {
  throw new Error(`Unexpected token: ${String(x)}`);
}

function assetTypeFromToken(token: Extract<SearchLayoutIconToken, { kind: "assetType" }>) {
  // Keep this mapping local to the view layer; the model remains serializable.
  switch (token.value) {
    case "Tables":
      return AssetTypes.Tables;
    case "Dashboards":
      return AssetTypes.Dashboards;
    case "Notebooks":
      return AssetTypes.Notebooks;
    case "Models":
      return AssetTypes.Models;
    case "Jobs":
      return AssetTypes.Jobs;
    case "GenieSpaces":
      return AssetTypes.GenieSpaces;
    case "Queries":
      return AssetTypes.Queries;
    case "Alerts":
      return AssetTypes.Alerts;
    case "Folders":
      return AssetTypes.Folders;
    case "Files":
      return AssetTypes.Files;
    case "Marketplace":
      return AssetTypes.Marketplace;
    case "MetricViews":
      return AssetTypes.MetricViews;
    case "Pipelines":
      return AssetTypes.Pipelines;
    case "Endpoints":
      return AssetTypes.Endpoints;
    case "Functions":
      return AssetTypes.Functions;
    case "Volumes":
      return AssetTypes.Volumes;
    case "Apps":
      return AssetTypes.Apps;
    default:
      return assertNever(token.value);
  }
}

function iconFromToken(token: SearchLayoutIconToken | undefined) {
  if (!token) return undefined;
  if (token.kind === "assetType") {
    return getAssetTypeIcon(assetTypeFromToken(token), { size: 16 });
  }
  if (token.kind === "icon") {
    const node = <Icon name={token.name} size={16} className={token.className ? undefined : "text-text-secondary"} />;
    return token.className ? <span className={token.className}>{node}</span> : node;
  }
  if (token.kind === "phosphor") {
    const icon =
      token.name === "CirclesThree"
        ? CirclesThree
        : token.name === "CreditCard"
          ? CreditCard
          : token.name === "Megaphone"
            ? Megaphone
            : token.name === "ChartLineUp"
              ? ChartLineUp
              : token.name === "ShieldCheck"
                ? ShieldCheck
                : token.name === "GearSix"
                  ? GearSix
                  : token.name === "Headset"
                    ? Headset
                    : token.name === "Flask"
                      ? Flask
                      : token.name === "Tag"
                        ? Tag
                        : null;
    if (icon) {
      const defaultWeight = token.name === "CirclesThree" ? "regular" : "fill";
      const node = (
        <PhIcon
          icon={icon}
          size={16}
          weight={token.weight ?? defaultWeight}
          className={token.className ? undefined : "text-text-secondary"}
        />
      );
      return token.className ? <span className={token.className}>{node}</span> : node;
    }
  }
  return undefined;
}

function iconFromTokenAtSize(token: SearchLayoutIconToken | undefined, size: number) {
  if (!token) return undefined;
  if (token.kind === "assetType") {
    return getAssetTypeIcon(assetTypeFromToken(token), { size });
  }
  if (token.kind === "icon") {
    const node = <Icon name={token.name} size={size} className={token.className ? undefined : "text-text-secondary"} />;
    return token.className ? <span className={token.className}>{node}</span> : node;
  }
  if (token.kind === "phosphor") {
    const icon =
      token.name === "CirclesThree"
        ? CirclesThree
        : token.name === "CreditCard"
          ? CreditCard
          : token.name === "Megaphone"
            ? Megaphone
            : token.name === "ChartLineUp"
              ? ChartLineUp
              : token.name === "ShieldCheck"
                ? ShieldCheck
                : token.name === "GearSix"
                  ? GearSix
                  : token.name === "Headset"
                    ? Headset
                    : token.name === "Flask"
                      ? Flask
                      : token.name === "Tag"
                        ? Tag
                        : null;
    if (icon) {
      const defaultWeight = token.name === "CirclesThree" ? "regular" : "fill";
      const node = (
        <PhIcon
          icon={icon}
          size={size}
          weight={token.weight ?? defaultWeight}
          className={token.className ? undefined : "text-text-secondary"}
        />
      );
      return token.className ? <span className={token.className}>{node}</span> : node;
    }
  }
  return undefined;
}

function GradientMaskIcon({ name, size }: { name: string; size: number }) {
  const url = `/icons/${name}.svg`;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        // Use the icon SVG as a mask, but fill the masked area with the AI gradient.
        backgroundImage:
          "var(--ai-gradient, linear-gradient(45deg, #4299e0 24%, #ca42e0 47%, #ff5f46 76%))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        WebkitMaskImage: `url(\"${url}\")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url(\"${url}\")`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        maskMode: "alpha",
      }}
    />
  );
}

function toMenuChipItem(chip: SearchLayoutChipModel) {
  const applied = Boolean(chip.applied);

  switch (chip.type) {
    case "favorite":
      return {
        id: chip.id,
        label: "Favorite",
        applied,
        leadingIcon: <SemanticStateIcon kind="favorite" selected={applied} size={16} />,
      };
    case "certified":
      return {
        id: chip.id,
        label: "Certified",
        applied,
        leadingIcon: <SemanticStateIcon kind="certified" selected={applied} size={16} />,
      };
    case "owned":
      return {
        id: chip.id,
        label: "Owned by me",
        applied,
      };
    case "modifiedDropdown":
      return {
        id: chip.id,
        label: "Modified this week",
        kind: "dropdown" as const,
        applied,
      };
    case "domainDropdown":
      return {
        id: chip.id,
        label: "Domain",
        kind: "dropdown" as const,
        applied,
      };
    case "typeDropdown":
      return {
        id: chip.id,
        label: "Type",
        kind: "dropdown" as const,
        applied,
      };
    case "assetType": {
      const token: SearchLayoutIconToken = { kind: "assetType", value: chip.assetType };
      return {
        id: chip.id,
        label: chip.assetType,
        applied,
        leadingIcon: iconFromToken(token),
      };
    }
    case "custom":
      return {
        id: chip.id,
        label: chip.label,
        kind: chip.kind,
        applied,
        leadingIcon: chip.icon ? iconFromToken(chip.icon) : undefined,
      };
    default:
      return assertNever(chip);
  }
}

function decoratorsFromModel(kinds?: SearchLayoutDecoratorKind[]): NameLabelDecorator[] | undefined {
  if (!kinds || kinds.length === 0) return undefined;
  return kinds.map((kind) => ({ kind }));
}

function tagsFromModel(tags?: SearchLayoutTagModel[]) {
  if (!tags || tags.length === 0) return undefined;
  return tags.map((t) => ({
    label: t.label,
    color: t.color,
    leftElement: t.iconName
      ? ({ type: "Icon" as const, icon: <Icon name={t.iconName} size={12} className={t.iconColorClass} /> })
      : undefined,
  }));
}

function toSmallCardItem(model: SearchLayoutCardModel): SmallCardItem {
  if (model.kind !== "small") throw new Error("Expected small card model.");
  return {
    id: model.id,
    title: {
      leadingIcon: iconFromToken(model.title.icon) ?? getAssetTypeIcon(AssetTypes.Dashboards, { size: 16 }),
      label: model.title.label,
      decorators: decoratorsFromModel(model.title.decorators),
    },
    subtitle: model.subtitle,
    tags: tagsFromModel(model.tags),
    metadataRow: model.metadata
      ? [{ label: model.metadata, separator: false }]
      : undefined,
  };
}

function toThumbnailCardItem(model: SearchLayoutCardModel): ThumbnailCardItem {
  if (model.kind !== "thumbnail") throw new Error("Expected thumbnail card model.");
  return {
    id: model.id,
    title: {
      leadingIcon: iconFromToken(model.title.icon) ?? getAssetTypeIcon(AssetTypes.Dashboards, { size: 16 }),
      label: model.title.label,
      decorators: decoratorsFromModel(model.title.decorators),
    },
    subtitle: model.subtitle,
    tags: tagsFromModel(model.tags),
    metadataRow: model.metadata ? [{ label: model.metadata, separator: false }] : undefined,
    description: model.description,
    thumbnail: thumbnailFromModel(model.thumbnail, model.title.icon),
  };
}

function thumbnailFromModel(
  thumb: import("./model").SearchLayoutThumbnailCardModel["thumbnail"],
  titleIcon: SearchLayoutCardModel["title"]["icon"],
): ThumbnailCardItem["thumbnail"] {
  if (thumb.kind === "dashboard") {
    return { variant: "image", dashboardIndex: thumb.index, alt: thumb.alt };
  }
  if (thumb.kind === "image") {
    return { variant: "image", src: thumb.src, alt: thumb.alt };
  }
  if (thumb.kind === "code") {
    return { variant: "code", language: thumb.language, code: thumb.code };
  }
  const phEntry = thumb.phosphorIcon ? PHOSPHOR_ICON_POOL.find((p) => p.name === thumb.phosphorIcon) : undefined;
  return {
    variant: "placeholder",
    icon: phEntry
      ? <PhIcon icon={phEntry.icon} size={32} />
      : thumb.iconName
        ? <Icon name={thumb.iconName} size={32} />
        : iconFromTokenAtSize(titleIcon, 32) ?? <Icon name="dashboardIcon" size={32} />,
    ...(thumb.tagColor ? { tagColor: thumb.tagColor as import("@/components/Tag").TagColor } : {}),
  };
}

function toDetailCardItem(model: SearchLayoutCardModel): CardItem {
  if (model.kind !== "detail") throw new Error("Expected detail card model.");

  const renderIndentedSnippet = (text: string) => {
    const parts = text.split(/(<<[^>]+>>)/g).filter(Boolean);
    return (
      <IndentedTextSnippet>
        {parts.map((p, idx) => {
          const isHighlighted = p.startsWith("<<") && p.endsWith(">>");
          const content = isHighlighted ? p.slice(2, -2) : p;
          return isHighlighted ? (
            <IndentedTextSnippetHighlight key={idx}>{content}</IndentedTextSnippetHighlight>
          ) : (
            <React.Fragment key={idx}>{content}</React.Fragment>
          );
        })}
      </IndentedTextSnippet>
    );
  };

  const thumbnail =
    model.thumbnail?.kind === "dashboard"
      ? { variant: "image" as const, dashboardIndex: model.thumbnail.index, alt: model.thumbnail.alt }
      : model.thumbnail?.kind === "code"
        ? { variant: "code" as const, language: model.thumbnail.language, code: model.thumbnail.code }
        : model.thumbnail?.kind === "placeholder"
          ? (() => {
              const ph = model.thumbnail!;
              const phEntry = ph.phosphorIcon ? PHOSPHOR_ICON_POOL.find((p) => p.name === ph.phosphorIcon) : undefined;
              return {
                variant: "placeholder" as const,
                ...(phEntry
                  ? { icon: <PhIcon icon={phEntry.icon} size={32} /> }
                  : ph.iconName
                    ? { icon: <Icon name={ph.iconName} size={32} /> }
                    : {}),
                ...(ph.tagColor ? { tagColor: ph.tagColor as import("@/components/Tag").TagColor } : {}),
              };
            })()
          : undefined;

  return {
    id: model.id,
    title: {
      leadingIcon: iconFromToken(model.title.icon) ?? getAssetTypeIcon(AssetTypes.Tables, { size: 16 }),
      label: model.title.label,
      decorators: decoratorsFromModel(model.title.decorators),
    },
    thumbnail,
    metadataRow: model.metadataParts?.map((p, idx) => ({
      label: p,
      separator: idx !== (model.metadataParts?.length ?? 0) - 1,
    })),
    description: model.description ? (
      <WrappingText lines={2} maxWidth={null}>
        {model.description}
      </WrappingText>
    ) : undefined,
    tags: tagsFromModel(model.tags),
    indentedSnippet: model.indentedSnippet?.text ? renderIndentedSnippet(model.indentedSnippet.text) : undefined,
    codeSnippet: model.codeSnippet,
  };
}

function metadataRowFromParts(parts: string[] | undefined) {
  if (!parts || parts.length === 0) return undefined;
  return parts.map((p, idx) => ({
    label: p,
    separator: idx !== parts.length - 1,
  }));
}

const AVATAR_COLORS: AvatarSecondaryColor[] = [
  "lime",
  "teal",
  "turquoise",
  "indigo",
  "purple",
  "pink",
  "coral",
  "lemon",
];

function hashString(input: string) {
  // Small deterministic hash so avatar colors don't flicker across renders.
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return h;
}

function avatarColorForRowId(rowId: string): AvatarSecondaryColor {
  const idx = Math.abs(hashString(rowId)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx]!;
}

function SuggestedTable({ rows, transparent }: { rows: SearchLayoutSuggestedRowModel[]; transparent?: boolean }) {
  return (
    <div className={`w-full overflow-hidden rounded-md ${transparent ? "" : "bg-background-primary"}`}>
      <Table>
        <TableRow state="Header">
          <TableCell>
            <TableCellContent type="Header">Name</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={20}>
            <TableCellContent type="Header">Reason suggested</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={30}>
            <TableCellContent type="Header">Owner</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={0}>
            <TableCellContent type="Actions" />
          </TableCell>
        </TableRow>

        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div className="flex w-full min-w-0 items-center gap-sm">
                <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
                  {iconFromToken(r.icon) ?? (
                    <Icon name="dashboardIcon" size={16} className="text-text-secondary" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">
                  {r.name}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <TableCellContent type="Text">{r.reason}</TableCellContent>
            </TableCell>
            <TableCell>
              <TableCellContent type="User" avatarColor={avatarColorForRowId(r.id)}>
                {r.owner}
              </TableCellContent>
            </TableCell>
            <TableCell>
              <TableCellContent type="Actions" />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}

const DEFAULT_TABLE_COLUMNS: SearchLayoutTableColumnModel[] = [
  { key: "location", label: "Location", collapsePriority: 10 },
  { key: "updated", label: "Updated", collapsePriority: 20 },
  { key: "viewed", label: "Viewed", collapsePriority: 30 },
];

function ResultsTable({
  items,
  transparent,
  tableColumns,
}: {
  items: SearchLayoutCardModel[];
  transparent?: boolean;
  tableColumns?: SearchLayoutTableColumnModel[];
}) {
  const rows = items.filter((i) => i.kind === "detail");
  const columns = tableColumns ?? DEFAULT_TABLE_COLUMNS;
  const useTableFields = !!tableColumns;

  return (
    <div className={`w-full overflow-hidden rounded-md ${transparent ? "" : "bg-background-primary"}`}>
      <Table>
        <TableRow state="Header">
          <TableCell>
            <TableCellContent type="Header">Name</TableCellContent>
          </TableCell>
          {columns.map((col) => (
            <TableCell key={col.key} data-collapse-priority={col.collapsePriority}>
              <TableCellContent type="Header">{col.label}</TableCellContent>
            </TableCell>
          ))}
          <TableCell data-collapse-priority={0}>
            <TableCellContent type="Actions" />
          </TableCell>
        </TableRow>

        {rows.map((r) => {
          const titleDecorators = decoratorsFromModel(r.title.decorators);
          return (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex w-full min-w-0 items-center gap-sm">
                  <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
                    {iconFromToken(r.title.icon) ?? getAssetTypeIcon(AssetTypes.Tables, { size: 16 })}
                  </span>
                  <span className="min-w-0 truncate text-paragraph font-medium leading-5 text-text-primary">
                    {r.title.label}
                  </span>
                  {titleDecorators && titleDecorators.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-xs">
                      {titleDecorators.map((d, i) =>
                        d.kind === "certified" ? (
                          <SemanticStateIcon key={i} kind="certified" selected size={15} />
                        ) : d.kind === "favorited" ? (
                          <SemanticStateIcon key={i} kind="favorite" selected size={15} />
                        ) : d.kind === "trending" ? (
                          <Icon key={i} name="trendingIcon" size={15} className="text-signal-icon-trending" />
                        ) : null,
                      )}
                    </span>
                  )}
                </div>
              </TableCell>
              {columns.map((col, colIdx) => (
                <TableCell key={col.key}>
                  <TableCellContent type="Text">
                    {useTableFields
                      ? (r.tableFields?.[col.key] ?? "—")
                      : (r.metadataParts?.[colIdx] ?? "—")}
                  </TableCellContent>
                </TableCell>
              ))}
              <TableCell>
                <TableCellContent type="Actions" />
              </TableCell>
            </TableRow>
          );
        })}
      </Table>
    </div>
  );
}

function ResultsGrid({
  items,
  assetType,
}: {
  items: SearchLayoutCardModel[];
  assetType: SearchLayoutModel["resultsShell"]["assetType"];
}) {
  const rows = items.filter((i) => i.kind === "detail");

  const notebookSnippets = React.useMemo(
    () => [
      {
        language: "python",
        code: ["import pandas as pd", "", "df = spark.table('catalog.schema.table')", "df.head()"].join("\n"),
      },
      {
        language: "sql",
        code: ["SELECT", "  date_trunc('day', ts) AS day,", "  count(*) AS events", "FROM events", "GROUP BY 1"].join("\n"),
      },
      {
        language: "typescript",
        code: ["type Row = { id: string; value: number };", "export const rows: Row[] = [];"].join("\n"),
      },
      {
        language: "python",
        code: ["from sklearn.model_selection import train_test_split", "", "X_train, X_test = train_test_split(X)"].join("\n"),
      },
    ],
    [],
  );

  return (
    <div className="grid w-full grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((r, idx) => {
        const leadingIcon = iconFromToken(r.title.icon) ?? getAssetTypeIcon(AssetTypes.Tables, { size: 16 });
        const metadataRow = metadataRowFromParts(r.metadataParts);

        const titleDecorators = decoratorsFromModel(r.title.decorators);

        if (assetType === "Dashboards") {
          const hasThumbnail = idx % 3 !== 2;
          const thumbnail: ThumbnailCardItem["thumbnail"] = hasThumbnail
            ? { variant: "image", dashboardIndex: 1 + (idx % 25), alt: "Dashboard preview" }
            : { variant: "placeholder", icon: <Icon name="dashboardIcon" size={32} /> };
          const item: ThumbnailCardItem = {
            id: r.id,
            title: { leadingIcon, label: r.title.label, decorators: titleDecorators },
            subtitle: undefined,
            metadataRow,
            thumbnail,
          };
          return <ThumbnailCard key={r.id} item={item} />;
        }

        if (assetType === "Notebooks") {
          const snippet = notebookSnippets[idx % notebookSnippets.length]!;
          const item: ThumbnailCardItem = {
            id: r.id,
            title: { leadingIcon, label: r.title.label, decorators: titleDecorators },
            subtitle: undefined,
            metadataRow,
            thumbnail: { variant: "code", language: snippet.language, code: snippet.code },
          };
          return <ThumbnailCard key={r.id} item={item} />;
        }

        if (assetType === "GenieSpaces") {
          const nn = String(1 + (idx % 4)).padStart(2, "0");
          const hasThumbnail = idx % 5 === 0;
          const hasCustomIcon = idx % 3 === 0;
          const pool = PHOSPHOR_ICON_POOL[idx % PHOSPHOR_ICON_POOL.length];
          const thumbnail: ThumbnailCardItem["thumbnail"] = hasThumbnail
            ? { variant: "image", src: { light: `/images/genie-space-thumbnail-${nn}.png`, dark: `/images/genie-space-thumbnail-${nn}.png` }, alt: "Genie Space preview" }
            : hasCustomIcon
              ? { variant: "placeholder", icon: <PhIcon icon={pool.icon} size={32} />, tagColor: pool.tagColor as import("@/components/Tag").TagColor }
              : { variant: "placeholder", icon: <Icon name="SparkleRectangleIcon" size={32} /> };
          const item: ThumbnailCardItem = {
            id: r.id,
            title: { leadingIcon, label: r.title.label, decorators: titleDecorators },
            subtitle: undefined,
            metadataRow,
            thumbnail,
          };
          return <ThumbnailCard key={r.id} item={item} />;
        }

        if (assetType === "Apps") {
          const hasThumbnail = idx % 3 !== 2;
          const nn = String(1 + (idx % 10)).padStart(2, "0");
          const thumbnail: ThumbnailCardItem["thumbnail"] = hasThumbnail
            ? { variant: "image", src: { light: `/images/app-thumbnail-${nn}.png`, dark: `/images/app-thumbnail-${nn}.png` }, alt: "App preview" }
            : { variant: "placeholder", icon: <Icon name="AppsAssetIcon" size={32} /> };
          const item: ThumbnailCardItem = {
            id: r.id,
            title: { leadingIcon, label: r.title.label, decorators: titleDecorators },
            subtitle: undefined,
            metadataRow,
            thumbnail,
          };
          return <ThumbnailCard key={r.id} item={item} />;
        }

        const item: SmallCardItem = {
          id: r.id,
          title: { leadingIcon, label: r.title.label, decorators: titleDecorators },
          subtitle: undefined,
          metadataRow,
        };
        return <SmallCard key={r.id} item={item} />;
      })}
    </div>
  );
}

function gridColumnsClass(columns: { sm?: number; lg?: number }) {
  // Keep the class logic in the view layer; model stays data-only.
  const sm = columns.sm === 2 ? "sm:grid-cols-2" : columns.sm === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  const lg =
    columns.lg === 3 ? "lg:grid-cols-3" : columns.lg === 4 ? "lg:grid-cols-4" : columns.lg === 6 ? "lg:grid-cols-6" : "";
  return ["grid w-full grid-cols-1 gap-md", sm, lg].filter(Boolean).join(" ");
}

export function SearchLayout({
  model,
  pageTitle,
  menuTabs,
  tabValue,
  onTabValueChange,
  onViewModeChange,
  menuAnythingBoxProps,
}: {
  model: SearchLayoutModel;
  pageTitle?: React.ReactNode;
  menuTabs?: Array<{ value: string; label: string; disabled?: boolean }>;
  tabValue?: string;
  onTabValueChange?: (next: string) => void;
  onViewModeChange?: (next: SearchLayoutViewMode) => void;
  menuAnythingBoxProps?: React.ComponentProps<typeof Menu>["anythingBoxProps"];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isOneRoute = pathname.startsWith("/one") || pathname.startsWith("/databricks-one-chat-nav");
  const { isSmallScreen } = useResponsive();
  const tabs = menuTabs ?? model.menuTabs;
  const [viewMode, setViewMode] = React.useState<SearchLayoutViewMode>(model.resultsShell.viewMode);
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [inlineSearchText, setInlineSearchText] = React.useState("");
  const menuAnythingBoxWrapperRef = React.useRef<HTMLDivElement | null>(null);
  const isDiscoverTemplate = React.useMemo(() => {
    const ids = new Set(model.sections.map((s) => s.id));
    return ids.has("domains") && ids.has("certified") && ids.has("foundational_models");
  }, [model.sections]);
  React.useEffect(() => {
    setViewMode(model.resultsShell.viewMode);
  }, [model.resultsShell.viewMode, model.resultsShell.assetType]);

  const setViewModeAndNotify = React.useCallback(
    (next: SearchLayoutViewMode) => {
      setViewMode(next);
      onViewModeChange?.(next);
    },
    [onViewModeChange],
  );

  // Inline search behavior is only for canonical list pages (they have a visible title).
  const enableInlineSearch = Boolean(pageTitle);
  const inlineQuery = inlineSearchText.trim();
  const inlineSearchActive = enableInlineSearch && inlineQuery.length > 0;

  const sectionsToRender = React.useMemo(() => {
    if (!inlineSearchActive) return model.sections;
    return model.sections.filter((s) => s.id === "results");
  }, [inlineSearchActive, model.sections]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[1250px] flex-col gap-[40px] px-6 pb-8 pt-10">
      <div
        className={`${isOneRoute ? "" : "sticky top-0 z-30 bg-background-primary"} ${
          pageTitle ? "" : "pt-4"
        }`}
      >
        <Menu
          title={pageTitle}
          tabs={
            tabs?.map((t) => ({
              value: t.value,
              label: t.label,
              disabled: t.disabled,
            })) ?? undefined
          }
          defaultTabValue={tabs?.[0]?.value}
          tabValue={tabValue}
          onTabValueChange={onTabValueChange}
          chipsRowProps={{
            appliedCount: model.filters.appliedCount,
            hasFiltersApplied: model.filters.hasFiltersApplied,
            chips: model.filters.chips.map(toMenuChipItem),
            filterToggleProps: {
              isSelected: filterPanelOpen,
              onSelectedChange: setFilterPanelOpen,
            },
          }}
          anythingBoxWrapperRef={menuAnythingBoxWrapperRef}
          anythingBoxProps={{
            placeholder: model.filters.placeholder,
            value: inlineSearchText,
            onValueChange: setInlineSearchText,
            onClearSearch: () => setInlineSearchText(""),
            ...menuAnythingBoxProps,
            ...(isDiscoverTemplate
              ? {
                  // Discover: hide the pinned-list action in the menu search bar.
                  searchActions: [
                    { id: "feedback", ariaLabel: "Provide feedback", iconName: "InfoIcon" },
                  ],
                }
              : null),
          }}
        />
      </div>

      <div className="flex w-full gap-lg">
        {filterPanelOpen ? (
          <aside className="shrink-0">
            <FilterPanel variant="inline" />
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-lg">
          {model.aiOverview && !inlineSearchActive ? (
            <Section
              title={
                <span className="inline-flex items-center gap-xs">
                  <GradientMaskIcon name="SparkleIcon" size={16} />
                  <span>AI overview</span>
                </span>
              }
            >
              {/*
               * Demo behavior: selecting a follow-up suggestion should transition into Chat.
               * The animation/navigation is handled at this page layer (not inside the `AiFollowUp` primitive).
               */}
              <AiOverview
                defaultExpanded={model.aiOverview.defaultExpanded ?? false}
                showCollapseButton={model.aiOverview.showCollapseButton}
                refs={model.aiOverview.refs}
                followUp={
                  model.aiOverview.followUpMode === "input" ? (
                    (() => {
                      const suggestions =
                        model.aiOverview.followUpSuggestions ?? [
                          { id: "s1", label: "What are the key metrics I should check first?" },
                          { id: "s2", label: "Show the most recent changes." },
                        ];
                      return (
                        <AiFollowUp
                          mode="input"
                          placeholder={model.aiOverview.followUpPlaceholder ?? "Ask a follow-up question"}
                          suggestions={suggestions}
                          onSelectSuggestion={(id) => {
                            const label = suggestions.find((s) => s.id === id)?.label ?? "";
                            if (!label) return;
                            router.push(`/chat?from=search&prompt=${encodeURIComponent(label)}`);
                          }}
                        />
                      );
                    })()
                  ) : model.aiOverview.followUpMode === "button" ? (
                    <AiFollowUp
                      mode="button"
                      onButtonClick={() => {
                        router.push("/chat?from=search");
                      }}
                    />
                  ) : undefined
                }
              >
                <div className="text-paragraph leading-5 text-text-primary whitespace-pre-wrap">
                  {model.aiOverview.text}
                </div>
              </AiOverview>
            </Section>
          ) : null}

          <div className="flex w-full flex-col gap-[40px]">
            {sectionsToRender.map((s) => {
          const content = s.content;
          const isResults = s.id === "results";
          const currentViewMode = isResults ? viewMode : model.resultsShell.viewMode;
          const currentViewModeLabel =
            currentViewMode === "list" ? "List" : currentViewMode === "grid" ? "Grid" : "Detail";
              const title =
                inlineSearchActive && isResults
                  ? `Search results for “${inlineQuery}”`
                  : s.title;
              const titleWithIcon =
                s.titleIcon && !(inlineSearchActive && isResults) ? (
                  <span className="inline-flex items-center gap-xs">
                    {iconFromToken(s.titleIcon)}
                    <span>{title}</span>
                  </span>
                ) : (
                  title
                );
          const headerRight =
            s.headerActions?.sort || s.headerActions?.viewMode ? (
              <div className="flex items-center gap-mid">
                {s.headerActions?.sort ? (
                  <TertiaryButton size="small" tone="neutral" menu>
                    {s.headerActions.sort.label}
                  </TertiaryButton>
                ) : null}
                {s.headerActions?.viewMode ? (
                  isResults ? (
                    <DropdownMenu
                      width={124}
                      align="end"
                      items={[
                        {
                          id: "view_list",
                          label: "List",
                          leadingIcon: <Icon name="listIcon" size={16} className="text-text-secondary" />,
                          onSelect: () => setViewModeAndNotify("list"),
                        },
                        {
                          id: "view_grid",
                          label: "Grid",
                          leadingIcon: <Icon name="gridIcon" size={16} className="text-text-secondary" />,
                          onSelect: () => setViewModeAndNotify("grid"),
                        },
                        {
                          id: "view_detail",
                          label: "Detail",
                          leadingIcon: <Icon name="detailCardIcon" size={16} className="text-text-secondary" />,
                          onSelect: () => setViewModeAndNotify("detail"),
                        },
                      ]}
                      trigger={({ triggerProps, triggerRef }) => (
                        <span ref={triggerRef} className="inline-flex">
                          <TertiaryButton
                            {...triggerProps}
                            size="small"
                            tone="neutral"
                            menu
                            leadingIcon={
                              currentViewMode === "list" ? (
                                <Icon name="listIcon" size={16} className="text-text-primary" />
                              ) : currentViewMode === "grid" ? (
                                <Icon name="gridIcon" size={16} className="text-text-primary" />
                              ) : (
                                <Icon name="detailCardIcon" size={16} className="text-text-primary" />
                              )
                            }
                          >
                            {currentViewModeLabel}
                          </TertiaryButton>
                        </span>
                      )}
                    />
                  ) : (
                    <TertiaryButton
                      size="small"
                      tone="neutral"
                      menu
                      leadingIcon={<GridDashIcon className="text-text-primary" />}
                    >
                      {s.headerActions?.viewMode?.label}
                    </TertiaryButton>
                  )
                ) : null}
              </div>
            ) : undefined;

          const shouldRenderResultsView = isResults && content.kind === "cardsList";

          return (
            <Section
              key={s.id}
              id={s.id}
              title={titleWithIcon}
              titleHref={s.titleHref}
              description={s.description}
              headerRight={headerRight}
              smallScreenOverflowX={
                content.kind === "cardsGrid" || content.kind === "logoCardsGrid" ? "cards" : "none"
              }
            >
              {shouldRenderResultsView ? (
                currentViewMode === "list" ? (
                  <ResultsTable items={content.items} transparent={isOneRoute} tableColumns={model.resultsShell.tableColumns} />
                ) : currentViewMode === "grid" ? (
                  <ResultsGrid items={content.items} assetType={model.resultsShell.assetType} />
                ) : (
                  <div className="flex w-full flex-col gap-md">
                    {content.items.map((item) => (
                      <DetailCard key={item.id} item={toDetailCardItem(item)} />
                    ))}
                  </div>
                )
              ) : content.kind === "suggestedTable" ? (
                <SuggestedTable rows={content.rows} transparent={isOneRoute} />
              ) : content.kind === "cardsWrap" ? (
                <div className="flex w-full flex-wrap gap-md">
                  {content.items.map((item) => {
                    if (content.cardKind === "small") {
                      return (
                        <SmallCard
                          key={item.id}
                          className="w-fit max-w-full"
                          item={toSmallCardItem(item)}
                          background={content.cardBackground ?? "primary"}
                        />
                      );
                    }
                    if (content.cardKind === "thumbnail") {
                      return (
                        <div key={item.id} className="w-[240px] max-w-full">
                          <ThumbnailCard item={toThumbnailCardItem(item)} />
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className="w-[240px] max-w-full">
                        <DetailCard item={toDetailCardItem(item)} />
                      </div>
                    );
                  })}
                </div>
              ) : content.kind === "logoCardsGrid" ? (
                isSmallScreen ? (
                  <div className="flex w-fit items-stretch gap-md pr-6">
                    {content.items.map((item) => (
                      <div key={item.id} className="shrink-0 w-[min(280px,80vw)]">
                        <SmallLogoCard
                          className="h-full"
                          item={{
                            id: item.id,
                            mark: { kind: "logo", src: item.logo.src, alt: item.logo.alt },
                            title: { label: item.title },
                            subtitle: item.subtitle,
                            metadataRow: item.metadata
                              ? [{ label: item.metadata, separator: false }]
                              : undefined,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={gridColumnsClass(content.columns)}>
                    {content.items.map((item) => (
                      <SmallLogoCard
                        key={item.id}
                        item={{
                          id: item.id,
                          mark: { kind: "logo", src: item.logo.src, alt: item.logo.alt },
                          title: { label: item.title },
                          subtitle: item.subtitle,
                          metadataRow: item.metadata ? [{ label: item.metadata, separator: false }] : undefined,
                        }}
                      />
                    ))}
                  </div>
                )
              ) : content.kind === "cardsGrid" ? (
                isSmallScreen ? (
                  <div className="flex w-fit items-stretch gap-md pr-6">
                    {content.items.map((item) => {
                      if (content.cardKind === "small") {
                        return (
                          <div key={item.id} className="shrink-0 w-[min(280px,80vw)]">
                            <SmallCard
                              className="h-full w-full"
                              item={toSmallCardItem(item)}
                              background={content.cardBackground ?? "primary"}
                            />
                          </div>
                        );
                      }
                      if (content.cardKind === "thumbnail") {
                        return (
                          <div key={item.id} className="shrink-0 w-[min(280px,80vw)]">
                            <ThumbnailCard className="h-full" item={toThumbnailCardItem(item)} />
                          </div>
                        );
                      }
                      return (
                        <div key={item.id} className="shrink-0 w-[min(280px,80vw)]">
                          <DetailCard className="h-full" item={toDetailCardItem(item)} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={gridColumnsClass(content.columns)}>
                    {content.items.map((item) => {
                      if (content.cardKind === "small") {
                        return (
                          <SmallCard
                            key={item.id}
                            item={toSmallCardItem(item)}
                            background={content.cardBackground ?? "primary"}
                          />
                        );
                      }
                      if (content.cardKind === "thumbnail") {
                        return <ThumbnailCard key={item.id} item={toThumbnailCardItem(item)} />;
                      }
                      return <DetailCard key={item.id} item={toDetailCardItem(item)} />;
                    })}
                  </div>
                )
              ) : (
                <div className="flex w-full flex-col gap-md">
                  {content.items.map((item) => (
                    <DetailCard key={item.id} item={toDetailCardItem(item)} />
                  ))}
                </div>
              )}
            </Section>
          );
        })}
          </div>
        </div>
      </div>

      <div className="h-20 w-full" aria-hidden="true" />

    </main>
  );
}
