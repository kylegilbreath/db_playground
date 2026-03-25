"use client";

import * as React from "react";

import { AnythingBox } from "@/components/AnythingBox";
import { HuePicker } from "@/components/HuePicker";
import { useOneHue } from "./OneHueContext";
import { ThumbnailCard, type ThumbnailCardItem } from "@/components/Card";
import { AssetTypes, getAssetTypeIcon } from "@/components/AssetVisuals/assetTypeIcons";
import { Section } from "@/components/Section";
import { Icon } from "@/components/icons";
import { ListWidget } from "@/components/ListWidget";
import { ListItem } from "@/components/ListWidget";

const forYouCards: (ThumbnailCardItem & { iconName: string })[] = [
  {
    id: "fy_1",
    iconName: "dashboardIcon",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Dashboards, { size: 16 }), label: "Q1 Revenue Summary", decorators: undefined },
    subtitle: "Trending",
    thumbnail: { variant: "image", dashboardIndex: 1, alt: "Dashboard preview" },
  },
  {
    id: "fy_2",
    iconName: "AppsAssetIcon",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Apps, { size: 16 }), label: "Customer Success Hub", decorators: undefined },
    subtitle: "You view frequently",
    thumbnail: { variant: "image", src: { light: "/images/app-thumbnail-02.png", dark: "/images/app-thumbnail-02.png" }, alt: "App preview" },
  },
  {
    id: "fy_3",
    iconName: "dashboardIcon",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Dashboards, { size: 16 }), label: "Supply Chain Tracker", decorators: undefined },
    subtitle: "You viewed 2h ago",
    thumbnail: { variant: "image", dashboardIndex: 4, alt: "Dashboard preview" },
  },
  {
    id: "fy_4",
    iconName: "AppsAssetIcon",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Apps, { size: 16 }), label: "Inventory Optimizer", decorators: undefined },
    subtitle: "You view frequently",
    thumbnail: { variant: "placeholder", icon: <Icon name="AppsAssetIcon" size={32} /> },
  },
];


export default function Home() {
  const [query, setQuery] = React.useState("");
  const { hue, setHue } = useOneHue();
  return (
    <div className="relative w-full">
      <div className="absolute right-6 top-5 z-10 hidden">
        <HuePicker value={hue} onChange={setHue} />
      </div>
      <main className="relative z-[1] mx-auto flex min-h-dvh w-full max-w-[900px] flex-col gap-[72px] px-6 pb-8 pt-20">

      <div className="flex w-full flex-col items-center text-center">
        <img
          src="/logos/Nike.png"
          alt="Nike"
          className="mb-sm size-14 object-contain dark:invert hidden"
        />
        <h1 className="text-title1 font-semibold tracking-tight">
          What’s next for the Databricks One team?
        </h1>

        <div className="mt-[24px] w-full">
          <AnythingBox
            phase="pre"
            defaultMode="ask"
            value={query}
            onValueChange={setQuery}
          />
        </div>

      </div>

      <div className="mx-auto flex w-full flex-col gap-[32px]">
        <Section
          title="For you"
          titleHref="/one#for-you"
        >
          <ListWidget className="sm:hidden">
            {forYouCards.map((card) => (
              <ListItem
                key={card.id}
                iconName={card.iconName}
                label={card.title.label as string}
                metadata={card.subtitle ? [String(card.subtitle)] : undefined}
              />
            ))}
          </ListWidget>
          <div className="hidden w-full gap-md sm:grid sm:grid-cols-2 md:grid-cols-4">
            {forYouCards.map((card) => (
              <ThumbnailCard key={card.id} item={card} />
            ))}
          </div>
        </Section>

        <div className="flex w-full flex-col gap-md md:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-mid">
            <Section title="Chats" titleHref="/one/chat">
              <ListWidget>
                <ListItem
                  iconName="speechBubbleIcon"
                  label="Revenue drop analysis"
                  metadata={["10m ago"]}
                />
                <ListItem
                  iconName="speechBubbleIcon"
                  label="Customer churn drivers"
                  metadata={["2h ago"]}
                />
                <ListItem
                  iconName="speechBubbleIcon"
                  label="Inventory discrepancy check"
                  metadata={["3h ago"]}
                />
                <ListItem
                  iconName="speechBubbleIcon"
                  label="Dashboard performance issue"
                  metadata={["1d ago"]}
                />
                <ListItem
                  iconName="speechBubbleIcon"
                  label="Campaign performance comparison"
                  metadata={["2d ago"]}
                />
              </ListWidget>
            </Section>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-mid">
            <Section title="Trending" titleHref="/one#trending">
              <ListWidget>
                <ListItem
                  iconName="dashboardIcon"
                  label="Q1 Executive Summary"
                  metadata={["Trending", "Dashboard"]}
                />
                <ListItem
                  iconName="tableIcon"
                  label="Supply Chain Metrics"
                  metadata={["Trending", "Table"]}
                />
                <ListItem
                  iconName="AppsAssetIcon"
                  label="Partner Onboarding Portal"
                  metadata={["Trending", "App"]}
                />
                <ListItem
                  iconName="notebookIcon"
                  label="Data Quality Scorecard"
                  metadata={["Trending", "Notebook"]}
                />
                <ListItem
                  iconName="SparkleRectangleIcon"
                  label="Product Usage Insights"
                  metadata={["Trending", "Genie Space"]}
                />
              </ListWidget>
            </Section>
          </div>
        </div>
      </div>

    </main>
    </div>
  );
}
