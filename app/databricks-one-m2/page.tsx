"use client";

import * as React from "react";

import { AnythingBox } from "@/components/AnythingBox";
import { SmallCard, type SmallCardItem, ThumbnailCard, type ThumbnailCardItem } from "@/components/Card";
import { AssetTypes, getAssetTypeIcon } from "@/components/AssetVisuals/assetTypeIcons";
import { Section } from "@/components/Section";
import { Icon } from "@/components/icons";
import { HuePicker } from "@/components/HuePicker";
import { useOneHue } from "@/app/one/OneHueContext";
import { ListWidget } from "@/components/ListWidget";
import { ListItem } from "@/components/ListWidget";
import { CustomTextWidget } from "@/components/CustomTextWidget";

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

const pinnedItems: SmallCardItem[] = [
  {
    id: "pin_1",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Dashboards, { size: 16 }), label: "Sales Pipeline Overview", decorators: [{ kind: "pinned" }] },
    subtitle: "North America sales funnel",
    metadataRow: [{ label: "Jane Kim" }, { label: "67 views" }, { label: "67 views", separator: false }],
  },
  {
    id: "pin_2",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Tables, { size: 16 }), label: "core.fact_transactions", decorators: [{ kind: "pinned" }, { kind: "certified" }] },
    subtitle: "Primary transaction ledger",
    metadataRow: [{ label: "analytics.core" }, { label: "203 views", separator: false }],
  },
  {
    id: "pin_3",
    title: { leadingIcon: getAssetTypeIcon(AssetTypes.Apps, { size: 16 }), label: "Customer Success Hub", decorators: [{ kind: "pinned" }] },
    subtitle: "Account health & renewals",
    metadataRow: [{ label: "Tom Nguyen" }, { label: "89 views", separator: false }],
  },
];

const linkClass = "text-action-tertiary-text-default no-underline hover:text-action-tertiary-text-hover hover:underline active:text-action-tertiary-text-press";

function WelcomeWidgetContent() {
  return (
    <div className="min-w-0 text-paragraph leading-5 text-text-primary">
      <div className="text-title3 font-semibold leading-6 text-text-primary">
        Welcome to the Nike Analytics Workspace
      </div>
      <p className="mt-1 text-paragraph leading-5 text-text-primary">
        This workspace is the shared home for analytics, reporting, and business insights across Nike.
        It brings together trusted metrics, curated dashboards, and guided insights to support day-to-day decision-making.
      </p>
      <div className="mt-md font-semibold">Get started</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li><a className={linkClass} href="#">Browse dashboards and reports</a></li>
        <li><a className={linkClass} href="#">View certified metrics and definitions</a></li>
        <li><a className={linkClass} href="#">Read the onboarding guide for business users</a></li>
      </ul>
      <div className="mt-md font-semibold">What&apos;s important</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>Use certified metrics for leadership reporting and recurring reviews</li>
        <li>Dashboards in this workspace reflect standardized, agreed-upon definitions</li>
        <li>Some legacy reports may be phased out as metrics are consolidated</li>
      </ul>
      <div className="mt-md font-semibold">Need help?</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li><a className={linkClass} href="#">#nike-analytics-help</a> on Slack</li>
        <li>Office hours: Wednesdays 1–2pm</li>
        <li>Workspace owners: Analytics Platform Team</li>
      </ul>
      <div className="mt-md font-semibold">Standards</div>
      <ul className="mt-xs list-disc pl-5 text-paragraph leading-5">
        <li>All new dashboards should include an owner and clear description</li>
        <li>Prefer shared metric definitions whenever available</li>
        <li>Avoid duplicating reports that already exist in this workspace</li>
      </ul>
    </div>
  );
}

export default function M2Home() {
  const [query, setQuery] = React.useState("");
  const { hue, setHue } = useOneHue();

  return (
    <div className="relative w-full">
      <div className="absolute right-6 top-5 z-10 hidden">
        <HuePicker value={hue} onChange={setHue} />
      </div>
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[900px] flex-col gap-[64px] px-6 pb-8 pt-20">

      <div className="flex w-full flex-col items-center text-center">
        <img
          src="/logos/Nike.png"
          alt="Nike"
          className="mb-sm size-14 object-contain dark:invert"
        />
        <h1 className="text-title1 font-semibold tracking-tight">
          What&apos;s next for the Databricks One team?
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
        <Section title="Pinned">
          <div className="grid w-full grid-cols-1 gap-md sm:grid-cols-3">
            {pinnedItems.map((item) => (
              <SmallCard key={item.id} item={item} />
            ))}
          </div>
        </Section>

        <Section title="About">
          <CustomTextWidget
            actions={[
              {
                id: "hide",
                ariaLabel: "Hide widget",
                iconName: "visibleOffIcon",
                onClick: () => {},
              },
            ]}
          >
            <WelcomeWidgetContent />
          </CustomTextWidget>
        </Section>

        <Section
          title="For you"
          titleHref="/databricks-one-m2#for-you"
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

        <div className="flex w-full flex-col gap-[32px] md:flex-row md:gap-md">
          <div className="flex min-w-0 flex-1 flex-col gap-mid">
            <Section title="Recents" titleHref="/databricks-one-m2#recents">
              <ListWidget>
                <ListItem
                  iconName="dashboardIcon"
                  label="Sales Pipeline Overview"
                  metadata={["10m ago", "67 views", "Jane Kim"]}
                />
                <ListItem
                  iconName="notebookIcon"
                  label="Customer Churn Analysis"
                  metadata={["2h ago", "34 views", "Raj Patel"]}
                />
                <ListItem
                  iconName="SparkleRectangleIcon"
                  label="Revenue Forecasting"
                  metadata={["3h ago", "51 views", "Sara Lee"]}
                />
                <ListItem
                  iconName="AppsAssetIcon"
                  label="Inventory Health Monitor"
                  metadata={["1d ago", "89 views", "Tom Nguyen"]}
                />
                <ListItem
                  iconName="dashboardIcon"
                  label="Marketing Attribution"
                  metadata={["2d ago", "112 views", "Priya Sharma"]}
                />
              </ListWidget>
            </Section>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-mid">
            <Section title="Trending" titleHref="/databricks-one-m2#trending">
              <ListWidget>
                <ListItem
                  iconName="dashboardIcon"
                  label="Q1 Executive Summary"
                  metadata={["Trending", "142 views", "Alex Chen"]}
                />
                <ListItem
                  iconName="tableIcon"
                  label="Supply Chain Metrics"
                  metadata={["Trending", "78 views", "Maria Lopez"]}
                />
                <ListItem
                  iconName="AppsAssetIcon"
                  label="Partner Onboarding Portal"
                  metadata={["Trending", "56 views", "David Park"]}
                />
                <ListItem
                  iconName="notebookIcon"
                  label="Data Quality Scorecard"
                  metadata={["Trending", "203 views", "Lena Fischer"]}
                />
                <ListItem
                  iconName="SparkleRectangleIcon"
                  label="Product Usage Insights"
                  metadata={["Trending", "91 views", "Chris Tanaka"]}
                />
              </ListWidget>
            </Section>
          </div>
        </div>
      </div>

      <div className="h-[20vh] shrink-0" aria-hidden="true" />
    </main>
    </div>
  );
}
