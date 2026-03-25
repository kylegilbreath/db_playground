"use client";

import * as React from "react";
import { Pizza, Truck } from "@phosphor-icons/react";

import { AssetTypes, getAssetTypeIcon } from "@/components/AssetVisuals";
import { Icon, PhIcon } from "@/components/icons";
import { IndentedTextSnippetHighlight } from "@/components/IndentedTextSnippet";
import { TabsCollection, TabsContent, TabsItem, TabsList } from "@/components/Tabs";
import { WrappingText } from "@/components/WrappingText";

import { DetailCard } from "./DetailCard";
import { DetailLogoCard } from "./DetailLogoCard";
import { LargeLogoCard } from "./LargeLogoCard";
import { SmallCard } from "./SmallCard";
import { SmallLogoCard } from "./SmallLogoCard";
import { ThumbnailCard } from "./ThumbnailCard";
import type {
  CardItem,
  DetailLogoCardItem,
  LargeLogoCardItem,
  SmallCardItem,
  SmallLogoCardItem,
  ThumbnailCardItem,
} from "./types";

type DetailMode =
  | "detail_basic"
  | "detail_thumbnail"
  | "detail_code"
  | "detail_code_thumbnail"
  | "detail_indented";

const BASE_ITEM: CardItem = {
  id: "base",
  title: {
    leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }),
    label: "asset.name",
  },
  metadataRow: [
    { label: "catalog.schema", separator: true },
    { label: "Modified 7d ago", separator: true },
    { label: "Viewed 15d ago", separator: true },
    { label: "Jocelyn Hickcox", separator: false },
  ],
  description: (
    <WrappingText lines={2} maxWidth={null}>
      Brief description of the item, which should be no longer than a sentence but will often wrap to a new line. In
      the detail layout, we have the screen space to display more text.
    </WrappingText>
  ),
};

const LOGISTICS_TAG: NonNullable<CardItem["tags"]>[number] = {
  label: "Logistics",
  color: "Teal",
  // Use a Phosphor icon that matches “logistics”.
  leftElement: { type: "Icon", icon: <PhIcon icon={Truck} size={16} weight="fill" /> },
};

function withTitleDecorators(item: CardItem, decorators: CardItem["title"]["decorators"]) {
  return {
    ...item,
    title: {
      ...item.title,
      decorators,
    },
  };
}

function buildItem(mode: DetailMode): CardItem {
  switch (mode) {
    case "detail_basic":
      return withTitleDecorators(
        {
        ...BASE_ITEM,
        id: mode,
        },
        // No decorators in this example (requested).
        undefined,
      );
    case "detail_thumbnail":
      return withTitleDecorators(
        {
        ...BASE_ITEM,
        id: mode,
        thumbnail: { variant: "image", dashboardIndex: 7, alt: "Dashboard preview" },
        tags: [LOGISTICS_TAG],
        },
        [{ kind: "certified" }],
      );
    case "detail_code":
      return withTitleDecorators(
        {
        ...BASE_ITEM,
        id: mode,
        codeSnippet: {
          language: "typescript",
          // Search highlights a single matched string/token.
          highlightedTokens: ["revenue"],
          code: [
            "type Order = {",
            "  id: string;",
            "  quantity: number;",
            "  unitPrice: number;",
            "  metadata?: Record<string, unknown>;",
            "};",
            "",
            "export async function summarize(orders: Order[]) {",
            "  const revenue = orders.reduce((sum, o) => sum + o.quantity * o.unitPrice, 0);",
            "  const top = orders.at(0)?.metadata?.[\"source\"] ?? \"unknown\";",
            "  return { revenue, top, ok: revenue > 0, sample: `rev=${revenue.toFixed(2)}` };",
            "}",
          ].join("\n"),
        },
        tags: [LOGISTICS_TAG],
        },
        [{ kind: "trending" }, { kind: "favorited" }],
      );
    case "detail_code_thumbnail":
      return withTitleDecorators(
        {
        ...BASE_ITEM,
        id: mode,
        thumbnail: { variant: "image", dashboardIndex: 7, alt: "Dashboard preview" },
        codeSnippet: {
          language: "typescript",
          // Search highlights a single matched string/token.
          highlightedTokens: ["revenue"],
          code: [
            "export const revenue = 1234.56;",
            "export const ok = revenue > 0;",
            "export const label = `rev=${revenue.toFixed(2)}`;",
          ].join("\n"),
        },
        },
        [{ kind: "pinned" }, { kind: "shared" }],
      );
    case "detail_indented":
      return withTitleDecorators(
        {
        ...BASE_ITEM,
        id: mode,
        indentedSnippet: (
          <>
            Country{"\n"}
            <IndentedTextSnippetHighlight>Country_Id</IndentedTextSnippetHighlight>
          </>
        ),
        },
        [
          { kind: "shared", tooltip: "Shared with your team" },
          { kind: "custom", icon: <Icon name="warningFilledIcon" size={16} />, tooltip: "Needs review" },
        ],
      );
  }
}

