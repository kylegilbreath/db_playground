"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DefaultButton } from "@/components/DefaultButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Dashboard viz content (shared with chat preview)
// ---------------------------------------------------------------------------

function DashboardContent() {
  const dauPoints = [18, 24, 22, 30, 28, 35, 32, 40, 38, 44, 42, 48, 46, 52, 50, 58, 55, 62, 60, 68, 65, 70, 68, 74, 72, 78, 76, 82, 80, 86];
  const wauPoints = [120, 128, 125, 134, 130, 140, 137, 145, 142, 150, 148, 156, 153, 162, 158, 168, 164, 174, 170, 180, 176, 184, 181, 190, 186, 196, 192, 202, 198, 208];

  function toSparkline(pts: number[], w: number, h: number) {
    const min = Math.min(...pts), max = Math.max(...pts);
    const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
    const ys = pts.map(v => h - ((v - min) / (max - min)) * h);
    return xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  }

  const Sparkline = ({ pts, color }: { pts: number[]; color: string }) => (
    <svg viewBox="0 0 120 32" className="w-full h-8" preserveAspectRatio="none">
      <path d={toSparkline(pts, 120, 32)} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const StatCard = ({ label, value, sub, pts, color }: { label: string; value: string; sub: string; pts: number[]; color: string }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background-primary p-4">
      <span className="text-hint text-text-secondary">{label}</span>
      <span className="text-[22px] font-semibold leading-none text-text-primary">{value}</span>
      <Sparkline pts={pts} color={color} />
      <span className="text-hint text-text-secondary">{sub}</span>
    </div>
  );

  const barData = [42, 38, 55, 60, 58, 72, 68, 80, 75, 84, 79, 88, 83, 92];
  const barMax = Math.max(...barData);

  const engagementRows = [
    { label: "Query generation", pct: 48, count: "12,840" },
    { label: "Data exploration", pct: 28, count: "7,490" },
    { label: "Notebook authoring", pct: 14, count: "3,745" },
    { label: "Dashboard creation", pct: 10, count: "2,675" },
  ];

  const topUsers = [
    { name: "sarah.chen@databricks.com", sessions: 142, queries: 894 },
    { name: "marcus.j@databricks.com", sessions: 118, queries: 762 },
    { name: "priya.r@databricks.com", sessions: 97, queries: 631 },
    { name: "thomas.w@databricks.com", sessions: 84, queries: 548 },
    { name: "aiko.t@databricks.com", sessions: 76, queries: 497 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Daily Active Users" value="2,847" sub="↑ 12% vs prior period" pts={dauPoints} color="#2272b4" />
        <StatCard label="Weekly Active Users" value="9,214" sub="↑ 8% vs prior period" pts={wauPoints} color="#6b46c1" />
      </div>

      <div className="rounded-lg border border-border bg-background-primary p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-paragraph font-medium text-text-primary">Daily Active Users — Last 14 Days</span>
          <span className="text-hint text-text-secondary">Jan 11 – Jan 24</span>
        </div>
        <div className="flex items-end gap-1 h-[100px]">
          {barData.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="w-full rounded-sm bg-[#2272b4] opacity-80" style={{ height: `${(v / barMax) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-hint text-text-secondary">
          <span>Jan 11</span><span>Jan 17</span><span>Jan 24</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background-primary p-4">
        <span className="mb-3 block text-paragraph font-medium text-text-primary">Engagement by Feature</span>
        <div className="flex flex-col gap-2">
          {engagementRows.map(row => (
            <div key={row.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-hint">
                <span className="text-text-secondary">{row.label}</span>
                <span className="font-medium text-text-primary">{row.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-secondary">
                <div className="h-full rounded-full bg-[#2272b4]" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background-primary p-4">
        <span className="mb-3 block text-paragraph font-medium text-text-primary">Top Users</span>
        <table className="w-full text-hint">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="pb-2 font-normal">User</th>
              <th className="pb-2 text-right font-normal">Sessions</th>
              <th className="pb-2 text-right font-normal">Queries</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((u, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="py-1.5 text-text-primary truncate max-w-[160px]">{u.name}</td>
                <td className="py-1.5 text-right text-text-secondary">{u.sessions}</td>
                <td className="py-1.5 text-right text-text-secondary">{u.queries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Edit Page
// ---------------------------------------------------------------------------

export default function DashboardEditPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("Ski Resort Dashboard");

  return (
    <div className="flex h-full flex-col bg-background-primary">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background-primary">
        {/* Title row */}
        <div className="flex items-center gap-sm px-4 pt-3 pb-2">
          <span className="min-w-0 truncate text-title3 font-semibold text-text-primary">Ski Resort Dashboard</span>
          <button type="button" aria-label="Bookmark" className="shrink-0 text-text-secondary hover:text-text-primary">
            <Icon name="starIcon" size={16} />
          </button>
          <DefaultButton size="small" leadingIcon={<Icon name="queryListViewIcon" size={14} />}>
            View published
          </DefaultButton>
          <div className="flex-1" />
          <button type="button" aria-label="More options" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
            <Icon name="overflowIcon" size={16} />
          </button>
          <button type="button" className="flex shrink-0 items-center gap-xs text-paragraph text-text-secondary hover:text-text-primary">
            <Icon name="refreshIcon" size={14} />
            9m ago
          </button>
          <DefaultButton size="small">Schedule</DefaultButton>
          <DefaultButton size="small">Publish</DefaultButton>
          <DefaultButton size="small">Share</DefaultButton>
        </div>
        {/* Tabs */}
        <div className="flex items-end px-4">
          <button
            type="button"
            className="mr-4 flex items-center gap-xs pb-2 text-paragraph text-text-secondary hover:text-text-primary border-b-2 border-transparent"
          >
            <Icon name="tableIcon" size={14} />
            Data
          </button>
          {["Ski Resort Dashboard", "Executive Summary"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cx(
                "mr-4 flex items-center gap-xs pb-2 text-paragraph border-b-2 transition-colors",
                activeTab === tab
                  ? "border-action-default-border-focus font-medium text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {activeTab === tab && <Icon name="filterIcon" size={12} className="text-text-secondary" />}
              {tab}
              {activeTab === tab && <Icon name="overflowHorizontalIcon" size={12} className="text-text-secondary" />}
            </button>
          ))}
          <button type="button" className="pb-2 text-text-secondary hover:text-text-primary">
            <Icon name="plusIcon" size={14} />
          </button>
        </div>
      </div>

      {/* Body: filters sidebar + canvas + config panel */}
      <div className="flex min-h-0 flex-1">
        {/* Global filters sidebar */}
        <div className="flex w-[200px] shrink-0 flex-col border-r border-border bg-background-primary px-3 py-3">
          <div className="flex items-center justify-between">
            <span className="text-paragraph font-medium text-text-primary">Global filters</span>
            <div className="flex items-center gap-xs">
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                <Icon name="plusIcon" size={14} />
              </button>
              <button type="button" className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                <Icon name="filterIcon" size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            {/* Arrow graphic */}
            <svg width="48" height="64" viewBox="0 0 48 64" fill="none" aria-hidden>
              <path d="M24 56 C24 40, 40 32, 40 16" stroke="#cbcbcb" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="4 3" />
              <path d="M36 12 L40 16 L44 12" stroke="#cbcbcb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <button type="button" className="text-hint text-text-secondary hover:text-text-primary">
              Add a global filter
            </button>
            <span className="text-hint text-text-secondary">No global filters.</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <DashboardContent />
        </div>

        {/* Widget config panel */}
        <div className="flex w-[200px] shrink-0 flex-col items-center justify-center border-l border-border bg-background-primary">
          <span className="text-paragraph text-text-secondary">Select a widget to configure</span>
        </div>
      </div>
    </div>
  );
}
