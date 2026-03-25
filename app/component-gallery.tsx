import { AnythingBox } from "@/components/AnythingBox";
import { DefaultButton } from "@/components/DefaultButton";
import { FilterChip } from "@/components/FilterChip";
import { FilterChipToggle } from "@/components/FilterChipToggle";
import { IconButton } from "@/components/IconButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TertiaryButton } from "@/components/TertiaryButton";
import { PhosphorIconShowcase } from "@/components/PhosphorIconShowcase";
import { TabsShowcase } from "@/components/Tabs";
import { TableShowcase } from "@/components/Table";
import { TagShowcase } from "@/components/Tag";
import { NameLabelShowcase } from "@/components/NameLabel";
import { MetadataShowcase } from "@/components/Metadata";
import { WrappingTextShowcase } from "@/components/WrappingText";
import { CodeBlockShowcase } from "@/components/CodeBlock";
import { IndentedTextSnippetShowcase } from "@/components/IndentedTextSnippet";
import { CardThumbnailShowcase } from "@/components/CardThumbnail";
import { CardShowcase } from "@/components/Card";
import { AssetTypeIconPairs } from "@/components/AssetVisuals";
import { SectionShowcase } from "@/components/Section";
import { MenuShowcase } from "@/components/Menu";
import { AiOverviewShowcase } from "@/components/AiOverview";
import { AlertShowcase } from "@/components/Alert";
import { AgentChatShowcase } from "@/components/AgentChat/AgentChatShowcase";
import { CustomTextWidgetShowcase } from "@/components/CustomTextWidget";
import { ListWidgetShowcase } from "@/components/ListWidget";
import { Icon } from "@/components/icons";
import { readdir } from "node:fs/promises";
import path from "node:path";
import Image from "next/image";

async function getLogoFiles() {
  const dir = path.join(process.cwd(), "public", "logos");
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => /\.(svg|png|webp|jpg|jpeg)$/i.test(name))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-baseline justify-between gap-sm">
      <h2 className="text-title3 font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

