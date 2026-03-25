"use client";

import * as React from "react";

import { LargeLogoCard, type LargeLogoCardItem } from "@/components/Card";
import { IconButton } from "@/components/IconButton";
import { Menu } from "@/components/Menu";
import { Icon } from "@/components/icons";
import { Section } from "@/components/Section";
import { Table, TableCell, TableCellContent, TableRow, TableTagList } from "@/components/Table";

type AiGatewayRow = {
  id: string;
  name: string;
  nameIcon: { kind: "model" } | { kind: "databricks" };
  gatewayFeatures: Array<"inference table" | "usage tracking" | "rate limits">;
  totalTokens7d: number;
  createdBy: string;
  lastModified: string;
};

function makeAiGatewayRows(count: number): AiGatewayRow[] {
  const creators = [
    "Josh Braun",
    "Krishna Rupanagunta",
    "Luke Duncan",
    "Alysson Souza",
    "Chen en Liang",
  ];
  return Array.from({ length: count }).map((_, idx) => {
    const n = idx + 1;
    const featureSets: AiGatewayRow["gatewayFeatures"][] = [
      ["inference table", "usage tracking", "rate limits"],
      ["usage tracking", "rate limits"],
      ["inference table", "usage tracking"],
      ["inference table"],
    ];
    return {
      id: `gateway_${n}`,
      name: n % 6 === 0 ? "example" : `gateway_${n}`,
      nameIcon: n % 3 === 0 ? { kind: "databricks" } : { kind: "model" },
      gatewayFeatures: featureSets[idx % featureSets.length]!,
      totalTokens7d: 0,
      createdBy: creators[idx % creators.length] ?? "User",
      lastModified: n % 2 === 0 ? "Feb 2, 2026, 05:15 PM" : "Feb 3, 2026, 09:21 AM",
    };
  });
}

function featureTagModel(label: AiGatewayRow["gatewayFeatures"][number]) {
  return {
    id: label,
    label,
    leftElement: { type: "Icon" as const, icon: <span className="block size-2 rounded-full bg-current" /> },
  };
}

export default function AiGatewayPage() {
  const [topTab, setTopTab] = React.useState<"coding_agents" | "featured_models">(
    "coding_agents",
  );

  const codingAgents: LargeLogoCardItem[] = [
    {
      id: "coding_agents_cursor",
      mark: { kind: "logo", src: "/logos/Cursor.svg", alt: "Cursor" },
      title: { label: "Cursor", decorators: undefined },
    },
    {
      id: "coding_agents_codex",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "Codex", decorators: undefined },
    },
    {
      id: "coding_agents_gemini",
      mark: { kind: "logo", src: "/logos/Gemini.png", alt: "Gemini" },
      title: { label: "Gemini", decorators: undefined },
    },
    {
      id: "coding_agents_other_integrations",
      mark: { kind: "logo", src: "/logos/Databricks.png", alt: "Databricks" },
      title: { label: "Other integrations", decorators: undefined },
    },
  ];

  const featuredModels: LargeLogoCardItem[] = [
    {
      id: "featured_models_gpt_5_2",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "GPT-5.2", decorators: undefined },
    },
    {
      id: "featured_models_claude_opus_4_6",
      mark: { kind: "logo", src: "/logos/Claude.png", alt: "Claude" },
      title: { label: "Claude Opus 4.6", decorators: undefined },
    },
    {
      id: "featured_models_gemini_3_pro",
      mark: { kind: "logo", src: "/logos/Gemini.png", alt: "Gemini" },
      title: { label: "Gemini 3 Pro", decorators: undefined },
    },
    {
      id: "featured_models_gpt_oss_120b",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "GPT OSS 120B", decorators: undefined },
    },
  ];

  const rows = React.useMemo(() => makeAiGatewayRows(10), []);
  const [lastModifiedSort, setLastModifiedSort] = React.useState<"asc" | "desc">("desc");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1250px] flex-col gap-lg px-6 pb-8 pt-10">
      <div className="sticky top-0 z-30 bg-background-primary">
        <Menu
          title="AI Gateway"
          titleRight={
            <IconButton
              aria-label="More"
              icon={<Icon name="overflowIcon" size={16} />}
              size="small"
              tone="neutral"
            />
          }
          anythingBoxProps={{
            placeholder: "Search AI Gateway",
            searchActions: [],
          }}
          chipsRowProps={{
            chips: [
              { id: "owned_by_me", label: "Owned by me", applied: false },
              { id: "created_by", label: "Created by", kind: "dropdown", applied: false },
              { id: "gateway_features", label: "Gateway features", kind: "dropdown", applied: false },
            ],
            appliedCount: 0,
            hasFiltersApplied: false,
          }}
        />
      </div>

      <div className="flex w-full flex-col gap-[40px]">
        <Section
          mode="tabs"
          tabs={[
            {
              id: "coding_agents",
              label: "Coding agents",
              content: (
                <div className="flex w-full flex-col gap-md">
                  <p className="max-w-[800px] text-paragraph leading-5 text-text-secondary">
                    Manage usage and access for coding agents
                  </p>
                  <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
                    {codingAgents.map((item) => (
                      <LargeLogoCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ),
            },
            {
              id: "featured_models",
              label: "Featured models",
              content: (
                <div className="flex w-full flex-col gap-md">
                  <p className="max-w-[800px] text-paragraph leading-5 text-text-secondary">
                    Frontier models hosted by Databricks
                  </p>
                  <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
                    {featuredModels.map((item) => (
                      <LargeLogoCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
          value={topTab}
          onValueChange={(next) => setTopTab(next as typeof topTab)}
        />

        <Section title="AI Gateway">
          <div className="w-full overflow-hidden rounded-md bg-background-primary">
            <Table>
              <TableRow state="Header">
                <TableCell>
                  <TableCellContent type="Header">Name</TableCellContent>
                </TableCell>
                <TableCell data-collapse-priority={10}>
                  <TableCellContent type="Header">Gateway Features</TableCellContent>
                </TableCell>
                <TableCell data-collapse-priority={20}>
                  <TableCellContent type="Header">Total tokens (7d)</TableCellContent>
                </TableCell>
                <TableCell data-collapse-priority={30}>
                  <TableCellContent type="Header">Created by</TableCellContent>
                </TableCell>
                <TableCell data-collapse-priority={40}>
                  <TableCellContent
                    type="Header"
                    sortable
                    sortDirection={lastModifiedSort}
                    onSortChange={setLastModifiedSort}
                  >
                    Last modified
                  </TableCellContent>
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
                        {r.nameIcon.kind === "model" ? (
                          <Icon name="modelsIcon" size={16} className="text-text-secondary" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt=""
                            className="block size-4 object-contain"
                            src="/logos/Databricks.png"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">
                        {r.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <TableTagList tags={r.gatewayFeatures.map(featureTagModel)} />
                  </TableCell>

                  <TableCell>
                    <TableCellContent type="Text">{String(r.totalTokens7d)}</TableCellContent>
                  </TableCell>

                  <TableCell>
                    <TableCellContent type="User" mode="User">
                      {r.createdBy}
                    </TableCellContent>
                  </TableCell>

                  <TableCell>
                    <TableCellContent type="Text">{r.lastModified}</TableCellContent>
                  </TableCell>

                  <TableCell>
                    <TableCellContent type="Actions" />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        </Section>
      </div>
    </main>
  );
}

