"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

type JobType = "Job" | "Pipeline - ETL";
type HealthStatus = "Healthy" | "Unhealthy" | null;
type TriggerStatus = "Scheduled" | "Paused - Sch..." | null;
type RunStatus = "success" | "failed" | "cancelled" | "running" | null;

type Job = {
  id: string;
  name: string;
  type: JobType;
  runAs: string;
  trigger: TriggerStatus;
  health: HealthStatus;
  recentRuns: RunStatus[];
};

const JOBS: Job[] = [
  { id: "j1", name: "[DEMO-Pipeline]prod_sales_o...", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j2", name: "agentic ux workshop demo", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j3", name: "AI_function demo", type: "Job", runAs: "Kyle Gilbreath", trigger: "Scheduled", health: "Healthy", recentRuns: ["success", "success", "success", "failed", "running"] },
  { id: "j4", name: "Another Lakebuilder test", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j5", name: "Another New NEw New NEW N...", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j6", name: "Another title", type: "Job", runAs: "Kyle Gilbreath", trigger: "Scheduled", health: "Unhealthy", recentRuns: ["failed", "failed", "failed", "cancelled", "running"] },
  { id: "j7", name: "Another title", type: "Job", runAs: "Kyle Gilbreath", trigger: "Scheduled", health: null, recentRuns: [null, null, null, null, "cancelled"] },
  { id: "j8", name: "another-pipeline", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j9", name: "Basic Python Output Demonstr...", type: "Job", runAs: "Kyle Gilbreath", trigger: "Paused - Sch...", health: null, recentRuns: [null, null, null, null, null] },
  { id: "j10", name: "Craigslist Vehicles Medallion Pi...", type: "Pipeline - ETL", runAs: "Kyle Gilbreath", trigger: null, health: null, recentRuns: [null, null, null, null, null] },
  { id: "j11", name: "CUJ10 Notebook Manager Cod...", type: "Job", runAs: "Kyle Gilbreath", trigger: "Scheduled", health: "Unhealthy", recentRuns: ["failed", "failed", "failed", "cancelled", "running"] },
  { id: "j12", name: "Demo notebook 2024-09-11 11...", type: "Job", runAs: "Kyle Gilbreath", trigger: "Paused - Sch...", health: null, recentRuns: [null, null, null, null, null] },
];

function RunDot({ status }: { status: RunStatus }) {
  if (!status) return <span className="inline-block h-1.5 w-4 rounded-full bg-border" />;
  const colors: Record<NonNullable<RunStatus>, string> = {
    success: "bg-green-500",
    failed: "bg-red-500",
    cancelled: "bg-red-400",
    running: "bg-blue-400",
  };
  return <span className={cx("inline-block h-4 w-4 rounded-full border-2 border-background-primary", colors[status])} />;
}

function HealthBadge({ health }: { health: HealthStatus }) {
  if (!health) return null;
  return (
    <span className={cx("text-hint font-medium", health === "Healthy" ? "text-green-600" : "text-red-600")}>
      {health}
    </span>
  );
}

type Tab = "jobs" | "runs" | "zeroops";

export default function WorkflowsPage() {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("jobs");
  const [filterTab, setFilterTab] = React.useState<"all" | "jobs" | "pipelines" | "system" | "owned" | "accessible" | "favorites">("all");
  const [createOpen, setCreateOpen] = React.useState(false);

  const FILTER_TABS = [
    { id: "all", label: "All" },
    { id: "jobs", label: "Jobs" },
    { id: "pipelines", label: "Pipelines" },
    { id: "system", label: "System Managed" },
    { id: "owned", label: "Owned by me" },
    { id: "accessible", label: "Accessible by me" },
    { id: "favorites", label: "Favorites" },
  ] as const;

  const filteredJobs = JOBS.filter((j) => {
    if (filterTab === "jobs") return j.type === "Job";
    if (filterTab === "pipelines") return j.type === "Pipeline - ETL";
    return true;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-background-primary">
      <div className="mx-auto w-full max-w-[1200px] px-8 py-6">

        {/* Page title */}
        <h1 className="mb-4 text-title2 font-semibold text-text-primary">Jobs & Pipelines</h1>

        {/* Top tabs */}
        <div className="mb-6 flex items-center justify-between border-b border-border">
          <div className="flex">
            {([
              { id: "jobs", label: "Jobs & pipelines" },
              { id: "runs", label: "Runs" },
              { id: "zeroops", label: "Genie ZeroOps" },
            ] as { id: Tab; label: string }[]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cx(
                  "px-4 pb-3 text-paragraph transition-colors",
                  tab === t.id
                    ? "border-b-2 border-blue-600 font-medium text-text-primary"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create new section */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setCreateOpen((v) => !v)}
            className="mb-3 flex items-center gap-xs text-paragraph font-medium text-text-primary"
          >
            <Icon name={createOpen ? "chevronDownIcon" : "chevronRightIcon"} size={14} className="text-text-secondary" />
            Create new
          </button>
          {createOpen && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "PipelineCodeIcon", title: "Ingestion pipeline", desc: "Ingest data from apps, databases and files" },
                { icon: "FilePipelineIcon", title: "ETL pipeline", desc: "Build ETL pipelines using SQL and Python" },
                { icon: "WorkflowsIcon", title: "Job", desc: "Orchestrate notebooks, pipelines, queries and more" },
              ].map(({ icon, title, desc }) => (
                <button
                  key={title}
                  type="button"
                  className="flex items-start gap-3 rounded-md border border-border bg-background-primary p-4 text-left transition-colors hover:border-action-default-border-hover hover:bg-background-secondary"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-background-secondary">
                    <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={18} className="text-text-secondary" />
                  </div>
                  <div>
                    <p className="text-paragraph font-medium text-text-primary">{title}</p>
                    <p className="mt-0.5 text-hint text-text-secondary">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-xs rounded border border-border bg-background-primary px-2 py-1.5" style={{ width: 200 }}>
            <Icon name="searchIcon" size={14} className="shrink-0 text-text-secondary" />
            <input
              type="text"
              placeholder="Filter by name or ID s..."
              className="min-w-0 flex-1 bg-transparent text-hint text-text-primary outline-none placeholder:text-text-placeholder"
            />
          </div>

          {/* Type filters */}
          <div className="flex rounded border border-border">
            {FILTER_TABS.map((ft, i) => (
              <button
                key={ft.id}
                type="button"
                onClick={() => setFilterTab(ft.id)}
                className={cx(
                  "px-3 py-1.5 text-hint transition-colors",
                  i > 0 && "border-l border-border",
                  filterTab === ft.id
                    ? "bg-action-default-background-hover font-medium text-action-tertiary-text-default"
                    : "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
                )}
              >
                {ft.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DefaultButton size="small" leadingIcon={<Icon name="TagIcon" size={12} />}>Tags</DefaultButton>
            <DefaultButton size="small" leadingIcon={<Icon name="userIcon" size={12} />}>Run as</DefaultButton>
          </div>

          <div className="ml-auto">
            <PrimaryButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>Create</PrimaryButton>
          </div>
        </div>

        {/* Health filter pill */}
        <div className="mb-4">
          <button type="button" className="flex items-center gap-xs rounded-full border border-border bg-background-secondary px-3 py-1 text-hint text-text-secondary hover:border-action-default-border-hover">
            Health
            <Icon name="chevronDownIcon" size={12} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border border-border">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_160px_64px] items-center border-b border-border bg-background-secondary px-4 py-2">
            <button type="button" className="flex items-center gap-xs text-hint font-medium text-text-secondary hover:text-text-primary">
              Name
              <Icon name="chevronUpIcon" size={12} />
            </button>
            <span className="text-hint font-medium text-text-secondary">Type</span>
            <span className="text-hint font-medium text-text-secondary">Tags</span>
            <span className="text-hint font-medium text-text-secondary">Run as</span>
            <span className="text-hint font-medium text-text-secondary">Trigger</span>
            <span className="text-hint font-medium text-text-secondary">Health</span>
            <span className="text-hint font-medium text-text-secondary">Recent runs</span>
            <span />
          </div>

          {/* Rows */}
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_160px_64px] items-center border-b border-border px-4 py-2.5 last:border-b-0 hover:bg-background-secondary"
            >
              <button
                type="button"
                onClick={() => router.push(`/workflows/${job.id}`)}
                className="truncate text-left text-paragraph text-action-tertiary-text-default hover:underline"
              >
                {job.name}
              </button>
              <div className="flex items-center gap-xs text-hint text-text-secondary">
                <Icon
                  name={job.type === "Job" ? "WorkflowsIcon" : "PipelineIcon"}
                  size={13}
                  className="shrink-0 text-text-secondary"
                />
                {job.type}
              </div>
              <span className="text-hint text-text-secondary">—</span>
              <div className="flex items-center gap-xs text-hint text-text-secondary">
                <Icon name="userCircleIcon" size={13} className="shrink-0 text-text-secondary" />
                {job.runAs}
              </div>
              <span className="text-hint text-text-secondary">{job.trigger ?? ""}</span>
              <HealthBadge health={job.health} />
              <div className="flex items-center gap-1">
                {job.recentRuns.map((r, i) => (
                  <RunDot key={i} status={r} />
                ))}
                <IconButton
                  aria-label="Run now"
                  icon={<Icon name="playIcon" size={12} />}
                  size="small"
                  tone="neutral"
                  className="ml-1"
                />
              </div>
              <div className="flex items-center gap-0.5">
                <IconButton aria-label="Edit" icon={<Icon name="pencilIcon" size={13} />} size="small" tone="neutral" />
                <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={13} />} size="small" tone="neutral" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <DefaultButton size="small" leadingIcon={<Icon name="chevronLeftIcon" size={12} />}>Previous</DefaultButton>
          <DefaultButton size="small" trailingIcon={<Icon name="chevronRightIcon" size={12} />}>Next</DefaultButton>
        </div>
      </div>
    </div>
  );
}