const DETAIL_MODES: Array<{ id: DetailMode; label: string }> = [
  { id: "detail_basic", label: "Detail: basic" },
  { id: "detail_thumbnail", label: "Detail: thumbnail" },
  { id: "detail_code", label: "Detail: code" },
  { id: "detail_code_thumbnail", label: "Detail: code + thumbnail" },
  { id: "detail_indented", label: "Detail: indented section" },
];

export function CardShowcase() {
  const SMALL_TITLE_ONLY: SmallCardItem = {
    id: "small_title_only",
    title: {
      leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }),
      label: "asset.name",
      decorators: undefined,
    },
  };

  const SMALL_DOMAIN_SECONDARY: SmallCardItem = {
    id: "small_domain_secondary",
    title: {
      leadingIcon: <PhIcon icon={Truck} size={16} weight="fill" className="text-text-secondary" />,
      label: "domain.name",
      decorators: [{ kind: "certified" }],
    },
    metadataRow: [{ label: "49 assets", separator: false }],
  };

  const SMALL_CARDS: SmallCardItem[] = [
    {
      id: "small_1",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      metadataRow: [
        { label: "catalog.schema", separator: true },
        { label: "Updated 1d ago", separator: false },
      ],
    },
    {
      id: "small_2",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      metadataRow: [
        { label: "Modified 7d ago", separator: true },
        { label: "Jocelyn Hickcox", separator: false },
      ],
    },
  ];

  const THUMBNAIL_ONE_LINE: ThumbnailCardItem[] = [
    {
      id: "thumb_1a",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "image", dashboardIndex: 7, alt: "Dashboard preview" },
      metadataRow: [{ label: "Updated 1d ago", separator: false }],
    },
    {
      id: "thumb_1b",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Turquoise" },
      metadataRow: [{ label: "Viewed 15d ago", separator: false }],
    },
    {
      id: "thumb_1c",
      // Note: in product, `textSnippet` thumbnails are specifically used for Genie
      // question prompts (not enforced in the prop model).
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.GenieSpaces, { size: 16 }), label: "Ask Genie", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: {
        variant: "textSnippet",
        text: "What were our top 3 logistics delays last week, and which routes caused them?",
        tagColor: "Teal",
      },
      metadataRow: [{ label: "Modified 1d ago", separator: false }],
    },
    {
      id: "thumb_1d",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: [{ kind: "certified" }] },
      subtitle: "You view frequently",
      thumbnail: {
        variant: "code",
        language: "typescript",
        highlightedTokens: ["revenue"],
        code: ["export const revenue = 1234.56;", "export const ok = revenue > 0;"].join("\n"),
      },
      metadataRow: [{ label: "catalog.schema", separator: false }],
    },
  ];

  const THUMBNAIL_TWO_LINE: ThumbnailCardItem[] = [
    {
      id: "thumb_2a",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "image", dashboardIndex: 4, alt: "Dashboard preview" },
      metadataRow: [{ label: "catalog.schema · Updated 1d ago · Viewed 15 days ago", separator: false }],
      description:
        "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
    },
    {
      id: "thumb_2b",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: [{ kind: "certified" }] },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Indigo" },
      metadataRow: [{ label: "catalog.schema · Updated 1d ago · Viewed 15 days ago", separator: false }],
      description:
        "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
    },
    {
      id: "thumb_2c",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.GenieSpaces, { size: 16 }), label: "Ask Genie", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: {
        variant: "textSnippet",
        text: "Summarize revenue drivers for logistics this month and flag anomalies.",
        tagColor: "Teal",
      },
      metadataRow: [{ label: "catalog.schema · Updated 1d ago · Viewed 15 days ago", separator: false }],
      description:
        "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
    },
    {
      id: "thumb_2d",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "code", language: "typescript", code: "type Order = { id: string; quantity: number; };" },
      metadataRow: [{ label: "catalog.schema · Updated 1d ago · Viewed 15 days ago", separator: false }],
      description:
        "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.",
    },
  ];

  const THUMBNAIL_PLACEHOLDER_LAYOUT: ThumbnailCardItem[] = [
    // Match the “thumbnail placeholder + title/subtitle only” layout.
    {
      id: "thumb_3a",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Charcoal" },
    },
    {
      id: "thumb_3b",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Teal" },
    },
    {
      id: "thumb_3c",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.GenieSpaces, { size: 16 }), label: "Ask Genie", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Indigo" },
    },
    {
      id: "thumb_3d",
      title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "asset.name", decorators: undefined },
      subtitle: "You view frequently",
      thumbnail: { variant: "placeholder", tagColor: "Turquoise" },
    },
  ];

  const PROPHECY_SET = {
    name: "Prophecy",
    small: {
      id: "prophecy_small",
      mark: { kind: "logo", src: "/logos/Prophecy.png", alt: "Prophecy" },
      title: { label: "Prophecy", decorators: [{ kind: "certified" }] },
    } satisfies SmallLogoCardItem,
    large: {
      id: "prophecy_large",
      mark: { kind: "logo", src: "/logos/Prophecy.png", alt: "Prophecy" },
      title: { label: "Prophecy", decorators: undefined },
      subtitle: "Marketplace partner",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "Metadata · More metadata", separator: false }],
      tags: [{ label: "Free", color: "Lime" }],
    } satisfies LargeLogoCardItem,
    detail: {
      id: "prophecy_detail",
      mark: { kind: "logo", src: "/logos/Prophecy.png", alt: "Prophecy" },
      title: { label: "Prophecy", decorators: undefined },
      subtitle: "Google",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "342 assets", separator: false }],
    } satisfies DetailLogoCardItem,
  };

  const SONNET_SET = {
    name: "Sonnet",
    small: {
      id: "sonnet_small",
      // Claude Sonnet uses the Claude logo.
      mark: { kind: "logo", src: "/logos/Claude.png", alt: "Claude" },
      title: { label: "Sonnet", decorators: [{ kind: "certified" }] },
    } satisfies SmallLogoCardItem,
    large: {
      id: "sonnet_large",
      mark: { kind: "logo", src: "/logos/Claude.png", alt: "Claude" },
      title: { label: "Sonnet", decorators: undefined },
      subtitle: "Marketplace partner",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "Metadata · More metadata", separator: false }],
      tags: [{ label: "Free", color: "Lime" }],
    } satisfies LargeLogoCardItem,
    detail: {
      id: "sonnet_detail",
      mark: { kind: "logo", src: "/logos/Claude.png", alt: "Claude" },
      title: { label: "Sonnet", decorators: undefined },
      subtitle: "Google",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "342 assets", separator: false }],
    } satisfies DetailLogoCardItem,
  };

  const PIZZA_SET = {
    name: "Pizza (Phosphor icon)",
    small: {
      id: "pizza_small",
      mark: { kind: "phosphor", icon: Pizza, weight: "duotone" },
      title: { label: "Pizza", decorators: [{ kind: "certified" }] },
    } satisfies SmallLogoCardItem,
    large: {
      id: "pizza_large",
      mark: { kind: "phosphor", icon: Pizza, weight: "duotone" },
      title: { label: "Pizza", decorators: undefined },
      subtitle: "Marketplace partner",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "Metadata · More metadata", separator: false }],
      tags: [{ label: "Free", color: "Lime" }],
    } satisfies LargeLogoCardItem,
    detail: {
      id: "pizza_detail",
      mark: { kind: "phosphor", icon: Pizza, weight: "duotone" },
      title: { label: "Pizza", decorators: undefined },
      subtitle: "Google",
      description: (
        <WrappingText lines={2} maxWidth={null}>
          Brief description of the item, which should be no longer than a sentence but will often wrap to a new line.
        </WrappingText>
      ),
      metadataRow: [{ label: "342 assets", separator: false }],
    } satisfies DetailLogoCardItem,
  };

  return (
    <TabsCollection defaultValue="detail" type="lined">
      <TabsList aria-label="Card examples">
        <TabsItem value="detail">Detail cards</TabsItem>
        <TabsItem value="small">Small cards</TabsItem>
        <TabsItem value="thumbnail">Thumbnail cards</TabsItem>
        <TabsItem value="logo">Logo cards</TabsItem>
      </TabsList>

      <div className="mt-md flex flex-col gap-sm">
        <TabsContent value="detail">
          <div className="flex w-full flex-col gap-sm">
            {DETAIL_MODES.map((m) => {
              const item = buildItem(m.id);
              return (
                <div key={m.id} className="flex flex-col gap-xs">
                  <DetailCard
                    item={item}
                    thumbnailPlacement={item.thumbnail ? "right" : "none"}
                  />
                </div>
              );
            })}

            <div className="flex flex-col gap-xs">
              <div className="text-hint text-text-secondary">Detail: borderless</div>
              <DetailCard item={buildItem("detail_basic")} variant="borderless" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="small">
          <div className="flex w-full flex-col gap-sm">
            <div className="max-w-[320px]">
              <SmallCard item={SMALL_TITLE_ONLY} />
            </div>

            <div className="max-w-[320px]">
              <SmallCard item={SMALL_DOMAIN_SECONDARY} background="secondary" />
            </div>

            <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
              {SMALL_CARDS.map((item) => (
                <SmallCard
                  key={item.id}
                  item={item}
                  // Example: some small cards use a secondary background (not used on other card families).
                  background="primary"
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="thumbnail">
          <div className="flex w-full flex-col gap-md">
            <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
              {THUMBNAIL_ONE_LINE.map((item) => <ThumbnailCard key={item.id} item={item} />)}
            </div>
            <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
              {THUMBNAIL_TWO_LINE.map((item) => <ThumbnailCard key={item.id} item={item} />)}
            </div>
            <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
              {THUMBNAIL_PLACEHOLDER_LAYOUT.map((item) => <ThumbnailCard key={item.id} item={item} />)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logo">
          <div className="flex w-full flex-col gap-lg">
            {[PROPHECY_SET, SONNET_SET, PIZZA_SET].map((set) => (
              <div key={set.name} className="flex w-full flex-col gap-sm">
                <div className="text-hint text-text-secondary">{set.name}</div>
                <SmallLogoCard item={set.small} className="max-w-[214px]" />
                <LargeLogoCard item={set.large} className="max-w-[560px]" />
                <DetailLogoCard item={set.detail} className="max-w-[720px]" />
              </div>
            ))}
          </div>
        </TabsContent>
      </div>
    </TabsCollection>
  );
}

