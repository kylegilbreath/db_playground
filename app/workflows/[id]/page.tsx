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

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cx(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        on ? "bg-blue-600" : "bg-border",
      )}
    >
      <span
        className={cx(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[18px]" : "translate-x-1",
        )}
      />
    </button>
  );
}

function SidebarSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-3 flex w-full items-center gap-xs text-paragraph font-semibold text-text-primary"
      >
        <Icon name={open ? "chevronUpIcon" : "chevronDownIcon"} size={14} className="text-text-secondary" />
        {title}
      </button>
      {open && children}
    </div>
  );
}

function SidebarRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-1">
      <span className="w-36 shrink-0 text-hint text-text-secondary">{label}</span>
      <div className="flex-1 text-hint text-text-primary">{children}</div>
    </div>
  );
}

type Tab = "runs" | "tasks";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tab, setTab] = React.useState<Tab>("tasks");
  const [perfOptimized, setPerfOptimized] = React.useState(false);

  const jobName = "New Job 2026-05-20 13:42:43";
  const jobId = "205491427836575";

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background-primary">
      <div className="flex min-h-0 flex-1 flex-col">

        {/* Breadcrumb */}
        <div className="flex items-center gap-xs border-b border-border px-6 py-3">
          <button
            type="button"
            onClick={() => router.push("/workflows")}
            className="text-hint text-action-tertiary-text-default hover:underline"
          >
            Jobs & Pipelines
          </button>
          <Icon name="chevronRightIcon" size={12} className="text-text-secondary" />
        </div>

        {/* Title row */}
        <div className="flex items-center gap-3 px-6 py-4">
          <Icon name="WorkflowsIcon" size={20} className="shrink-0 text-text-secondary" />
          <h1 className="flex-1 text-title3 font-semibold text-text-primary">{jobName}</h1>
          <IconButton aria-label="Favorite" icon={<Icon name="starIcon" size={16} />} size="small" tone="neutral" />
          <button type="button" className="flex items-center gap-xs text-hint text-action-tertiary-text-default hover:underline">
            <Icon name="speechBubblePlusIcon" size={14} />
            Send feedback
          </button>
          <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={16} />} size="small" tone="neutral" />
          <div className="flex">
            <PrimaryButton size="default">Run now</PrimaryButton>
            <button
              type="button"
              className="flex h-8 w-7 items-center justify-center rounded-r border-l border-action-primary-background-hover bg-action-primary-background-default text-action-primary-text-default hover:bg-action-primary-background-hover"
            >
              <Icon name="chevronDownIcon" size={12} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {([
            { id: "runs", label: "Runs" },
            { id: "tasks", label: "Tasks" },
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

        {/* Main content split */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* Task canvas */}
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-[#f7f8fa]"
            style={{ backgroundImage: "radial-gradient(circle, #d0d4db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          >
            {tab === "tasks" ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-title4 font-semibold text-text-primary">Add your first task</p>
                <button
                  type="button"
                  className="flex w-64 items-center gap-3 rounded-md border border-border bg-background-primary px-4 py-3 text-left shadow-sm hover:border-action-default-border-hover"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-background-primary">
                    <Icon name="notebookIcon" size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-paragraph font-medium text-text-primary">Notebook</p>
                    <p className="text-hint text-text-secondary">Run a notebook</p>
                  </div>
                </button>
                <p className="text-hint text-text-secondary">or</p>
                <PrimaryButton size="default" leadingIcon={<Icon name="plusIcon" size={14} />}>
                  Add another task type
                </PrimaryButton>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Icon name="RunIcon" size={32} className="text-text-placeholder" />
                <p className="text-paragraph text-text-secondary">No runs yet</p>
              </div>
            )}

            {/* Canvas controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
              {[
                { icon: "searchIcon", label: "Search" },
                { icon: "plusSquareIcon", label: "Fit to view" },
                { icon: "plusIcon", label: "Zoom in" },
                { icon: "closeSmallIcon", label: "Zoom out" },
              ].map(({ icon, label }) => (
                <IconButton
                  key={label}
                  aria-label={label}
                  icon={<Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={14} />}
                  size="small"
                  tone="neutral"
                  className="border border-border bg-background-primary shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border px-5">

            <SidebarSection title="Job details">
              <SidebarRow label="Job ID">
                <div className="flex items-center gap-xs">
                  <span className="font-mono">{jobId}</span>
                  <IconButton aria-label="Copy" icon={<Icon name="checkIcon" size={12} />} size="small" tone="neutral" />
                </div>
              </SidebarRow>
              <SidebarRow label="Creator">
                <div className="flex items-center gap-xs">
                  <Icon name="userCircleIcon" size={13} className="text-text-secondary" />
                  Kyle Gilbreath
                </div>
              </SidebarRow>
              <SidebarRow label="Run as">
                <div className="flex items-center gap-xs">
                  <Icon name="userCircleIcon" size={13} className="text-text-secondary" />
                  Kyle Gilbreath
                  <IconButton aria-label="Edit run as" icon={<Icon name="pencilIcon" size={12} />} size="small" tone="neutral" />
                </div>
              </SidebarRow>
              <SidebarRow label="Description">
                <button type="button" className="rounded border border-border px-2 py-0.5 text-hint text-text-secondary hover:bg-background-secondary">
                  Add description
                </button>
              </SidebarRow>
              <SidebarRow label="Lineage">
                <span className="text-text-secondary">No lineage information for this job.</span>
              </SidebarRow>
              <SidebarRow label="Performance optimized">
                <Toggle on={perfOptimized} onToggle={() => setPerfOptimized((v) => !v)} />
              </SidebarRow>
            </SidebarSection>

            <SidebarSection title="Schedules & Triggers">
              <p className="mb-3 text-hint text-text-secondary">None</p>
              <DefaultButton size="small">Add trigger</DefaultButton>
            </SidebarSection>

            <SidebarSection title="Job parameters">
              <p className="mb-3 text-hint text-text-secondary">No job parameters are defined for this job</p>
              <DefaultButton size="small">Edit parameters</DefaultButton>
            </SidebarSection>

            <SidebarSection title="Usage policy" defaultOpen={false}>
              <SidebarRow label="Usage policy"><span className="text-text-secondary">—</span></SidebarRow>
              <SidebarRow label="Usage tags"><span className="text-text-secondary">—</span></SidebarRow>
            </SidebarSection>

          </div>
        </div>
      </div>
    </div>
  );
}
