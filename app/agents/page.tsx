"use client";

import * as React from "react";

import { SmallCard, type SmallCardItem } from "@/components/Card";
import { Menu } from "@/components/Menu";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import { Section } from "@/components/Section";
import { Table, TableCell, TableCellContent, TableRow } from "@/components/Table";
import { Tag } from "@/components/Tag";

type Tile = {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  decoratorTagLabel?: string;
};

function toSmallCardItem(t: Tile): SmallCardItem {
  return {
    id: t.id,
    title: {
      leadingIcon: <Icon name={t.iconName} size={16} className="text-text-secondary" />,
      label: t.title,
      decorators: t.decoratorTagLabel
        ? [{ kind: "tag", label: t.decoratorTagLabel, color: "Indigo" }]
        : undefined,
    },
    subtitle: t.subtitle,
    metadataRow: undefined,
  };
}

function TilesGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <SmallCard key={t.id} item={toSmallCardItem(t)} />
      ))}
    </div>
  );
}

type AgentRow = {
  id: string;
  name: string;
  agentType: string;
  endpoint: string;
  lastModified: string;
};

function makeAgentRows(count: number): AgentRow[] {
  return Array.from({ length: count }).map((_, idx) => {
    const n = idx + 1;
    return {
      id: `agent_${n}`,
      name: `agents.agent_${n}`,
      agentType:
        n % 4 === 0
          ? "AI/BI Genie"
          : n % 4 === 1
            ? "Parse Document"
            : n % 4 === 2
              ? "Information Extraction"
              : "Knowledge Assistant",
      endpoint: `https://api.example.com/agents/agent_${n}`,
      lastModified: n % 5 === 0 ? "Today" : `${n}d ago`,
    };
  });
}

type McpServerRow = {
  id: string;
  name: string;
  serverType:
    | "External API"
    | "Custom MCP Server"
    | "Vector Search Index"
    | "Genie Space"
    | "UC Function"
    | "DBSQL MCP Server";
  status: "Active";
  createdBy: string;
};

function makeMcpServerRows(count: number): McpServerRow[] {
  const serverTypes: McpServerRow["serverType"][] = [
    "External API",
    "Custom MCP Server",
    "Vector Search Index",
    "Genie Space",
    "UC Function",
    "DBSQL MCP Server",
  ];

  return Array.from({ length: count }).map((_, idx) => {
    const n = idx + 1;
    return {
      id: `mcp_${n}`,
      name: `mcp.server_${n}`,
      serverType: serverTypes[idx % serverTypes.length]!,
      status: "Active",
      createdBy: n % 3 === 0 ? "Jane Doe" : n % 3 === 1 ? "Alex Smith" : "Sam Lee",
    };
  });
}

export default function AgentsPage() {
  const startSomethingNewAgents: Tile[] = [
    {
      id: "agents_parse",
      iconName: "fileDocumentIcon",
      title: "Parse Document",
      subtitle: "Parse and visualize document structure with AI",
    },
    {
      id: "agents_ie",
      iconName: "clipboardIcon",
      title: "Information Extraction",
      subtitle: "Extract key information into structured JSON",
      decoratorTagLabel: "Beta",
    },
    {
      id: "agents_knowledge_assistant",
      iconName: "questionMarkOutlinedIcon",
      title: "Knowledge Assistant",
      subtitle: "Turn docs into an expert AI chatbot",
    },
    {
      id: "agents_aibi_genie",
      iconName: "SparkleDoubleIcon",
      title: "AI/BI Genie",
      subtitle: "Turn tables into a conversational assistant",
    },
  ];

  const rows = React.useMemo(() => makeAgentRows(20), []);
  const mcpRows = React.useMemo(() => makeMcpServerRows(12), []);
  const [tabValue, setTabValue] = React.useState("agent_bricks");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1250px] flex-col gap-lg px-6 pb-8 pt-10">
      <div className="sticky top-0 z-30 bg-background-primary">
        <Menu
          title="Agents"
          titleRight={
            <IconButton
              aria-label="More"
              icon={<Icon name="overflowIcon" size={16} />}
              size="small"
              tone="neutral"
            />
          }
          tabs={[
            { value: "agent_bricks", label: "Agent Bricks" },
            { value: "mcp_servers", label: "MCP Servers" },
          ]}
          tabValue={tabValue}
          onTabValueChange={setTabValue}
          anythingBoxProps={{
            placeholder: tabValue === "mcp_servers" ? "Search MCP servers" : "Search agent bricks",
            searchActions: [],
          }}
          chipsRowProps={
            tabValue === "agent_bricks"
              ? {
                  chips: [
                    { id: "owned_by_me", label: "Owned by me", applied: false },
                    { id: "agent_type", label: "Agent type", kind: "dropdown", applied: false },
                  ],
                  appliedCount: 0,
                  hasFiltersApplied: false,
                }
              : {
                  chips: [
                    { id: "server_type", label: "Server type", kind: "dropdown", applied: false },
                  ],
                  appliedCount: 0,
                  hasFiltersApplied: false,
                }
          }
        />
      </div>

      <div className="flex w-full flex-col gap-[40px]">
        {tabValue === "agent_bricks" ? (
          <>
            <Section title="Start something new" titleHref="/start-something-new">
              <TilesGrid tiles={startSomethingNewAgents} />
            </Section>

            <Section
              title="Agent Bricks"
              description={
                <span className="inline-flex flex-wrap items-center gap-xs">
                  <span>
                    Custom Code Agents will appear in this list only if their names start with the
                  </span>{" "}
                  <Tag>agent-</Tag>
                  <span>prefix.</span>
                </span>
              }
            >
              <div className="w-full overflow-hidden rounded-md bg-background-primary">
                <Table>
                  <TableRow state="Header">
                    <TableCell>
                      <TableCellContent type="Header">Name</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={10}>
                      <TableCellContent type="Header">Agent type</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={20}>
                      <TableCellContent type="Header">Endpoint</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={30}>
                      <TableCellContent type="Header">Last modified</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={0}>
                      <TableCellContent type="Actions" />
                    </TableCell>
                  </TableRow>

                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="block min-w-0 truncate text-paragraph font-medium leading-5 text-text-primary">
                          {r.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TableCellContent type="Text">{r.agentType}</TableCellContent>
                      </TableCell>
                      <TableCell>
                        <TableCellContent type="Text">{r.endpoint}</TableCellContent>
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
          </>
        ) : (
          <>
            <Section title="Discover">
              <div className="h-[160px] w-full rounded-md border border-dashed border-border bg-background-secondary" />
            </Section>

            <Section title="MCP Servers">
              <div className="w-full overflow-hidden rounded-md bg-background-primary">
                <Table>
                  <TableRow state="Header">
                    <TableCell>
                      <TableCellContent type="Header">Name</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={10}>
                      <TableCellContent type="Header">Server type</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={20}>
                      <TableCellContent type="Header">Status</TableCellContent>
                    </TableCell>
                    <TableCell data-collapse-priority={30}>
                      <TableCellContent type="Header">Created by</TableCellContent>
                    </TableCell>
                  </TableRow>

                  {mcpRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="block min-w-0 truncate text-paragraph font-medium leading-5 text-text-primary">
                          {r.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <TableCellContent type="Text">{r.serverType}</TableCellContent>
                      </TableCell>
                      <TableCell>
                        <div className="flex w-full min-w-0 items-center">
                          <Tag color="Lime">{r.status}</Tag>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TableCellContent type="Text">{r.createdBy}</TableCellContent>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </div>
            </Section>
          </>
        )}
      </div>
    </main>
  );
}