export async function ComponentGallery() {
  const logos = await getLogoFiles();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-lg px-6 py-8">
      <header className="flex flex-col gap-sm">
        <h1 className="text-title2 font-semibold tracking-tight">
          Component gallery
        </h1>
        <p className="text-paragraph text-text-secondary">
          Quick review sheet for components built so far.
        </p>
      </header>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Agent chat" />
        <AgentChatShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Menu" />
        <MenuShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="AI overview" />
        <AiOverviewShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Alert" />
        <AlertShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Cards" />
        <CardShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Asset type icons" />
        <p className="text-paragraph text-text-secondary">
          All enumerated asset types mapped to their icon names.
        </p>
        <AssetTypeIconPairs />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Custom icons" />
        <p className="text-paragraph text-text-secondary">
          Custom SVG icons in <code className="text-caption">public/icons/</code>.
        </p>
        <div className="flex flex-wrap gap-md">
          {(
            [
              "genieIcon",
              "SparkleIcon",
              "SparkleRectangleIcon",
              "UserSparkleIcon",
              "QueryEditorIcon",
              "discoverIcon",
              "homeIcon",
              "speechBubbleIcon",
              "newChatIcon",
              "sidebarClosedIcon",
              "sidebarOpenIcon",
              "threadAttentionIcon",
            ] as const
          ).map((name) => (
            <div key={name} className="flex flex-col items-center gap-xs">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-background-secondary">
                <Icon name={name} size={16} className="text-text-primary" />
              </div>
              <span className="text-[10px] leading-4 text-text-secondary">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Section" />
        <SectionShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="List widget" />
        <ListWidgetShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Custom text widget" />
        <CustomTextWidgetShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Anything box" />
        <div className="flex flex-col gap-lg">
          <AnythingBox phase="pre" defaultMode="search" />
          <AnythingBox phase="pre" defaultMode="ask" />
          <AnythingBox phase="search" mode="search" />
          <AnythingBox phase="chat" mode="ask" />
          <AnythingBox phase="editing" mode="ask" defaultValue="What’s the deal with airplane food?" />
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Filter chips" />
        <div className="flex flex-wrap items-center gap-sm">
          <FilterChip label="Favorite" leadingIcon={<Icon name="starIcon" />} />
          <FilterChip label="Certified" leadingIcon={<Icon name="CertifiedIcon" />} />
          <FilterChip label="Owned by me" />
          <FilterChip label="Modified this week" kind="dropdown" />
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Filter panel toggle chip" />
        <div className="flex flex-wrap items-center gap-sm">
          <FilterChipToggle aria-label="All filters" />
          <FilterChipToggle aria-label="All filters (1 applied)" hasFiltersApplied />
          <FilterChipToggle
            aria-label="All filters (12 applied)"
            hasFiltersApplied
            appliedCount={12}
          />
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Icon button" />
        <div className="flex flex-wrap items-center gap-sm">
          <IconButton aria-label="Close" icon={<Icon name="closeIcon" />} />
          <IconButton
            aria-label="Close (full radius)"
            radius="full"
            icon={<Icon name="closeIcon" />}
          />
          <IconButton aria-label="Close (small)" size="small" icon={<Icon name="closeIcon" />} />
          <IconButton
            aria-label="Close (small, full radius)"
            size="small"
            radius="full"
            icon={<Icon name="closeIcon" />}
          />
          <IconButton aria-label="Close (disabled)" icon={<Icon name="closeIcon" />} disabled />
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Primary button" />
        <div className="flex flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <PrimaryButton>Default</PrimaryButton>
            <PrimaryButton leadingIcon={<Icon name="plusIcon" size={16} />}>With icon</PrimaryButton>
            <PrimaryButton menu>Menu</PrimaryButton>
            <PrimaryButton radius="full">Full radius</PrimaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <PrimaryButton size="small">Small</PrimaryButton>
            <PrimaryButton size="small" leadingIcon={<Icon name="plusIcon" size={16} />}>
              Small icon
            </PrimaryButton>
            <PrimaryButton size="small" menu>
              Small menu
            </PrimaryButton>
            <PrimaryButton size="small" radius="full">
              Small full
            </PrimaryButton>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Default button" />
        <div className="flex flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <DefaultButton>Default</DefaultButton>
            <DefaultButton leadingIcon={<Icon name="plusIcon" size={16} />}>With icon</DefaultButton>
            <DefaultButton menu>Menu</DefaultButton>
            <DefaultButton radius="full">Full radius</DefaultButton>
            <DefaultButton disabled>Disabled</DefaultButton>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <DefaultButton size="small">Small</DefaultButton>
            <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={16} />}>
              Small icon
            </DefaultButton>
            <DefaultButton size="small" menu>
              Small menu
            </DefaultButton>
            <DefaultButton size="small" radius="full">
              Small full
            </DefaultButton>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Tertiary button" />
        <div className="flex flex-col gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <TertiaryButton>Accent</TertiaryButton>
            <TertiaryButton tone="neutral">Neutral</TertiaryButton>
            <TertiaryButton tone="muted">Muted</TertiaryButton>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <TertiaryButton leadingIcon={<Icon name="plusIcon" size={16} />}>
              With icon
            </TertiaryButton>
            <TertiaryButton menu>Menu</TertiaryButton>
            <TertiaryButton radius="full">Full radius</TertiaryButton>
            <TertiaryButton disabled>Disabled</TertiaryButton>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <TertiaryButton size="small">Small</TertiaryButton>
            <TertiaryButton size="small" radius="full">
              Small full
            </TertiaryButton>
            <TertiaryButton size="small" menu>
              Small menu
            </TertiaryButton>
            <TertiaryButton
              size="small"
              leadingIcon={<Icon name="plusIcon" size={16} />}
            >
              Small icon
            </TertiaryButton>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Tag" />
        <TagShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Name label" />
        <NameLabelShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Metadata row" />
        <MetadataShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Wrapping text" />
        <WrappingTextShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Code block" />
        <CodeBlockShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Indented text snippet" />
        <IndentedTextSnippetShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Card thumbnail" />
        <CardThumbnailShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Tabs" />
        <TabsShowcase />
      </section>

      <section className="flex flex-col gap-sm">
        <SectionHeader title="Table" />
        <TableShowcase />
      </section>

      <section className="mt-lg flex flex-col gap-sm">
        <SectionHeader title="Icons" />
        <p className="text-paragraph text-text-secondary">
          Phosphor weights + secondary colors (kept at bottom because it’s a large section).
        </p>
        <PhosphorIconShowcase />
      </section>

      <section className="mt-lg flex flex-col gap-sm">
        <SectionHeader title="Logos" />
        {logos.length === 0 ? (
          <p className="text-paragraph text-text-secondary">
            No logos found in <span className="font-mono">public/logos/</span>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {logos.map((file) => {
              const src = `/logos/${file}`;
              const label = file.replace(/\.[^.]+$/, "");
              return (
                <div
                  key={file}
                  className="flex items-center gap-sm rounded-md border border-border bg-background-primary p-sm"
                >
                  <div className="flex size-14 items-center justify-center">
                    <Image
                      alt={label}
                      src={src}
                      width={56}
                      height={56}
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-paragraph text-text-secondary" title={label}>
                      {label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

