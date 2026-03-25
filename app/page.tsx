"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AnythingBox } from "@/components/AnythingBox";
import { ThumbnailCard } from "@/components/Card";
import { FilterChip } from "@/components/FilterChip";
import { FilterChipToggle } from "@/components/FilterChipToggle";
import { Icon } from "@/components/icons";
import { MenuChipsRow } from "@/components/Menu";
import { Section } from "@/components/Section";
import { Table, TableCell, TableCellContent, TableRow } from "@/components/Table";
import { type AvatarSecondaryColor } from "@/components/Table/Table";

type QuickChip = {
  id: string;
  label: string;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
};

const AVATAR_COLORS: AvatarSecondaryColor[] = [
  "lime",
  "teal",
  "turquoise",
  "indigo",
  "purple",
  "pink",
  "coral",
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

function QuickChipsRow({
  chips,
  onChipClick,
}: {
  chips: QuickChip[];
  onChipClick?: (id: string) => boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const measureRef = React.useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = React.useState(0);
  const [measuredWidth, setMeasuredWidth] = React.useState(0);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    setMeasuredWidth(el.getBoundingClientRect().width);
  }, [chips]);

  const useCarousel = measuredWidth > 0 && containerWidth > 0 && measuredWidth > containerWidth;

  return (
    <div ref={containerRef} className="w-full">
      {/* Hidden measurement row (always mounted) so we can switch back/forth on resize. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 overflow-hidden opacity-0"
      >
        <div className="inline-flex items-center gap-sm whitespace-nowrap">
          <FilterChipToggle aria-label="All filters" />
          {chips.map((c) => (
            <FilterChip
              key={c.id}
              label={c.label}
              leadingIcon={c.leadingIcon}
              disabled={c.disabled}
              className={c.className}
            />
          ))}
        </div>
      </div>

      {useCarousel ? (
        <MenuChipsRow
          appliedCount={0}
          chips={chips.map((c) => ({
            id: c.id,
            label: c.label,
            leadingIcon: c.leadingIcon,
            disabled: c.disabled,
            className: c.className,
            onClick:
              onChipClick && !c.disabled
                ? (e) => {
                    const handled = onChipClick(c.id);
                    if (handled) e.preventDefault();
                  }
                : undefined,
          }))}
          hasFiltersApplied={false}
        />
      ) : (
        <div className="flex w-full justify-center">
          <div className="inline-flex items-center gap-sm">
            <FilterChipToggle aria-label="All filters" />
            {chips.map((c) => (
              <FilterChip
                key={c.id}
                label={c.label}
                leadingIcon={c.leadingIcon}
                disabled={c.disabled}
                className={c.className}
                onClick={
                  onChipClick && !c.disabled
                    ? (e) => {
                        const handled = onChipClick(c.id);
                        if (handled) e.preventDefault();
                      }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [mode, setMode] = React.useState<"search" | "ask">("search");
  const GOLDEN_DEMO_QUERY = "customer churn";

  const quickChips: QuickChip[] = [
    { id: "genie_spaces", label: "Genie Spaces" },
    { id: "queries", label: "Queries", disabled: true, className: "!opacity-100 !cursor-default" },
    { id: "notebooks", label: "Notebooks" },
    { id: "tables", label: "Tables" },
    { id: "jobs", label: "Jobs", disabled: true, className: "!opacity-100 !cursor-default" },
    {
      id: "upload_data",
      label: "Upload data",
      leadingIcon: <Icon name="uploadIcon" size={16} />,
      disabled: true,
      className: "border-dashed !opacity-100 !cursor-default",
    },
  ];

  const cards = [
    {
      id: "recent_1",
      title: "Genie Space Name",
      subtitle: "Edited 5 hours ago",
      thumbnail: {
        variant: "placeholder" as const,
        icon: <Icon name="SparkleRectangleIcon" size={32} />,
      },
      iconName: "SparkleRectangleIcon",
    },
    {
      id: "recent_2",
      title: "Project 1",
      subtitle: "Edited 5 hours ago",
      thumbnail: { variant: "placeholder" as const },
      iconName: "folderFilledIcon",
    },
    {
      id: "recent_3",
      title: "Dashboard Name",
      subtitle: "Edited 5 hours ago",
      thumbnail: { variant: "image" as const, dashboardIndex: 3 },
      iconName: "dashboardIcon",
    },
    {
      id: "recent_4",
      title: "Notebook Name",
      subtitle: "Edited 5 hours ago",
      thumbnail: {
        variant: "code" as const,
        language: "python",
        code: "import pandas as pd\n\ndf = spark.table('sales')\n(df\n  .groupby('region')\n  .sum())\n",
      },
      iconName: "notebookIcon",
    },
  ];

  const tableRows = [
    {
      id: "t1",
      iconName: "tableIcon",
      name: "Sales Supply Chain Optimization",
      reason: "You view frequently",
      domain: "Governance & Compliance",
      owner: "Nina Adams",
    },
    {
      id: "t2",
      iconName: "dashboardIcon",
      name: "Sales Pipeline Manager",
      reason: "Viewed 2 hours ago",
      domain: "Sales",
      owner: "Liam Baker",
    },
    {
      id: "t3",
      iconName: "notebookIcon",
      name: "User Experience Assessment",
      reason: "Trending",
      domain: "Supply Chain & Logistics",
      owner: "Olivia Carter",
    },
    {
      id: "t4",
      iconName: "modelsIcon",
      name: "Customer Cohort Analysis",
      reason: "You view frequently",
      domain: "Data Science & AI",
      owner: "Samantha Green",
    },
    {
      id: "t5",
      iconName: "SparkleRectangleIcon",
      name: "R&D Planning Dashboard",
      reason: "Viewed 1 day ago",
      domain: "Product & R&D",
      owner: "Quincy James",
    },
    {
      id: "t6",
      iconName: "tableIcon",
      name: "Revenue Forecasting (FY27)",
      reason: "Trending",
      domain: "Finance",
      owner: "Ava Patel",
    },
    {
      id: "t7",
      iconName: "dashboardIcon",
      name: "Customer Support Triage",
      reason: "Viewed 3 hours ago",
      domain: "Support",
      owner: "Ethan Brooks",
    },
    {
      id: "t8",
      iconName: "notebookIcon",
      name: "Product Experiment Tracker",
      reason: "You view frequently",
      domain: "Product & R&D",
      owner: "Mia Chen",
    },
    {
      id: "t9",
      iconName: "modelsIcon",
      name: "Marketing Attribution Overview",
      reason: "Viewed 2 days ago",
      domain: "Marketing",
      owner: "Noah Kim",
    },
    {
      id: "t10",
      iconName: "SparkleRectangleIcon",
      name: "Inventory Health Dashboard",
      reason: "Viewed 1 day ago",
      domain: "Supply Chain & Logistics",
      owner: "Isabella Rivera",
    },
    {
      id: "t11",
      iconName: "tableIcon",
      name: "Security & Compliance Audit",
      reason: "Trending",
      domain: "Governance & Compliance",
      owner: "Lucas Nguyen",
    },
    {
      id: "t12",
      iconName: "dashboardIcon",
      name: "Sales Territory Coverage",
      reason: "Viewed 5 hours ago",
      domain: "Sales",
      owner: "Sophia Martinez",
    },
    {
      id: "t13",
      iconName: "notebookIcon",
      name: "Data Quality Monitoring",
      reason: "You view frequently",
      domain: "Data Platform",
      owner: "Benjamin Lee",
    },
    {
      id: "t14",
      iconName: "modelsIcon",
      name: "Customer Churn Signals",
      reason: "Viewed 4 days ago",
      domain: "Data Science & AI",
      owner: "Charlotte Johnson",
    },
    {
      id: "t15",
      iconName: "SparkleRectangleIcon",
      name: "Partner Adoption Insights",
      reason: "Viewed 1 week ago",
      domain: "Partnerships",
      owner: "William Davis",
    },
  ];

  const table = (
    <div className="w-full overflow-hidden rounded-md bg-background-primary">
      <Table>
        <TableRow state="Header">
          <TableCell>
            <TableCellContent type="Header">Name</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={10}>
            <TableCellContent type="Header">Reason suggested</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={20}>
            <TableCellContent type="Header">Domain</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={30}>
            <TableCellContent type="Header">Owner</TableCellContent>
          </TableCell>
          <TableCell data-collapse-priority={0}>
            <TableCellContent type="Actions" />
          </TableCell>
        </TableRow>

        {tableRows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div className="flex w-full min-w-0 items-center gap-sm">
                <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
                  <Icon name={r.iconName} size={16} className="text-text-secondary" />
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
              <TableCellContent type="Text">{r.domain}</TableCellContent>
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

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1250px] flex-col gap-[72px] px-6 pb-8 pt-20">
      <div className="flex w-full flex-col items-center text-center">
        <h1 className="text-title1 font-semibold tracking-tight">
          What would you like to know?
        </h1>

        <div className="mt-[48px] w-full max-w-[800px]">
          <AnythingBox
            phase="pre"
            defaultMode="search"
            value={query}
            onValueChange={setQuery}
            onModeChange={setMode}
            onSubmit={() => {
              if (!query.trim()) return;
              if (mode === "ask") {
                router.push(`/chat?prompt=${encodeURIComponent(query.trim())}`);
              } else {
                setQuery(GOLDEN_DEMO_QUERY);
                router.push(`/search?q=${encodeURIComponent(GOLDEN_DEMO_QUERY)}`);
              }
            }}
          />
        </div>

        <div className="mt-md w-full">
          <QuickChipsRow
            chips={quickChips}
            onChipClick={(id) => {
              if (id === "genie_spaces") {
                router.push("/search?template=genie-spaces");
                return true;
              }
              if (id === "notebooks") {
                router.push("/search?template=notebooks");
                return true;
              }
              if (id === "tables") {
                router.push("/search?template=tables");
                return true;
              }
              return false;
            }}
          />
        </div>
      </div>

      <Section title="For you">
        <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <ThumbnailCard
              key={c.id}
              item={{
                id: c.id,
                thumbnail: c.thumbnail,
                title: {
                  leadingIcon: (
                    <Icon
                      name={c.iconName}
                      size={16}
                      className={c.id === "recent_2" ? "text-blue-400" : "text-text-secondary"}
                    />
                  ),
                  label: c.title,
                },
                subtitle: c.subtitle,
                metadataRow: undefined,
              }}
            />
          ))}
        </div>
      </Section>

      <Section
        mode="tabs"
        tabs={[
          { id: "suggested", label: "Suggested", content: table },
          { id: "recents", label: "Recents", content: table },
          { id: "favorites", label: "Favorites", content: table },
          { id: "shared", label: "Shared", content: table },
        ]}
      />
    </main>
  );
}
