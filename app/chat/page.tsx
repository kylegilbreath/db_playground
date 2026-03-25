"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Icon } from "@/components/icons";
import { IconButton } from "@/components/IconButton";
import { TextInput } from "@/components/TextInput";

import { useGenieChatState, GenieChatBody, GenieChatThreadList } from "@/components/GenieCodePanel/GenieChatCore";
import type { ReviewAsset } from "@/components/AgentChat";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const DEFAULT_NAV_WIDTH = 320;
const MIN_NAV_WIDTH = 160;
const MAX_NAV_WIDTH = 480;

const DEFAULT_PREVIEW_WIDTH = 340;
const MIN_PREVIEW_WIDTH = 240;
const MAX_PREVIEW_WIDTH = 600;

type SidePanel = "tools" | "connections";

// ---------------------------------------------------------------------------
// Toggle switch (inline, no external component needed)
// ---------------------------------------------------------------------------

function Tooltip({ label, children, align = "center" }: { label: string; children: React.ReactNode; align?: "center" | "left" | "right" }) {
  const posClass =
    align === "left" ? "left-0" :
    align === "right" ? "right-0" :
    "left-1/2 -translate-x-1/2";
  const caretClass =
    align === "left" ? "left-2" :
    align === "right" ? "right-2" :
    "left-1/2 -translate-x-1/2";
  return (
    <div className="group relative">
      {children}
      <div className={`pointer-events-none absolute top-full z-50 mt-1.5 whitespace-nowrap rounded bg-[#161616] px-2 py-1 text-hint text-white opacity-0 transition-opacity group-hover:opacity-100 ${posClass}`}>
        <span className={`absolute bottom-full border-4 border-transparent border-b-[#161616] ${caretClass}`} />
        {label}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-action-default-background-press" : "bg-background-tertiary",
      )}
    >
      <span
        className={cx(
          "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[16px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tools panel (MCP Servers)
// ---------------------------------------------------------------------------

const MCP_SERVERS = [
  {
    id: "uc-fn",
    name: "UC Function: chloe-chan.mcp-function-with-long-name",
    tools: 5,
    iconBg: "bg-[#f0f9f6]",
    icon: "AppsIcon",
  },
  {
    id: "gdrive",
    name: "Google Drive search",
    tools: 5,
    iconBg: "bg-[#f1f3f4]",
    icon: "driveIcon",
    iconIsImg: true,
  },
];

const SKILLS = [
  {
    id: "10x-engineer",
    name: "10x-engineer",
    description:
      "Opinionated workflow constraints for high-leverage engineering — plan-first execution, subagent strategy, self-improvement loops, and autonomous bug fixing.",
  },
  {
    id: "frontend-reviewer",
    name: "frontend-reviewer",
    description:
      "Deep frontend code review agent for React applications. Analyzes code for accessibility issues, performance problems, React anti-patterns, and security vulnerabilities. Returns structured feedback with P0/P1/P2 severity levels.",
  },
];

function ToolsPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      {/* Skills section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <span className="flex-1 text-paragraph font-semibold text-text-primary">Skills</span>
          <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>
            Add
          </DefaultButton>
        </div>
        <div className="flex flex-col gap-2 rounded-mid bg-background-secondary p-2">
          {SKILLS.map((skill, i) => (
            <React.Fragment key={skill.id}>
              {i > 0 && <div className="h-px w-full bg-border" />}
              <div className="flex flex-col gap-1">
                <p className="text-paragraph text-text-primary">{skill.name}</p>
                <p className="line-clamp-4 text-hint text-text-secondary">{skill.description}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-border" />

      {/* Instructions section */}
      <div className="flex flex-col gap-3">
        <span className="text-paragraph font-semibold text-text-primary">Instructions</span>

        {/* User instructions */}
        <div className="flex flex-col gap-2">
          <p className="text-paragraph text-text-primary">User instructions</p>
          <p className="text-hint text-text-secondary">
            Guidance lets you provide system-level instructions to the Assistant. It&apos;s a persistent way to share context, preferences, or preferred ways of authoring.
          </p>
          <div className="flex items-center gap-0">
            <TextInput
              defaultValue="/Users/kyle.gilbreath@..."
              disabled
              className="flex-1 rounded-r-none border-r-0 text-hint text-text-secondary"
            />
            <DefaultButton size="default" className="rounded-l-none border-l-0">
              Move
            </DefaultButton>
          </div>
          <PrimaryButton size="default" leadingIcon={<Icon name="ArrowInIcon" size={14} />}>
            Open instructions file
          </PrimaryButton>
          <p className="text-hint text-text-secondary">
            The fastest way to add instructions is to start your input with the{" "}
            <span className="font-semibold text-text-primary">#</span> character, or with{" "}
            <span className="font-semibold text-text-primary">/addInstruction</span>
          </p>
        </div>

        {/* Workspace instructions */}
        <div className="flex flex-col gap-2">
          <p className="text-paragraph text-text-primary">Workspace instructions</p>
          <p className="text-hint text-text-secondary">
            Workspace guidance is configured by your workspace admin and provides more context to the Assistant to help it follow guidelines and operate more efficiently in your workspace.{" "}
            <span className="cursor-pointer text-action-default-text hover:underline">Learn more</span>
          </p>
          <DefaultButton size="small" leadingIcon={<Icon name="ArrowInIcon" size={12} />}>
            View file
          </DefaultButton>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connections panel (contains MCP Servers)
// ---------------------------------------------------------------------------

function ConnectionsPanel() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(
    Object.fromEntries(MCP_SERVERS.map((s) => [s.id, true])),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Section header */}
      <div className="flex items-center gap-sm px-3 py-2">
        <span className="flex-1 text-paragraph font-semibold text-text-primary">MCP Servers</span>
        <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>
          Add
        </DefaultButton>
      </div>

      {/* Server list */}
      <div className="flex flex-col gap-3 px-3 pb-3">
        {MCP_SERVERS.map((server) => (
          <div key={server.id} className="flex items-center gap-sm">
            {/* Icon */}
            <div className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded", server.iconBg)}>
              <Icon name="AppsIcon" size={14} className="text-text-secondary" />
            </div>
            {/* Name + tools count */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-paragraph text-text-primary">{server.name}</p>
              <p className="text-hint text-action-default-text">{server.tools} tools enabled</p>
            </div>
            {/* Toggle */}
            <Toggle
              checked={enabled[server.id] ?? true}
              onChange={(v) => setEnabled((prev) => ({ ...prev, [server.id]: v }))}
            />
            {/* Overflow */}
            <IconButton
              aria-label="More"
              icon={<Icon name="overflowIcon" size={14} />}
              size="small"
              tone="neutral"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left nav
// ---------------------------------------------------------------------------

function ChatLeftNav({
  threads,
  activeThreadId,
  onSelect,
  onNewChat,
  collapsed,
  onCollapsedChange,
}: {
  threads: ReturnType<typeof useGenieChatState>["threads"];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}) {
  const setCollapsed = onCollapsedChange;
  const [activePanel, setActivePanel] = React.useState<SidePanel | null>(null);
  const [width, setWidth] = React.useState(DEFAULT_NAV_WIDTH);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startWidth = React.useRef(DEFAULT_NAV_WIDTH);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    const onMouseMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      const next = Math.min(MAX_NAV_WIDTH, Math.max(MIN_NAV_WIDTH, startWidth.current + mv.clientX - startX.current));
      setWidth(next);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  const togglePanel = (panel: SidePanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  if (collapsed) {
    return (
      <div className="flex h-full w-9 shrink-0 flex-col items-center border-r border-border py-2">
        <Tooltip label="Open sidebar" align="left">
          <IconButton
            aria-label="Expand thread panel"
            icon={<Icon name="sidebarClosedIcon" size={16} />}
            size="small"
            tone="neutral"
            onClick={() => setCollapsed(false)}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative flex h-full shrink-0 flex-col border-r border-border" style={{ width }}>
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center gap-xs px-3">
        <Tooltip label="Close sidebar" align="left">
          <IconButton
            aria-label="Collapse thread panel"
            icon={<Icon name="sidebarOpenIcon" size={16} />}
            size="small"
            tone="neutral"
            onClick={() => setCollapsed(true)}
          />
        </Tooltip>
        <span className="flex-1 text-paragraph font-medium text-text-primary">Genie Chat</span>
        <Tooltip label="Tools" align="right">
          <IconButton
            aria-label="Tools"
            icon={<Icon name="WrenchIcon" size={14} />}
            size="small"
            tone="neutral"
            className={cx(activePanel === "tools" && "!bg-background-tertiary text-text-primary")}
            onClick={() => togglePanel("tools")}
          />
        </Tooltip>
        <Tooltip label="Connections" align="right">
          <IconButton
            aria-label="Connections"
            icon={<Icon name="plugIcon" size={14} />}
            size="small"
            tone="neutral"
            className={cx(activePanel === "connections" && "!bg-background-tertiary text-text-primary")}
            onClick={() => togglePanel("connections")}
          />
        </Tooltip>
      </div>

      {activePanel === "tools" ? (
        <ToolsPanel />
      ) : activePanel === "connections" ? (
        <ConnectionsPanel />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          {/* Quick actions */}
          <div className="flex flex-col px-2 pt-1">
            <button
              type="button"
              onClick={onNewChat}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-paragraph text-text-primary hover:bg-background-secondary"
            >
              <Icon name="newThreadIcon" size={14} className="shrink-0 text-text-secondary" />
              New chat
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-paragraph text-text-secondary hover:bg-background-secondary"
            >
              <Icon name="searchIcon" size={14} className="shrink-0" />
              Search chats
            </button>
          </div>

          {/* Thread list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <GenieChatThreadList threads={threads} activeThreadId={activeThreadId} onSelect={onSelect} />
          </div>
        </div>
      )}

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-action-default-border-hover active:bg-action-default-border-hover"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview panel empty state graphic
// ---------------------------------------------------------------------------

function EmptyChartGraphic() {
  return (
    <div className="flex items-center justify-center p-6">
      {/* 144×105 chart container — matches Figma emptyDashboardGraphic */}
      <div className="relative h-[105px] w-[144px] shrink-0 overflow-hidden rounded-md border border-[#d8d8d8] bg-white">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 144 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden
        >
          {/* Back area fill (Vector 5781) — positioned ml-8.22 mt-52 within 144×105 */}
          <g transform="translate(8.22, 52)">
            <path
              d="M7.756 23.821L3.041 20.946C1.708 20.134 0 21.093 0 22.654V40.603C0 41.708 0.895 42.603 2 42.603H123.928C125.033 42.603 125.928 41.708 125.928 40.603V15.396C125.928 14.951 125.78 14.52 125.508 14.169L119.867 6.909C119.066 5.879 117.509 5.879 116.708 6.909L113.86 10.574L108.674 17.716C108.098 18.509 107.031 18.768 106.155 18.326L99.453 14.943C99.15 14.79 98.89 14.563 98.7 14.282L91.784 4.098C91.565 3.775 91.256 3.524 90.896 3.374L83.131 0.153C82.08 -0.283 80.877 0.245 80.486 1.314L74.096 18.805C73.528 20.36 71.423 20.591 70.532 19.195L66.867 13.455C66.499 12.88 65.864 12.531 65.181 12.531H55.445C54.78 12.531 54.158 12.862 53.786 13.413L51.354 17.021C50.638 18.083 49.121 18.208 48.242 17.276L45.236 14.094C44.438 13.25 43.092 13.26 42.307 14.115L35.434 21.612C34.918 22.175 34.126 22.394 33.394 22.178L24.577 19.575C23.635 19.297 22.629 19.741 22.165 20.607C20.761 23.223 17.706 28.374 15.102 29.013C12.8 29.579 9.233 25.441 8.301 24.3C8.146 24.11 7.965 23.948 7.756 23.821Z"
              fill="#F7F7F7"
            />
          </g>

          {/* Front line stroke (Vector 5785) — positioned ml-10 mt-22.72 */}
          <g transform="translate(10, 22.72)">
            <path
              d="M0.354 35.032L11.518 46.196C12.159 46.837 13.149 46.967 13.933 46.514L33.104 35.446C33.563 35.181 34.109 35.109 34.621 35.246L42.7 37.411C43.451 37.612 44.251 37.359 44.75 36.763L52.747 27.217C53.535 26.275 54.977 26.26 55.785 27.184L58.294 30.054C59.197 31.086 60.847 30.925 61.532 29.737L77.835 1.5C78.605 0.167 80.529 0.167 81.299 1.5L89.13 15.063C89.682 16.02 90.905 16.347 91.862 15.795L94.854 14.068C95.81 13.515 97.033 13.843 97.586 14.8L105.875 29.158C106.645 30.491 108.57 30.491 109.34 29.158L115.174 19.052C115.832 17.913 117.39 17.708 118.32 18.638L125.107 25.425"
              stroke="#CBCBCB"
              strokeWidth="1"
            />
          </g>

          {/* Back line stroke (Vector 5782) — positioned ml-8.22 mt-52 */}
          <g transform="translate(8.22, 52)">
            <path
              d="M0.26 19.593L8.196 24.431C8.287 24.486 8.373 24.548 8.454 24.617L13.708 29.101C14.598 29.861 15.948 29.698 16.631 28.747L22.369 20.754C22.867 20.059 23.752 19.758 24.571 20.005L33.644 22.74C34.382 22.962 35.181 22.741 35.7 22.171L42.568 14.627C43.352 13.766 44.702 13.753 45.501 14.6L48.502 17.777C49.382 18.708 50.898 18.584 51.614 17.521L54.047 13.914C54.418 13.362 55.04 13.032 55.705 13.032H65.441C66.124 13.032 66.76 13.38 67.127 13.955L70.792 19.695C71.684 21.091 73.788 20.861 74.357 19.305L80.746 1.814C81.137 0.745 82.34 0.217 83.391 0.653L91.156 3.874C91.516 4.024 91.825 4.275 92.044 4.598L98.96 14.782C99.151 15.063 99.41 15.291 99.713 15.444L106.415 18.826C107.291 19.268 108.358 19.009 108.935 18.216L114.121 11.074L116.968 7.409C117.769 6.379 119.326 6.379 120.127 7.409L126.188 15.21"
              stroke="#525252"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </g>

          {/* Dashed vertical line + dots (Vertical Line) — at x=88+8.22=96.22, from mt-23.75 to mt-23.75+32 */}
          <line
            x1="96.5"
            y1="23.75"
            x2="96.5"
            y2="55.75"
            stroke="#A2A2A2"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          {/* Top dot */}
          <circle cx="96.5" cy="26.25" r="2" fill="#F7F7F7" stroke="#A2A2A2" strokeWidth="1" />
          {/* Bottom dot */}
          <circle cx="96.5" cy="53.25" r="2" fill="#F7F7F7" stroke="#A2A2A2" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Python file preview
// ---------------------------------------------------------------------------

const PYTHON_FILE_LINES = [
  "import pandas as pd",
  "import matplotlib.pyplot as plt",
  "from pyspark.sql import SparkSession",
  "",
  "spark = SparkSession.builder.getOrCreate()",
  "",
  "# Load ski resort data",
  "df = spark.table('wbschema1.ski_resorts').toPandas()",
  "",
  "# Basic EDA",
  "print(df.shape)",
  "print(df.dtypes)",
  "print(df.describe())",
  "",
  "# Price distribution by country",
  "price_by_country = (",
  "    df.groupby('country')['price_per_night']",
  "    .agg(['mean', 'median', 'std'])",
  "    .sort_values('mean', ascending=False)",
  ")",
  "print(price_by_country)",
  "",
  "# Plot",
  "fig, ax = plt.subplots(figsize=(10, 5))",
  "price_by_country['mean'].plot(kind='bar', ax=ax)",
  "ax.set_title('Average Price per Night by Country')",
  "ax.set_ylabel('USD')",
  "plt.tight_layout()",
  "plt.show()",
];

function PythonFilePreview({ asset }: { asset: ReviewAsset }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-hint text-text-secondary">{asset.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DefaultButton size="small" leadingIcon={<Icon name="playIcon" size={12} />}>Run</DefaultButton>
          <PrimaryButton size="small">Save</PrimaryButton>
        </div>
      </div>
      {/* Code */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-background-primary p-4 font-mono text-[12px] leading-5">
        {PYTHON_FILE_LINES.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="w-6 shrink-0 select-none text-right text-text-secondary opacity-40">{i + 1}</span>
            <span className={cx(
              "min-w-0 flex-1 whitespace-pre text-text-primary",
              line.startsWith("#") && "text-text-secondary",
              (line.startsWith("import") || line.startsWith("from")) && "text-[#7c3aed]",
              line === "" && "opacity-0",
            )}>{line || "\u00a0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notebook preview
// ---------------------------------------------------------------------------


function NotebookPreview({ asset }: { asset: ReviewAsset }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Notebook toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={14} />} size="small" tone="neutral" />
          <IconButton aria-label="Favorite" icon={<Icon name="starIcon" size={14} />} size="small" tone="neutral" />
          <span className="text-hint text-text-secondary">Python</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DefaultButton size="small" leadingIcon={<Icon name="playIcon" size={12} />}>Run all</DefaultButton>
          <DefaultButton size="small">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-500" />
              Serverless
              <Icon name="chevronDownIcon" size={10} />
            </span>
          </DefaultButton>
          <DefaultButton size="small">Schedule</DefaultButton>
          <PrimaryButton size="small">Share</PrimaryButton>
        </div>
      </div>

      {/* Cells */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {/* Text cell */}
          <div className="shrink-0 rounded-md border border-border bg-background-primary p-4">
          <p className="mb-2 text-[15px] font-semibold leading-6 text-text-primary">{asset.name} - Last 3 Months</p>
          <p className="mb-2 text-paragraph text-text-secondary">This notebook analyzes Databricks Assistant usage metrics including:</p>
          <ul className="mb-2 flex flex-col gap-0.5 pl-4 text-paragraph text-text-secondary">
            <li>Daily Active Users (DAU) and Weekly Active Users (WAU)</li>
            <li>Engagement metrics (code adoption, feedback, modality usage)</li>
            <li>Workspace adoption trends</li>
            <li>User retention patterns</li>
          </ul>
          <p className="text-paragraph text-text-secondary">
            <span className="font-semibold text-text-primary">Data Sources: </span>
            <code className="rounded bg-background-secondary px-1 text-hint">`main.metric_store.fct_assistant_chat_window_interactions`</code>
            {" - Chat window interactions"}
          </p>
        </div>

          {/* Code cell */}
          <div className="shrink-0 overflow-hidden rounded-md border border-border bg-background-primary">
          {/* Cell toolbar */}
          <div className="flex h-8 items-center gap-2 border-b border-border px-2">
            <IconButton aria-label="Run" icon={<Icon name="playIcon" size={12} />} size="small" tone="neutral" className="text-green-600" />
            <span className="text-hint text-text-secondary">✓ Just now (1s)</span>
            <div className="flex-1" />
            <span className="rounded bg-background-secondary px-1.5 py-0.5 text-hint font-medium text-text-secondary">SQL</span>
            <IconButton aria-label="AI" icon={<Icon name="SparkleIcon" size={12} />} size="small" tone="neutral" />
            <IconButton aria-label="Expand" icon={<Icon name="fullscreenIcon" size={12} />} size="small" tone="neutral" />
            <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={12} />} size="small" tone="neutral" />
            <IconButton aria-label="Delete" icon={<Icon name="closeIcon" size={12} />} size="small" tone="neutral" />
          </div>
          {/* Code content */}
          <div className="overflow-hidden p-3 font-mono text-[12px] leading-5">
            {[
              "%sql",
              "-- Use the specified catalog",
              "USE CATALOG `wanderbricks-bugbash-1`;",
              "",
              "-- Select the top countries and average number of bedrooms",
              "WITH CountryStats AS (",
              "    SELECT",
              "        country,",
              "        COUNT(*) AS property_count,",
              "        AVG(bedrooms) AS avg_bedrooms",
              "    FROM `wbschema1`.`properties`",
              "    GROUP BY country",
              "    ORDER BY property_count DESC",
              "    LIMIT 10",
              ")",
              "",
              "-- Compare these stats to the overall properties list",
              "SELECT",
              "    cs.country,",
              "    cs.property_count,",
              "    cs.avg_bedrooms,",
              "    overall.avg_bedrooms AS overall_avg_bedrooms",
              "FROM CountryStats cs",
              "CROSS JOIN (",
              "    SELECT AVG(bedrooms) AS avg_bedrooms",
            ].map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-6 shrink-0 select-none text-right text-text-secondary opacity-40">{line ? i + 1 : ""}</span>
                <span className={cx(
                  "min-w-0 flex-1 whitespace-pre-wrap break-all text-text-primary",
                  line.startsWith("--") && "text-text-secondary",
                  line.startsWith("%") && "text-[#7c3aed]",
                )}>{line || "\u00a0"}</span>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard preview
// ---------------------------------------------------------------------------

function DashboardPreview() {
  const PlaceholderBlock = ({ className = "" }: { className?: string }) => (
    <div className={`shrink-0 rounded-lg bg-[#f6f7f9] ${className}`} />
  );

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 pb-20">
        <div className="flex flex-col gap-4">
          {/* Row 1: full-width */}
          <PlaceholderBlock className="h-[180px] w-full" />
          {/* Row 2: two equal columns */}
          <div className="flex gap-4">
            <PlaceholderBlock className="h-[180px] flex-1" />
            <PlaceholderBlock className="h-[180px] flex-1" />
          </div>
          {/* Row 3: full-width */}
          <PlaceholderBlock className="h-[180px] w-full" />
          {/* Row 4: three equal columns */}
          <div className="flex gap-4">
            <PlaceholderBlock className="h-[180px] flex-1" />
            <PlaceholderBlock className="h-[180px] flex-1" />
            <PlaceholderBlock className="h-[180px] flex-1" />
          </div>
        </div>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab — diff view
// ---------------------------------------------------------------------------

// Fake diff lines per file for visual fidelity
const FAKE_DIFF: Record<string, Array<{ kind: "add" | "remove" | "context"; text: string }>> = {
  notebook: [
    { kind: "context", text: "import pandas as pd" },
    { kind: "context", text: "import matplotlib.pyplot as plt" },
    { kind: "add",     text: "+ df = spark.sql('SELECT * FROM ski_resorts').toPandas()" },
    { kind: "remove",  text: "- df = pd.read_csv('ski_resorts.csv')" },
    { kind: "context", text: "" },
    { kind: "context", text: "# Booking status breakdown" },
    { kind: "add",     text: "+ status_counts = df.groupby('status').agg({'booking_id': 'count', 'total_price': 'sum'})" },
    { kind: "add",     text: "+ status_counts.columns = ['count', 'revenue']" },
    { kind: "context", text: "print(status_counts)" },
  ],
  file: [
    { kind: "context", text: "def run_eda(spark):" },
    { kind: "add",     text: '    """Run full EDA pipeline on ski_resort data."""' },
    { kind: "context", text: "    df = spark.table('ski_resorts')" },
    { kind: "add",     text: "    df = df.withColumn('avg_price', F.col('total_price') / F.col('guests'))" },
    { kind: "remove",  text: "-   df = df.cache()" },
    { kind: "context", text: "    return df" },
  ],
};

function FileDiffSection({
  asset,
  onAccept,
  onReject,
}: {
  asset: ReviewAsset;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = React.useState(true);
  const [status, setStatus] = React.useState<"pending" | "accepted" | "rejected">("pending");

  const lines = FAKE_DIFF[asset.kind] ?? FAKE_DIFF.file;
  const addCount = lines.filter((l) => l.kind === "add").length;
  const removeCount = lines.filter((l) => l.kind === "remove").length;

  const handleAccept = () => { setStatus("accepted"); onAccept(); };
  const handleReject = () => { setStatus("rejected"); onReject(); };

  return (
    <div className={cx(
      "overflow-hidden rounded-md border",
      status === "accepted" ? "border-green-200 bg-green-50/30" :
      status === "rejected" ? "border-border opacity-50" :
      "border-border bg-background-primary",
    )}>
      {/* File header */}
      <div className="flex items-center gap-2 border-b border-border bg-background-secondary px-3 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 items-center text-text-secondary hover:text-text-primary"
        >
          <Icon name={open ? "chevronDownIcon" : "chevronRightIcon"} size={12} />
        </button>
        <Icon
          name={asset.kind === "notebook" ? "notebookIcon" : "fileCodeIcon"}
          size={14}
          className="shrink-0 text-text-secondary"
        />
        <span className="min-w-0 flex-1 truncate font-mono text-hint text-text-primary">{asset.name}</span>
        <span className="shrink-0 font-mono text-hint text-green-600">+{addCount}</span>
        <span className="shrink-0 font-mono text-hint text-red-500">-{removeCount}</span>
        {status === "pending" ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Reject file"
              onClick={handleReject}
              className="flex h-5 w-5 items-center justify-center rounded text-text-secondary hover:bg-background-tertiary hover:text-red-500"
            >
              <Icon name="closeIcon" size={12} />
            </button>
            <button
              type="button"
              aria-label="Accept file"
              onClick={handleAccept}
              className="flex h-5 w-5 items-center justify-center rounded text-text-secondary hover:bg-background-tertiary hover:text-green-600"
            >
              <Icon name="checkIcon" size={12} />
            </button>
          </div>
        ) : (
          <span className={cx(
            "shrink-0 text-hint font-medium",
            status === "accepted" ? "text-green-600" : "text-text-secondary line-through",
          )}>
            {status === "accepted" ? "Accepted" : "Rejected"}
          </span>
        )}
      </div>

      {/* Diff lines */}
      {open && (
        <div className="overflow-x-auto">
          {lines.map((line, i) => (
            <div
              key={i}
              className={cx(
                "flex gap-3 px-3 py-px font-mono text-hint leading-5",
                line.kind === "add" && "bg-green-50 text-green-800",
                line.kind === "remove" && "bg-red-50 text-red-700 line-through",
                line.kind === "context" && "text-text-secondary",
              )}
            >
              <span className={cx(
                "w-3 shrink-0 select-none",
                line.kind === "add" && "text-green-500",
                line.kind === "remove" && "text-red-400",
              )}>
                {line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " "}
              </span>
              <span className="whitespace-pre">{line.text.replace(/^[+-] /, "")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewDiffPanel({ assets }: { assets: ReviewAsset[] }) {
  const [statuses, setStatuses] = React.useState<Record<string, "pending" | "accepted" | "rejected">>(
    Object.fromEntries(assets.map((a) => [a.id, "pending"])),
  );

  const pending = assets.filter((a) => statuses[a.id] === "pending");
  const allDone = pending.length === 0;

  const acceptAll = () => setStatuses(Object.fromEntries(assets.map((a) => [a.id, "accepted"])));
  const rejectAll = () => setStatuses(Object.fromEntries(assets.map((a) => [a.id, "rejected"])));

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-background-primary">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <span className="flex-1 text-paragraph font-medium text-text-primary">
          {allDone ? "All changes reviewed" : `${pending.length} file${pending.length !== 1 ? "s" : ""} to review`}
        </span>
        {!allDone && (
          <div className="flex items-center gap-xs">
            <DefaultButton size="small" onClick={rejectAll}>Reject all</DefaultButton>
            <PrimaryButton size="small" onClick={acceptAll}>Accept all</PrimaryButton>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2 p-3">
          {assets.map((asset) => (
            <FileDiffSection
              key={asset.id}
              asset={asset}
              onAccept={() => setStatuses((s) => ({ ...s, [asset.id]: "accepted" }))}
              onReject={() => setStatuses((s) => ({ ...s, [asset.id]: "rejected" }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review tab empty state
// ---------------------------------------------------------------------------

function MissingBranchGraphic() {
  return (
    <div className="flex items-center justify-center p-6">
      <svg width="80" height="96" viewBox="0 0 80 96" fill="none" aria-hidden>
        {/* Main trunk — vertical line */}
        <line x1="20" y1="16" x2="20" y2="80" stroke="#cbcbcb" strokeWidth="2" strokeLinecap="round" />
        {/* Branch curve up to right */}
        <path d="M 20 32 C 20 50, 60 50, 60 32" stroke="#cbcbcb" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Bottom commit node */}
        <circle cx="20" cy="80" r="5" fill="white" stroke="#cbcbcb" strokeWidth="2" />
        {/* Middle commit node on trunk */}
        <circle cx="20" cy="52" r="5" fill="white" stroke="#cbcbcb" strokeWidth="2" />
        {/* Top commit node on trunk */}
        <circle cx="20" cy="16" r="5" fill="white" stroke="#cbcbcb" strokeWidth="2" />
        {/* Branch tip node — red X instead of commit */}
        <circle cx="60" cy="32" r="7" fill="#fff5f5" stroke="#fed7d7" strokeWidth="1.5" />
        <line x1="56.5" y1="28.5" x2="63.5" y2="35.5" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="63.5" y1="28.5" x2="56.5" y2="35.5" stroke="#e53e3e" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview panel
// ---------------------------------------------------------------------------

type PreviewTab = "Assets" | "Review";

function PreviewPanel({
  onClose,
  selectedAsset,
  activeThreadId,
  initialWidth = DEFAULT_PREVIEW_WIDTH,
  reviewAssets,
}: {
  onClose: () => void;
  selectedAsset: ReviewAsset | null;
  activeThreadId: string | null;
  initialWidth?: number;
  reviewAssets?: ReviewAsset[];
}) {
  const [activeTab, setActiveTab] = React.useState<PreviewTab>("Assets");
  // Multi-tab asset state
  const prevThreadId = React.useRef(activeThreadId);
  const [openAssets, setOpenAssets] = React.useState<ReviewAsset[]>(selectedAsset ? [selectedAsset] : []);
  const [activeAssetId, setActiveAssetId] = React.useState<string | null>(selectedAsset?.id ?? null);

  // Reset when thread changes
  React.useEffect(() => {
    if (activeThreadId !== prevThreadId.current) {
      prevThreadId.current = activeThreadId;
      setOpenAssets([]);
      setActiveAssetId(null);
    }
  }, [activeThreadId]);

  // Open or switch to asset tab when selectedAsset changes
  React.useEffect(() => {
    if (!selectedAsset) return;
    setOpenAssets((prev) => {
      if (prev.find((a) => a.id === selectedAsset.id)) return prev;
      return [...prev, selectedAsset];
    });
    setActiveAssetId(selectedAsset.id);
  }, [selectedAsset]);

  const activeAsset = openAssets.find((a) => a.id === activeAssetId) ?? null;

  const closeAssetTab = (id: string) => {
    setOpenAssets((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (activeAssetId === id) {
        setActiveAssetId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  };
  const [width, setWidth] = React.useState(initialWidth);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startWidth = React.useRef(initialWidth);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    const onMouseMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      // Dragging left increases width (panel is on the right)
      const next = Math.min(MAX_PREVIEW_WIDTH, Math.max(MIN_PREVIEW_WIDTH, startWidth.current - (mv.clientX - startX.current)));
      setWidth(next);
    };
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  return (
    <div className="relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-background-primary" style={{ width }}>
      {/* Drag handle on left edge */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-action-default-border-hover active:bg-action-default-border-hover"
      />
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center gap-xs pr-3">
        {/* Tabs */}
        <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
          {(["Assets", "Review"] as PreviewTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cx(
                "flex h-7 shrink-0 items-center justify-center rounded-md px-3 text-paragraph",
                activeTab === tab
                  ? "bg-background-secondary text-text-primary"
                  : "text-text-secondary hover:bg-background-secondary",
              )}
            >
              {tab}
            </button>
          ))}
          {/* Fade-out mask */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-background-primary" />
        </div>
        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-xs">
          <IconButton
            aria-label="Status"
            icon={<span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />}
            size="small"
            tone="neutral"
          />
          <IconButton
            aria-label="More options"
            icon={<Icon name="overflowIcon" size={14} />}
            size="small"
            tone="neutral"
          />
          <IconButton
            aria-label="Close preview panel"
            icon={
              <span className="inline-flex rotate-180">
                <Icon name="sidebarOpenIcon" size={16} />
              </span>
            }
            size="small"
            tone="neutral"
            className="!bg-background-tertiary"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Pane */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-3 pr-3">
        {activeTab === "Review" ? (
          reviewAssets && reviewAssets.length > 0 ? (
            <ReviewDiffPanel key={activeThreadId ?? "review"} assets={reviewAssets} />
          ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-clip rounded-md border border-border bg-background-primary">
            <MissingBranchGraphic />
            <div className="flex flex-col items-center gap-2 px-6 pb-6 text-center">
              <p className="text-[18px] font-semibold leading-6 text-text-primary">
                No changes to display
              </p>
              <p className="text-paragraph text-text-secondary">
                All the changes made by a thread will display here
              </p>
            </div>
          </div>
          )
        ) : activeTab === "Assets" && openAssets.length > 0 ? (
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-md border border-border bg-background-primary">
            {/* Figma-style soft tab bar */}
            <div className="flex h-8 shrink-0 items-center overflow-x-auto bg-background-secondary pr-1">
              {openAssets.map((asset) => {
                const isActive = asset.id === activeAssetId;
                const iconName = asset.kind === "notebook" ? "notebookIcon" : asset.kind === "dashboard" ? "dashboardIcon" : "fileCodeIcon";
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setActiveAssetId(asset.id)}
                    className={cx(
                      "flex h-full shrink-0 items-center gap-1 border-r border-border px-1 text-paragraph",
                      isActive ? "bg-background-primary text-text-primary" : "text-text-secondary hover:bg-background-tertiary",
                    )}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                      <Icon name={iconName} size={14} className="text-text-secondary" />
                    </div>
                    <span className="max-w-[140px] truncate">{asset.name}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label="Close tab"
                      onClick={(e) => { e.stopPropagation(); closeAssetTab(asset.id); }}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); closeAssetTab(asset.id); } }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                    >
                      <Icon name="closeIcon" size={10} />
                    </span>
                  </button>
                );
              })}
              {/* Add tab */}
              <button
                type="button"
                aria-label="New tab"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary"
              >
                <Icon name="plusIcon" size={14} />
              </button>
            </div>
            {activeAsset?.kind === "dashboard" ? (
              <DashboardPreview />
            ) : activeAsset?.kind === "file" ? (
              <PythonFilePreview asset={activeAsset} />
            ) : activeAsset ? (
              <NotebookPreview asset={activeAsset} />
            ) : null}
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col items-center justify-center overflow-clip rounded-md border border-border bg-background-primary">
            <EmptyChartGraphic />
            <div className="flex flex-col items-center gap-2 px-6 pb-6 text-center">
              <p className="text-[18px] font-semibold leading-6 text-text-primary">
                Inspect the assets Genie Code interacts with
              </p>
              <p className="text-paragraph text-text-secondary">
                View all the assets Genie Code generates or uses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChatPage — full-screen Genie Code
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useGenieChatState();
  const [navCollapsed, setNavCollapsed] = React.useState(false);

  const initialPrompt = searchParams.get("prompt");
  const handleSubmitRef = React.useRef(state.handleSubmit);
  handleSubmitRef.current = state.handleSubmit;
  React.useEffect(() => {
    if (!initialPrompt) return;
    const t = setTimeout(() => handleSubmitRef.current(initialPrompt, "ski"), 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<ReviewAsset | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [initialPreviewWidth, setInitialPreviewWidth] = React.useState(DEFAULT_PREVIEW_WIDTH);

  const reviewAssets = React.useMemo(() => {
    if (state.runStatus !== "done") return undefined;
    const summary = state.steps.find((s) => s.type === "assets-summary") as { assets: ReviewAsset[] } | undefined;
    return summary?.assets;
  }, [state.steps, state.runStatus]);

  const handleAssetClick = React.useCallback((asset: ReviewAsset) => {
    setSelectedAsset(asset);
    if (containerRef.current) {
      setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
    }
    setPreviewOpen(true);
  }, []);

  const handleTogglePreview = React.useCallback(() => {
    if (!previewOpen && containerRef.current) {
      setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
    }
    setPreviewOpen((v) => !v);
  }, [previewOpen]);

  return (
    <main className="relative flex h-full min-h-0 w-full p-0">
      <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden rounded-md">
        <ChatLeftNav
          threads={state.threads}
          activeThreadId={state.activeThreadId}
          onSelect={state.handleSelectThread}
          onNewChat={state.handleNewChat}
          collapsed={navCollapsed}
          onCollapsedChange={setNavCollapsed}
        />

        <GenieChatBody
          state={state}
          size="full"
          hideThreadToggle
          onToggleNav={handleTogglePreview}
          previewOpen={previewOpen}
          onAssetClick={handleAssetClick}
          onFullScreen={() => { sessionStorage.setItem("openGeniePanel", "1"); router.back(); }}
        />

        {previewOpen && (
          <PreviewPanel
            onClose={() => setPreviewOpen(false)}
            selectedAsset={selectedAsset}
            activeThreadId={state.activeThreadId}
            initialWidth={initialPreviewWidth}
            reviewAssets={reviewAssets}
          />
        )}
      </div>
    </main>
  );
}
