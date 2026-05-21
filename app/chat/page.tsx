"use client";

import * as React from "react";
import ReactDOM from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { DefaultButton } from "@/components/DefaultButton";
import {
  ConnectionsMainView,
  MCP_SERVERS,
  McpToolsConfigDialog,
  McpToggle,
  type McpServer,
} from "@/components/McpConnectionsPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Icon } from "@/components/icons";
import { IconButton } from "@/components/IconButton";
import { TextInput } from "@/components/TextInput";

import { AssistantInstructionsCard, RenderSkillDialogMarkdown } from "@/components/AssistantInstructions/AssistantInstructionsCard";
import { useGenieChatState, GenieChatBody, GenieChatThreadList, MoreOptionsMenu } from "@/components/GenieCodePanel/GenieChatCore";
import { ASSISTANT_INSTRUCTIONS_FILE, ASSISTANT_INSTRUCTIONS_MARKDOWN } from "@/lib/assistant-instructions";
import { ASSISTANT_DASHBOARD_REVIEW_ASSETS } from "@/components/AgentChat/data/assistantDashboardRun";
import type { ReviewAsset, ChatStep } from "@/components/AgentChat";

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

const SCHEMA_TABLES_CHAT = [
  { name: "ski_conditions", cols: ["date", "resort", "snowfall_in", "lifts_open", "visitors"] },
  { name: "lift_operations", cols: ["lift_id", "name", "status", "capacity"] },
  { name: "ticket_sales", cols: ["sale_id", "date", "type", "price", "resort"] },
  { name: "snowfall_history", cols: ["date", "resort", "amount_in", "season"] },
];

const WORKSPACE_FILES_CHAT: { name: string; icon: string; kind: import("@/components/AgentChat").ReviewAsset["kind"] }[] = [
  { name: "Ski Resort EDA", icon: "notebookIcon", kind: "notebook" },
  { name: "file-name.py", icon: "fileCodeIcon", kind: "file" },
  { name: "New Query 2026-03-17", icon: "fileDocumentIcon", kind: "file" },
  { name: "New Query 2026-03-13", icon: "fileDocumentIcon", kind: "file" },
  { name: "New Query 2026-03-09", icon: "fileDocumentIcon", kind: "file" },
  { name: "New Query 2026-03-02", icon: "fileDocumentIcon", kind: "file" },
  { name: "Untitled Notebook", icon: "notebookIcon", kind: "notebook" },
  { name: "Untitled Notebook", icon: "notebookIcon", kind: "notebook" },
  { name: "test.py", icon: "fileCodeIcon", kind: "file" },
];

type SidePanel = "threads";
type MainView = "thread" | "customizations" | "scheduled";
type CustomizationsTab = "skills" | "connections";

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
    <div className="group relative inline-flex items-center">
      {children}
      <div className={`pointer-events-none absolute top-full z-50 mt-1.5 whitespace-nowrap rounded bg-[#161616] px-2 py-1 text-hint text-white opacity-0 transition-opacity group-hover:opacity-100 ${posClass}`}>
        <span className={`absolute bottom-full border-4 border-transparent border-b-[#161616] ${caretClass}`} />
        {label}
      </div>
    </div>
  );
}

type SkillFile = { name: string; file: string };
type SkillFolder = { name: string; children: SkillFile[] };
type SkillEntry = SkillFile | SkillFolder;
function isFolder(e: SkillEntry): e is SkillFolder { return "children" in e; }

type Skill = {
  id: string;
  name: string;
  primaryFile: string; // the SKILL.md equivalent — shown in preview on expand
  entries: SkillEntry[];
  description: string;
};

const SKILLS: Skill[] = [
  {
    id: "10x-engineer",
    name: "10x-engineer",
    primaryFile: "10x-engineer.md",
    entries: [
      { name: "SKILL.md", file: "10x-engineer.md" },
      { name: "README.md", file: "10x-engineer-readme.md" },
    ],
    description:
      "Opinionated workflow constraints for high-leverage engineering — plan-first execution, subagent strategy, self-improvement loops, and autonomous bug fixing.",
  },
  {
    id: "frontend-reviewer",
    name: "frontend-reviewer",
    primaryFile: "frontend-reviewer.md",
    entries: [
      { name: "SKILL.md", file: "frontend-reviewer.md" },
      { name: "README.md", file: "frontend-reviewer-readme.md" },
      { name: "STYLE_PRESETS.md", file: "frontend-reviewer-style.md" },
    ],
    description:
      "Deep frontend code review agent for React applications. Analyzes code for accessibility issues, performance problems, React anti-patterns, and security vulnerabilities. Returns structured feedback with P0/P1/P2 severity levels.",
  },
  {
    id: "ux-designer",
    name: "ux-designer",
    primaryFile: "ux-designer.md",
    entries: [
      { name: "SKILL.md", file: "ux-designer.md" },
      {
        name: "references",
        children: [
          { name: "patterns-and-flows.md", file: "ux-designer-patterns.md" },
          { name: "psychology-deep-dive.md", file: "ux-designer-psychology.md" },
        ],
      },
    ],
    description: "UX design review and critique agent for product interfaces.",
  },
];

const WORKSPACE_SKILLS: Skill[] = [
  {
    id: "unit-tests",
    name: "unit-tests",
    primaryFile: "unit-tests.md",
    entries: [
      { name: "SKILL.md", file: "unit-tests.md" },
      { name: "README.md", file: "unit-tests-readme.md" },
    ],
    description: "Generates unit tests for notebooks and Python files using pytest conventions.",
  },
];

// ---------------------------------------------------------------------------
// Skill file viewer — renders a .md file in the preview panel
// ---------------------------------------------------------------------------

const SKILL_FILE_CONTENT: Record<string, string> = {
  "unit-tests.md": `# Unit Tests Skill

Generates pytest-based unit tests for Databricks notebooks and Python files. Follows workspace testing conventions and coverage requirements.

## When to use

Invoke this skill when you want to generate, review, or improve test coverage for a notebook cell, Python function, or module.

## How to use

- \`/unit-tests\` — generate tests for the current file or selected cell
- \`/unit-tests --coverage\` — generate tests with coverage annotations

## Test conventions

- Use \`pytest\` as the test runner
- Mock Spark sessions with \`pyspark.testing.utils.assertDataFrameEqual\`
- Use \`unittest.mock.patch\` for external dependencies
- Name test files \`test_<module_name>.py\`
- One \`describe\`-style class per function under test

## Example

\`\`\`python
import pytest
from unittest.mock import patch, MagicMock
from my_module import calculate_snowfall_average

def test_calculate_snowfall_average_returns_correct_mean():
    data = [{"resort": "Vail", "snowfall_in": 8}, {"resort": "Aspen", "snowfall_in": 12}]
    result = calculate_snowfall_average(data)
    assert result == 10.0

def test_calculate_snowfall_average_empty_input():
    with pytest.raises(ValueError, match="No data provided"):
        calculate_snowfall_average([])
\`\`\`

## Coverage requirements

Workspace policy requires ≥80% line coverage for all production modules. This skill will annotate generated tests with coverage targets.`,
  "unit-tests-readme.md": `# Unit Tests — README\n\nSetup and usage instructions for the unit-tests workspace skill.\n\nRequires pytest ≥7.0 and pyspark ≥3.3.`,
  "10x-engineer-readme.md": `# 10x Engineer — README\n\nSetup and usage instructions for the 10x Engineer skill.`,
  "frontend-reviewer-readme.md": `# Frontend Reviewer — README\n\nSetup and usage instructions for the Frontend Reviewer skill.`,
  "frontend-reviewer-style.md": `# Style Presets\n\nStyle configuration presets used by the Frontend Reviewer skill.`,
  "ux-designer.md": `# UX Designer Skill\n\nUX design review and critique agent for product interfaces.\n\n## Capabilities\n\n- Design critique and feedback\n- Accessibility audit\n- Information architecture review`,
  "ux-designer-patterns.md": `# Patterns and Flows\n\nReference patterns and user flow templates for UX design review.`,
  "ux-designer-psychology.md": `# Psychology Deep Dive\n\nCognitive psychology principles applied to UX design critique.`,
  "10x-engineer.md": `# 10x Engineer Skill

Opinionated workflow constraints for high-leverage engineering — plan-first execution, subagent strategy, self-improvement loops, and autonomous bug fixing.

## Core Philosophy

- **Plan first** — Never write code without a clear plan. Use EnterPlanMode for any non-trivial task.
- **Subagent strategy** — Delegate parallelizable work to subagents. Don't do everything serially.
- **Self-improvement loops** — After completing a task, reflect on what could be done better.
- **Autonomous bug fixing** — When tests fail, diagnose root cause before switching approaches.

## Workflow Constraints

1. Always read the file before editing it
2. Run tests after every change
3. Prefer small, focused commits
4. Never skip linting or type checks
5. Document decisions in commit messages, not comments`,

  "frontend-reviewer.md": `# Frontend Reviewer Skill

Deep frontend code review agent for React applications. Analyzes code for accessibility issues, performance problems, React anti-patterns, and security vulnerabilities. Returns structured feedback with P0/P1/P2 severity levels.

## Review Categories

### Accessibility (A11Y)
- Images without alt text
- Interactive elements without labels
- Missing ARIA attributes
- Keyboard navigation issues
- Focus management problems

### Performance (PERF)
- Missing React.memo, useMemo, useCallback
- Inline object/array creation in JSX props
- useEffect with incorrect dependencies
- Missing lazy loading for routes

### React Patterns (REACT)
- State updates during render
- Direct DOM manipulation
- Missing cleanup in useEffect
- Derived state stored in useState

## Severity Levels

- **P0** — Breaks functionality or accessibility
- **P1** — Significant performance or UX degradation
- **P2** — Code quality and maintainability`,
  [ASSISTANT_INSTRUCTIONS_FILE]: ASSISTANT_INSTRUCTIONS_MARKDOWN,
};

function SkillFileViewer({ skillFile, content: contentProp }: { skillFile: string; content?: string }) {
  const content = contentProp ?? SKILL_FILE_CONTENT[skillFile] ?? `# ${skillFile}\n\nSkill file content not available.`;
  const lines = content.split("\n");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-6 py-5">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <h1 key={i} className="mb-3 text-title3 font-semibold text-text-primary">{line.slice(2)}</h1>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={i} className="mb-2 mt-5 text-paragraph font-semibold text-text-primary">{line.slice(3)}</h2>;
        }
        if (line.startsWith("### ")) {
          return <h3 key={i} className="mb-1 mt-3 text-paragraph font-medium text-text-primary">{line.slice(4)}</h3>;
        }
        if (line.startsWith("- **")) {
          const match = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
          if (match) {
            return <p key={i} className="mb-1 text-paragraph text-text-primary"><span className="font-medium">{match[1]}</span> — {match[2]}</p>;
          }
        }
        if (line.startsWith("- ")) {
          return <p key={i} className="mb-1 pl-3 text-paragraph text-text-primary before:mr-2 before:content-['•']">{line.slice(2)}</p>;
        }
        const numMatch = line.match(/^(\d+)\. (.+)$/);
        if (numMatch) {
          return <p key={i} className="mb-1 text-paragraph text-text-primary"><span className="mr-2 font-medium">{numMatch[1]}.</span>{numMatch[2]}</p>;
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="mb-1 text-paragraph font-semibold text-text-primary">{line.slice(2, -2)}</p>;
        }
        if (line === "") {
          return <div key={i} className="h-1" />;
        }
        return <p key={i} className="mb-1 text-paragraph text-text-secondary">{line}</p>;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skill preview dialog — modal for customizations view
// ---------------------------------------------------------------------------

function SkillPreviewDialog({ skillFile, onClose }: { skillFile: string; onClose: () => void }) {
  const router = useRouter();
  const displayName = skillFile.replace(".md", "");
  const content = SKILL_FILE_CONTENT[skillFile] ?? `# ${skillFile}\n\nSkill file content not available.`;

  const openInEditor = () => {
    onClose();
    router.push(`/editor?skill=${encodeURIComponent(skillFile)}`);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[600px] w-[560px] flex-col overflow-hidden rounded-md bg-background-primary shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-border px-lg py-md">
          <div className="flex flex-col gap-xs">
            <span className="text-title3 font-semibold text-text-primary">{displayName}</span>
            <span className="text-hint text-text-secondary">/Workspace/assistant/skills/{displayName}</span>
          </div>
          <button type="button" onClick={onClose} className="mt-0.5 rounded-sm p-0.5 text-text-secondary hover:bg-action-default-background-hover hover:text-text-primary">
            <Icon name="closeIcon" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-lg py-md">
          <RenderSkillDialogMarkdown text={content} />
        </div>
        <div className="flex shrink-0 items-center justify-end gap-sm border-t border-border px-lg py-md">
          <DefaultButton onClick={onClose}>Close</DefaultButton>
          <PrimaryButton onClick={openInEditor}>Open in editor</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// Tools main view — full-width skills + instructions
// ---------------------------------------------------------------------------


function allFilesInEntries(entries: SkillEntry[]): string[] {
  return entries.flatMap((e) => isFolder(e) ? e.children.map((c) => c.file) : [e.file]);
}

function SkillFolderRow({ folder, selectedSkillFile, onSkillClick }: { folder: SkillFolder; selectedSkillFile: string | null; onSkillClick: (file: string) => void }) {
  const [expanded, setExpanded] = React.useState(() => folder.children.some((c) => c.file === selectedSkillFile));
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-xs rounded-sm px-sm py-xs text-left transition-colors hover:bg-action-default-background-hover"
      >
        <Icon name="folderOutlinedIcon" size={12} className="shrink-0 text-text-secondary" />
        <span className="flex-1 truncate text-paragraph text-text-secondary">{folder.name}</span>
        <Icon name={expanded ? "chevronDownIcon" : "chevronRightIcon"} size={12} className="shrink-0 text-text-secondary" />
      </button>
      {expanded && (
        <div className="ml-[20px] flex flex-col border-l border-border pl-sm">
          {folder.children.map((f) => (
            <button
              key={f.file}
              type="button"
              onClick={() => onSkillClick(f.file)}
              className={cx(
                "flex w-full items-center gap-xs rounded-sm px-sm py-xs text-left text-paragraph transition-colors hover:bg-action-default-background-hover",
                selectedSkillFile === f.file ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-secondary",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SkillTreeRow({ skill, selectedSkillFile, onSkillClick }: { skill: Skill; selectedSkillFile: string | null; onSkillClick: (file: string) => void }) {
  const hasMultipleEntries = skill.entries.length > 1;
  const allFiles = allFilesInEntries(skill.entries);
  const [expanded, setExpanded] = React.useState(
    () => hasMultipleEntries && (allFiles.includes(selectedSkillFile ?? "") || skill.primaryFile === selectedSkillFile)
  );

  const isAnyFileSelected = allFiles.includes(selectedSkillFile ?? "");

  return (
    <div className="flex flex-col">
      {/* Skill row */}
      <button
        type="button"
        onClick={() => {
          if (hasMultipleEntries) {
            setExpanded((v) => !v);
          } else {
            onSkillClick(skill.primaryFile);
          }
        }}
        className={cx(
          "flex w-full items-center gap-sm rounded-sm px-sm py-xs text-left transition-colors hover:bg-action-default-background-hover",
          isAnyFileSelected && !expanded ? "bg-action-default-background-hover" : "",
        )}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-background-primary">
          <Icon name="WrenchIcon" size={12} className="text-text-secondary" />
        </div>
        <span className="flex-1 truncate text-paragraph font-medium text-text-primary">{skill.name}</span>
        {hasMultipleEntries && (
          <Icon name={expanded ? "chevronDownIcon" : "chevronRightIcon"} size={12} className="shrink-0 text-text-secondary" />
        )}
      </button>

      {/* Expanded entries */}
      {expanded && hasMultipleEntries && (
        <div className="ml-[20px] flex flex-col border-l border-border pl-sm">
          {skill.entries.map((entry, i) =>
            isFolder(entry) ? (
              <SkillFolderRow key={i} folder={entry} selectedSkillFile={selectedSkillFile} onSkillClick={onSkillClick} />
            ) : (
              <button
                key={entry.file}
                type="button"
                onClick={() => onSkillClick(entry.file)}
                className={cx(
                  "flex w-full items-center gap-xs rounded-sm px-sm py-xs text-left text-paragraph transition-colors hover:bg-action-default-background-hover",
                  selectedSkillFile === entry.file ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-secondary",
                )}
              >
                {entry.name}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ToolsMainView({
  onSkillClick,
  selectedSkillFile,
  skills,
  scope,
  onScopeChange,
  onOpenAssistantInstructionsFile,
}: {
  onSkillClick: (file: string) => void;
  selectedSkillFile: string | null;
  skills: Skill[];
  scope: "user" | "workspace";
  onScopeChange: (s: "user" | "workspace") => void;
  onOpenAssistantInstructionsFile: () => void;
}) {
  const visibleSkills = scope === "workspace" ? WORKSPACE_SKILLS : skills;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center py-3">
        <span className="flex-1 text-title3 font-semibold text-text-primary">Skills &amp; instructions</span>
        <div className="flex w-fit rounded-sm border border-border bg-background-tertiary p-0.5">
          {(["user", "workspace"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { onScopeChange(s); }}
              className={cx(
                "rounded-[3px] px-3 py-1 text-paragraph transition-colors",
                scope === s
                  ? "bg-background-primary font-medium text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              {s === "user" ? "User" : "Workspace"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-6">
        {/* Skills section */}
        <div className="flex flex-col gap-xs">
          <div className="flex items-center pb-xs">
            <span className="flex-1 text-title4 font-semibold text-text-primary">
              {scope === "user" ? "User skills" : "Workspace skills"}
            </span>
            <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>Add</DefaultButton>
          </div>
          {visibleSkills.map((skill) => (
            <SkillTreeRow
              key={skill.id}
              skill={skill}
              selectedSkillFile={selectedSkillFile}
              onSkillClick={onSkillClick}
            />
          ))}
        </div>

        <div className="h-px w-full bg-border" />

        {/* Instructions section */}
        <div className="flex flex-col gap-sm">
          <p className="text-paragraph font-semibold text-text-primary">
            {scope === "user" ? "User instructions" : "Workspace instructions"}
          </p>
          {scope === "user" ? (
            <>
              <p className="text-paragraph text-text-secondary">
                Instructions lets you provide system-level instructions to Genie Code. It&apos;s a persistent way to share context, preferences, or preferred ways of authoring.
              </p>
              <AssistantInstructionsCard onOpenFile={onOpenAssistantInstructionsFile} />
              <p className="text-paragraph text-text-secondary">
                The fastest way to add instructions is to start your input with the <strong className="font-semibold text-text-primary">#</strong> character.
              </p>
            </>
          ) : (
            <>
              <p className="text-paragraph text-text-secondary">
                Workspace instructions are configured by your workspace admin and provide more context to Genie Code to help it follow guidelines and operate more efficiently in your workspace.{" "}
                <span className="cursor-pointer text-action-default-text hover:underline">Learn more</span>
              </p>
              <div>
                <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>Add file</DefaultButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connections main view — placeholder
// ---------------------------------------------------------------------------
// Scheduled tasks main view
// ---------------------------------------------------------------------------

const SUGGESTED_TASKS = [
  { icon: "clockIcon", title: "Refresh weekly dashboard", description: "Re-run all dashboard queries and send a Slack summary every Monday morning", triggerType: "schedule" },
  { icon: "lightningIcon", title: "Monitor data quality", description: "Scan key tables for nulls, duplicates, and schema drift on a daily schedule", triggerType: "table_update" },
  { icon: "lightningIcon", title: "Generate EDA report", description: "Run exploratory analysis on new data arrivals and append findings to a shared notebook", triggerType: "file_arrival" },
  { icon: "lightningIcon", title: "Weekly model retraining", description: "Kick off the feature pipeline and retrain the forecast model every Sunday night", triggerType: "model_training" },
  { icon: "lightningIcon", title: "Quality check on pipeline", description: "Monitor your pipelines and analyze when issues arise", triggerType: "job_completion" },
  { icon: "clockIcon", title: "Alert on metric drops", description: "Check DAU and WAU thresholds each hour and notify the team if they fall below baseline", triggerType: "schedule" },
];

type ScheduledTask = {
  id: string;
  title: string;
  schedule: string;
  prompt: string;
  lastRun: string;
  status: "success" | "failed" | "running";
  triggerType: "schedule" | "file_arrival" | "table_update" | "continuous" | "model_update" | "job_completion" | "model_training";
  enabled: boolean;
};

const SCHEDULED_TASKS: ScheduledTask[] = [
  { id: "t1", title: "Weekly dashboard refresh", schedule: "Every Mon 8:00 AM", prompt: "Re-run all dashboard queries and send a Slack summary to #data-ops every Monday morning", lastRun: "2d ago", status: "success", triggerType: "schedule", enabled: true },
  { id: "t2", title: "Ski resorts quality scan", schedule: "main.2026_northeast.ski_resorts", prompt: "Scan main.2026_northeast.ski_resorts for nulls, duplicates, and schema drift. Flag any columns with >5% null rates and report unexpected value distributions in resort_name, region, and vertical_drop.", lastRun: "14h ago", status: "success", triggerType: "table_update", enabled: true },
  { id: "t3", title: "Forecast model retrain", schedule: "main.default.forecast_model", prompt: "Kick off the feature pipeline and retrain the forecast model every Sunday night", lastRun: "4d ago", status: "failed", triggerType: "model_training", enabled: false },
  { id: "t4", title: "Pipeline monitoring", schedule: "data_engineering/silver_transform", prompt: "Monitor the silver_transform pipeline for failures and anomalies. Alert when job duration exceeds 2x the rolling average or when error rate rises above 1%.", lastRun: "1h ago", status: "running", triggerType: "job_completion", enabled: true },
  { id: "t5", title: "Daily sales summary", schedule: "Every day 7:00 AM", prompt: "Pull yesterday's sales data, compute totals by region and product category, and post a summary to #sales-ops", lastRun: "7h ago", status: "success", triggerType: "schedule", enabled: true },
  { id: "t6", title: "End-of-week KPI report", schedule: "Every Fri 5:00 PM", prompt: "Aggregate the week's key metrics — DAU, revenue, pipeline health — and generate a Friday wrap-up report for leadership", lastRun: "5d ago", status: "success", triggerType: "schedule", enabled: true },
  { id: "t7", title: "Nightly data freshness check", schedule: "Every day 2:00 AM", prompt: "Verify all critical tables were updated within their expected refresh windows. Flag any tables that are stale by more than 2 hours.", lastRun: "5h ago", status: "failed", triggerType: "schedule", enabled: false },
];

const MOCK_JOBS = [
  "data_engineering/bronze_ingestion",
  "data_engineering/silver_transform",
  "data_engineering/gold_aggregation",
  "ml_pipelines/feature_pipeline",
  "ml_pipelines/model_training",
  "ml_pipelines/model_evaluation",
  "analytics/weekly_dashboard_refresh",
  "analytics/data_quality_scan",
  "analytics/forecast_retrain",
  "ops/table_maintenance",
  "ops/cost_attribution_rollup",
  "ops/usage_reporting",
];

const FREQUENCY_OPTIONS = ["Day", "Week", "Month"] as const;
const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = ["00", "15", "30", "45"];

const TIMEZONE_OPTIONS = [
  { label: "(UTC-12:00) International Date Line West", value: "Etc/GMT+12" },
  { label: "(UTC-11:00) Coordinated Universal Time-11", value: "Etc/GMT+11" },
  { label: "(UTC-10:00) Hawaii", value: "Pacific/Honolulu" },
  { label: "(UTC-09:00) Alaska", value: "America/Anchorage" },
  { label: "(UTC-08:00) Pacific Time (US & Canada)", value: "America/Los_Angeles" },
  { label: "(UTC-07:00) Mountain Time (US & Canada)", value: "America/Denver" },
  { label: "(UTC-07:00) Arizona", value: "America/Phoenix" },
  { label: "(UTC-06:00) Central Time (US & Canada)", value: "America/Chicago" },
  { label: "(UTC-06:00) Mexico City", value: "America/Mexico_City" },
  { label: "(UTC-05:00) Eastern Time (US & Canada)", value: "America/New_York" },
  { label: "(UTC-05:00) Bogota, Lima, Quito", value: "America/Bogota" },
  { label: "(UTC-04:00) Atlantic Time (Canada)", value: "America/Halifax" },
  { label: "(UTC-04:00) Caracas, La Paz", value: "America/Caracas" },
  { label: "(UTC-03:00) Buenos Aires", value: "America/Argentina/Buenos_Aires" },
  { label: "(UTC-03:00) Brasilia", value: "America/Sao_Paulo" },
  { label: "(UTC-02:00) Mid-Atlantic", value: "Etc/GMT+2" },
  { label: "(UTC-01:00) Azores", value: "Atlantic/Azores" },
  { label: "(UTC+00:00) London, Dublin, Lisbon", value: "Europe/London" },
  { label: "(UTC+00:00) Coordinated Universal Time", value: "UTC" },
  { label: "(UTC+01:00) Amsterdam, Berlin, Paris, Rome", value: "Europe/Paris" },
  { label: "(UTC+01:00) Madrid, Copenhagen, Warsaw", value: "Europe/Madrid" },
  { label: "(UTC+02:00) Athens, Bucharest, Istanbul", value: "Europe/Athens" },
  { label: "(UTC+02:00) Cairo", value: "Africa/Cairo" },
  { label: "(UTC+02:00) Johannesburg", value: "Africa/Johannesburg" },
  { label: "(UTC+03:00) Moscow, St. Petersburg", value: "Europe/Moscow" },
  { label: "(UTC+03:00) Nairobi", value: "Africa/Nairobi" },
  { label: "(UTC+03:30) Tehran", value: "Asia/Tehran" },
  { label: "(UTC+04:00) Abu Dhabi, Muscat", value: "Asia/Dubai" },
  { label: "(UTC+04:30) Kabul", value: "Asia/Kabul" },
  { label: "(UTC+05:00) Islamabad, Karachi", value: "Asia/Karachi" },
  { label: "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi", value: "Asia/Kolkata" },
  { label: "(UTC+05:45) Kathmandu", value: "Asia/Kathmandu" },
  { label: "(UTC+06:00) Dhaka", value: "Asia/Dhaka" },
  { label: "(UTC+06:30) Yangon (Rangoon)", value: "Asia/Rangoon" },
  { label: "(UTC+07:00) Bangkok, Hanoi, Jakarta", value: "Asia/Bangkok" },
  { label: "(UTC+08:00) Beijing, Chongqing, Hong Kong", value: "Asia/Shanghai" },
  { label: "(UTC+08:00) Singapore", value: "Asia/Singapore" },
  { label: "(UTC+08:00) Perth", value: "Australia/Perth" },
  { label: "(UTC+09:00) Tokyo, Osaka, Sapporo", value: "Asia/Tokyo" },
  { label: "(UTC+09:00) Seoul", value: "Asia/Seoul" },
  { label: "(UTC+09:30) Adelaide", value: "Australia/Adelaide" },
  { label: "(UTC+10:00) Sydney, Melbourne, Brisbane", value: "Australia/Sydney" },
  { label: "(UTC+11:00) Solomon Islands, New Caledonia", value: "Pacific/Guadalcanal" },
  { label: "(UTC+12:00) Auckland, Wellington", value: "Pacific/Auckland" },
  { label: "(UTC+12:00) Fiji", value: "Pacific/Fiji" },
];

function CreateAutomationDialog({ onClose, onCreate, onSave, initialTask, suggestion }: {
  onClose: () => void;
  onCreate?: (task: ScheduledTask) => void;
  onSave?: (task: ScheduledTask) => void;
  initialTask?: ScheduledTask;
  suggestion?: { title: string; triggerType: string } | null;
}) {
  const isEdit = !!initialTask;
  const [title, setTitle] = React.useState(initialTask?.title ?? suggestion?.title ?? "");
  const [instructions, setInstructions] = React.useState(initialTask?.prompt ?? "");
  const [triggerType, setTriggerType] = React.useState<"schedule" | "file_arrival" | "table_update" | "continuous" | "model_update" | "model_training" | "job_completion">((initialTask?.triggerType ?? suggestion?.triggerType as any) ?? "schedule");
  const [frequency, setFrequency] = React.useState<typeof FREQUENCY_OPTIONS[number]>("Week");
  const [day, setDay] = React.useState<typeof DAY_OPTIONS[number]>("Monday");
  const [hour, setHour] = React.useState("09");
  const [minute, setMinute] = React.useState("00");
  const [timezone, setTimezone] = React.useState("America/Denver");
  const [tzPickerOpen, setTzPickerOpen] = React.useState(false);
  const [tzSearch, setTzSearch] = React.useState("");
  const [tables, setTables] = React.useState<string[]>(initialTask?.triggerType === "table_update" ? initialTask.schedule.split(", ") : [""]);
  const [tableCondition, setTableCondition] = React.useState<"all" | "any">("all");
  const [modelName, setModelName] = React.useState(initialTask?.triggerType === "model_training" ? initialTask.schedule : "");
  const [modelEvent, setModelEvent] = React.useState<"version_ready" | "alias_set">("version_ready");
  const [jobs, setJobs] = React.useState<string[]>([""]);
  const [jobSearchOpen, setJobSearchOpen] = React.useState<number | null>(null);
  const [jobSearch, setJobSearch] = React.useState("");
  const jobSearchRef = React.useRef<HTMLDivElement>(null);
  const [notifEmail, setNotifEmail] = React.useState("");
  const [notifEnabled, setNotifEnabled] = React.useState(false);
  const [notifOnStart, setNotifOnStart] = React.useState(false);
  const [notifOnSuccess, setNotifOnSuccess] = React.useState(false);
  const [notifOnFailure, setNotifOnFailure] = React.useState(true);
  const tzRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!tzPickerOpen) return;
    const handler = (e: MouseEvent) => { if (tzRef.current && !tzRef.current.contains(e.target as Node)) setTzPickerOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tzPickerOpen]);

  React.useEffect(() => {
    if (jobSearchOpen === null) return;
    const handler = (e: MouseEvent) => { if (jobSearchRef.current && !jobSearchRef.current.contains(e.target as Node)) setJobSearchOpen(null); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [jobSearchOpen]);

  const selectedTz = TIMEZONE_OPTIONS.find((t) => t.value === timezone) ?? TIMEZONE_OPTIONS[6];
  const filteredTz = TIMEZONE_OPTIONS.filter((t) => t.label.toLowerCase().includes(tzSearch.toLowerCase()));

  const scheduleLabel = frequency === "Day"
    ? `Daily ${hour}:${minute}`
    : frequency === "Week"
    ? `Every ${day.slice(0, 3)} ${hour}:${minute}`
    : `Monthly ${hour}:${minute}`;

  function handleSubmit() {
    if (!title.trim()) return;
    if (isEdit && onSave && initialTask) {
      onSave({ ...initialTask, title: title.trim(), prompt: instructions, schedule: scheduleLabel });
    } else if (!isEdit && onCreate) {
      const newTask: ScheduledTask = {
        id: `t${Date.now()}`,
        title: title.trim(),
        prompt: instructions,
        schedule: scheduleLabel,
        lastRun: "Never",
        status: "success",
        triggerType: "schedule",
        enabled: true,
      };
      onCreate(newTask);
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative w-[560px] rounded-lg bg-background-primary shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-title3 font-semibold text-text-primary">{isEdit ? "Edit automation" : "Create automation"}</h2>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <Icon name="closeSmallIcon" size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-md px-6 pb-6">
          {/* Title */}
          <div className="flex flex-col gap-xs">
            <label className="text-paragraph font-medium text-text-primary">Title</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=""
              className="rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
            />
          </div>

          {/* Prompt */}
          <div className="flex flex-col gap-xs">
            <label className="text-paragraph font-medium text-text-primary">Prompt</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              placeholder="e.g. Re-run all dashboard queries and send a Slack summary to #data-ops every Monday morning"
              className="resize-none rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
            />
          </div>


          {/* Trigger */}
          <div className="flex flex-col gap-sm">
            <label className="text-paragraph font-medium text-text-primary">Trigger</label>
            <div className="relative">
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
                className="h-9 w-full appearance-none rounded-sm border border-border bg-background-primary px-3 py-2 pr-8 text-paragraph text-text-primary outline-none focus:border-action-default-border-focus"
              >
                <option value="schedule">Scheduled</option>
                <option value="file_arrival">File arrival</option>
                <option value="table_update">Table update</option>
                <option value="continuous">Continuous</option>
                <option value="model_update">Model update</option>
              <option value="model_training">Model training</option>
              <option value="job_completion">Job / pipeline completion</option>
              </select>
              <Icon name="chevronDownIcon" size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            </div>
            {triggerType === "schedule" && (
              <div className="flex flex-col gap-sm">
                {/* Line 1: Every [frequency] [day?] at [HH] : [MM] */}
                <div className="flex items-center gap-sm">
                  <span className="shrink-0 text-paragraph text-text-secondary">Every</span>
                  <div className="relative">
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as typeof FREQUENCY_OPTIONS[number])}
                      className="appearance-none rounded-sm border border-border bg-background-primary py-2 pl-3 pr-7 text-paragraph text-text-primary outline-none focus:border-action-default-border-focus"
                    >
                      {FREQUENCY_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                    </select>
                    <Icon name="chevronDownIcon" size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary" />
                  </div>
                  {frequency === "Week" && (
                    <div className="relative">
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value as typeof DAY_OPTIONS[number])}
                        className="appearance-none rounded-sm border border-border bg-background-primary py-2 pl-3 pr-7 text-paragraph text-text-primary outline-none focus:border-action-default-border-focus"
                      >
                        {DAY_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <Icon name="chevronDownIcon" size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary" />
                    </div>
                  )}
                  <span className="shrink-0 text-paragraph text-text-secondary">at</span>
                  <div className="relative">
                    <select
                      value={hour}
                      onChange={(e) => setHour(e.target.value)}
                      className="appearance-none rounded-sm border border-border bg-background-primary py-2 pl-3 pr-7 text-paragraph text-text-primary outline-none focus:border-action-default-border-focus"
                    >
                      {HOUR_OPTIONS.map((h) => <option key={h}>{h}</option>)}
                    </select>
                    <Icon name="chevronDownIcon" size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary" />
                  </div>
                  <span className="shrink-0 text-paragraph text-text-secondary">:</span>
                  <div className="relative">
                    <select
                      value={minute}
                      onChange={(e) => setMinute(e.target.value)}
                      className="appearance-none rounded-sm border border-border bg-background-primary py-2 pl-3 pr-7 text-paragraph text-text-primary outline-none focus:border-action-default-border-focus"
                    >
                      {MINUTE_OPTIONS.map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <Icon name="chevronDownIcon" size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary" />
                  </div>
                </div>
                {/* Line 2: Timezone selector */}
                <div className="relative" ref={tzRef}>
                  <button
                    type="button"
                    onClick={() => { setTzPickerOpen((v) => !v); setTzSearch(""); }}
                    className="flex w-full items-center gap-sm rounded-sm border border-border bg-background-primary px-3 py-2 text-left hover:border-action-default-border-hover"
                  >
                    <span className="shrink-0 text-hint text-text-secondary">Timezone</span>
                    <span className="flex-1 text-paragraph text-text-primary">{selectedTz.label}</span>
                    <Icon name="chevronDownIcon" size={12} className="shrink-0 text-text-secondary" />
                  </button>
                  {tzPickerOpen && (
                    <div className="absolute bottom-full left-0 right-0 z-50 mb-1 overflow-hidden rounded border border-border bg-background-primary shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)]">
                      <div className="flex items-center gap-xs border-b border-border px-3 py-2">
                        <Icon name="searchIcon" size={13} className="shrink-0 text-text-secondary" />
                        <input
                          autoFocus
                          type="text"
                          value={tzSearch}
                          onChange={(e) => setTzSearch(e.target.value)}
                          placeholder="Search timezones..."
                          className="flex-1 bg-transparent text-paragraph text-text-primary outline-none placeholder:text-text-placeholder"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {filteredTz.length === 0 ? (
                          <p className="px-3 py-3 text-paragraph text-text-secondary">No results</p>
                        ) : filteredTz.map((tz) => (
                          <button
                            key={tz.value}
                            type="button"
                            onClick={() => { setTimezone(tz.value); setTzPickerOpen(false); }}
                            className={cx("flex w-full items-center gap-sm px-3 py-2 text-left text-paragraph hover:bg-background-secondary", tz.value === timezone ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-primary")}
                          >
                            {tz.value === timezone && <Icon name="checkmarkIcon" size={12} className="shrink-0 text-action-tertiary-text-default" />}
                            {tz.value !== timezone && <span className="w-3 shrink-0" />}
                            {tz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {triggerType === "file_arrival" && (
              <div className="flex flex-col gap-md">
                <p className="text-paragraph text-text-secondary">File arrival triggers monitor cloud storage paths for new files. These paths are either Unity Catalog volumes or external locations managed through Unity Catalog.</p>
                {/* Storage location */}
                <div className="flex flex-col gap-xs">
                  <div className="flex items-center gap-xs">
                    <label className="text-paragraph font-medium text-text-primary">Storage location</label>
                    <Icon name="infoIcon" size={12} className="text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. '/Volumes/mycatalog/myschema/myvolume/path_within_volume/' or 's3://bucket/path/'"
                    className="rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
                  />
                </div>
              </div>
            )}
            {triggerType === "table_update" && (
              <div className="flex flex-col gap-md">
                {/* Tables */}
                <div className="flex flex-col gap-sm">
                  <label className="text-paragraph font-medium text-text-primary">Tables</label>
                  <div className="flex flex-col gap-sm">
                    {tables.map((table, i) => (
                      <div key={i} className="flex items-center gap-sm">
                        <input
                          type="text"
                          value={table}
                          onChange={(e) => setTables((prev) => prev.map((t, idx) => idx === i ? e.target.value : t))}
                          placeholder={'Table name (e.g. "mycatalog.myschema.mytable")'}
                          className="flex-1 rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
                        />
                        {tables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTables((prev) => prev.filter((_, idx) => idx !== i))}
                            className="shrink-0 text-text-secondary hover:text-action-danger-default-text-default"
                          >
                            <Icon name="trashIcon" size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <DefaultButton size="default" leadingIcon={<Icon name="plusIcon" size={12} />} onClick={() => setTables((prev) => [...prev, ""])}>
                      Add table
                    </DefaultButton>
                  </div>
                </div>
                {/* Trigger when — only shown when multiple tables */}
                {tables.length > 1 && (
                  <div className="flex flex-col gap-sm">
                    <label className="text-paragraph font-medium text-text-primary">Trigger when</label>
                    {(["all", "any"] as const).map((val) => (
                      <button key={val} type="button" onClick={() => setTableCondition(val)} className="flex items-center gap-sm text-left">
                        <span className={cx(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                          tableCondition === val ? "border-blue-600 bg-blue-600" : "border-border bg-background-primary",
                        )}>
                          {tableCondition === val && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-paragraph text-text-primary">{val === "all" ? "All tables are updated" : "Any table is updated"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {(triggerType === "model_update" || triggerType === "model_training") && (
              <div className="flex flex-col gap-md">
                {/* Model input */}
                <div className="flex flex-col gap-xs">
                  <label className="text-paragraph font-medium text-text-primary">Model</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder='Enter model name (e.g. "main.default.model")'
                    className="rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
                  />
                </div>
                {/* Events */}
                <div className="flex flex-col gap-sm">
                  <label className="text-paragraph font-medium text-text-primary">Events</label>
                  {(["version_ready", "alias_set"] as const).map((val) => (
                    <button key={val} type="button" onClick={() => setModelEvent(val)} className="flex items-start gap-sm text-left">
                      <span className={cx(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        modelEvent === val ? "border-blue-600 bg-blue-600" : "border-border bg-background-primary",
                      )}>
                        {modelEvent === val && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <div>
                        <p className="text-paragraph text-text-primary">{val === "version_ready" ? "Model version is ready" : "Model alias is set"}</p>
                        <p className="text-hint text-text-secondary">{val === "version_ready" ? "Triggers when a model version becomes ready" : "Triggers when specified aliases are set on a model version"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {triggerType === "job_completion" && (
              <div className="flex flex-col gap-sm">
                <label className="text-paragraph font-medium text-text-primary">Jobs / pipelines</label>
                <div className="flex flex-col gap-sm">
                  {jobs.map((job, i) => (
                    <div key={i} className="flex items-center gap-sm">
                      <div className="relative flex-1" ref={jobSearchOpen === i ? jobSearchRef : undefined}>
                        <input
                          type="text"
                          value={job}
                          onChange={(e) => {
                            setJobs((prev) => prev.map((j, idx) => idx === i ? e.target.value : j));
                            setJobSearch(e.target.value);
                            setJobSearchOpen(i);
                          }}
                          onFocus={() => { setJobSearchOpen(i); setJobSearch(job); }}
                          placeholder="Search jobs or pipelines..."
                          className="w-full rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary outline-none placeholder:text-text-placeholder focus:border-action-default-border-focus"
                        />
                        {jobSearchOpen === i && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded border border-border bg-background-primary shadow-[0px_4px_20px_0px_rgba(0,0,0,0.12)]">
                            <div className="flex items-center gap-xs border-b border-border px-3 py-2">
                              <Icon name="searchIcon" size={13} className="shrink-0 text-text-secondary" />
                              <input
                                autoFocus
                                type="text"
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent text-paragraph text-text-primary outline-none placeholder:text-text-placeholder"
                              />
                            </div>
                            <div className="max-h-[200px] overflow-y-auto">
                              {MOCK_JOBS.filter((j) => j.toLowerCase().includes(jobSearch.toLowerCase())).length === 0 ? (
                                <p className="px-3 py-3 text-paragraph text-text-secondary">No results</p>
                              ) : MOCK_JOBS.filter((j) => j.toLowerCase().includes(jobSearch.toLowerCase())).map((j) => (
                                <button
                                  key={j}
                                  type="button"
                                  onClick={() => {
                                    setJobs((prev) => prev.map((_, idx) => idx === i ? j : _));
                                    setJobSearchOpen(null);
                                  }}
                                  className={cx("flex w-full items-center gap-sm px-3 py-2 text-left text-paragraph hover:bg-background-secondary", job === j ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-primary")}
                                >
                                  {job === j && <Icon name="checkmarkIcon" size={12} className="shrink-0 text-action-tertiary-text-default" />}
                                  {job !== j && <span className="w-3 shrink-0" />}
                                  {j}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {jobs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setJobs((prev) => prev.filter((_, idx) => idx !== i))}
                          className="shrink-0 text-text-secondary hover:text-action-danger-default-text-default"
                        >
                          <Icon name="trashIcon" size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {triggerType === "continuous" && (
              <p className="text-paragraph text-text-secondary">This automation will run continuously as a streaming job.</p>
            )}
          </div>

          {/* Notification detail table — shown when enabled */}
          {notifEnabled && <div className="overflow-hidden rounded-sm border border-border">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_56px_56px_88px] items-center border-b border-border px-3 py-2">
              <span className="text-hint font-medium text-text-secondary">Destination</span>
              <span className="text-center text-hint font-medium text-text-secondary">Started</span>
              <span className="text-center text-hint font-medium text-text-secondary">Finished</span>
              <span className="text-center text-hint font-medium text-text-secondary">Needs attention</span>
            </div>
            {/* Email row */}
            <div className="grid grid-cols-[1fr_56px_56px_88px] items-center px-3 py-2">
              <div className="flex items-center gap-sm rounded-sm border border-border bg-background-primary px-2 py-1.5 focus-within:border-action-default-border-focus">
                <Icon name="MailIcon" size={13} className="shrink-0 text-text-secondary" />
                <input
                  type="email"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  placeholder="Type email here"
                  className="min-w-0 flex-1 bg-transparent text-hint text-text-primary outline-none placeholder:text-text-placeholder"
                />
              </div>
              {([
                [notifOnStart, setNotifOnStart],
                [notifOnSuccess, setNotifOnSuccess],
                [notifOnFailure, setNotifOnFailure],
              ] as [boolean, (v: boolean) => void][]).map(([checked, setter], i) => (
                <div key={i} className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setter(!checked)}
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>}

          {/* Actions */}
          <div className="flex items-center justify-between gap-sm pt-xs">
            {/* Notification checkbox */}
            <label className="flex cursor-pointer items-center gap-xs text-paragraph text-text-secondary">
              <input
                type="checkbox"
                checked={notifEnabled}
                onChange={() => setNotifEnabled((v) => !v)}
                className="h-4 w-4 cursor-pointer accent-blue-600"
              />
              Notify
            </label>
            <div className="flex items-center gap-sm">
              <DefaultButton size="default" onClick={onClose}>Cancel</DefaultButton>
              <PrimaryButton size="default" onClick={handleSubmit} disabled={!title.trim()}>{isEdit ? "Save" : "Create"}</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ScheduledTasksMainView({
  selectedTaskId,
  onTaskClick,
  state,
  onSetMainView,
  onRegisterRunThread,
  navigateToDetailTaskId,
}: {
  selectedTaskId: string | null;
  onTaskClick: (id: string) => void;
  state: ReturnType<typeof useGenieChatState>;
  onSetMainView: (view: MainView) => void;
  onRegisterRunThread?: (threadId: string, taskId: string) => void;
  navigateToDetailTaskId?: string | null;
}) {
  const router = useRouter();
  const [tasks, setTasks] = React.useState<ScheduledTask[]>(SCHEDULED_TASKS);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [detailTaskId, setDetailTaskId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSuggestion, setCreateSuggestion] = React.useState<{ title: string; triggerType: string } | null>(null);
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<("time-based" | "event-based")[]>([]);
  const filterRef = React.useRef<HTMLDivElement>(null);
  const [splitMenuOpen, setSplitMenuOpen] = React.useState(false);
  const splitMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => setOpenMenuId(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  React.useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  React.useEffect(() => {
    if (!splitMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (splitMenuRef.current && !splitMenuRef.current.contains(e.target as Node)) {
        setSplitMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [splitMenuOpen]);

  React.useEffect(() => {
    if (navigateToDetailTaskId) {
      setDetailTaskId(navigateToDetailTaskId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToDetailTaskId]);

  const detailTask = detailTaskId ? tasks.find((t) => t.id === detailTaskId) ?? null : null;

  function handleToggleEnabled(id: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  }

  function handleSave(updated: ScheduledTask) {
    setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  if (detailTask) {
    return <ScheduledTaskDetailView
      task={detailTask}
      onBack={() => setDetailTaskId(null)}
      onToggleEnabled={() => handleToggleEnabled(detailTask.id)}
      onSave={handleSave}
      onOpenRun={(threadId, label) => {
        state.injectThread(
          { id: threadId, label, status: "done", time: "now", subtitle: `Run of ${detailTask.title}`, parentLabel: detailTask.title },
          buildRunSteps(detailTask),
        );
        onRegisterRunThread?.(threadId, detailTask.id);
        onSetMainView("thread");
      }}
    />;
  }

  const triggerIcon = (t: ScheduledTask["triggerType"]) => {
    if (t === "schedule") return "clockIcon";
    return "lightningIcon";
  };
  const triggerLabel = (t: ScheduledTask["triggerType"]) => {
    if (t === "schedule") return "Time-based";
    return "Event-based";
  };

  function handleCreate(task: ScheduledTask) {
    setTasks((prev) => [...prev, task]);
    setCreateOpen(false);
    setDetailTaskId(task.id);
  }

  const FILTER_OPTIONS: { value: "time-based" | "event-based"; label: string }[] = [
    { value: "time-based", label: "Time-based" },
    { value: "event-based", label: "Event-based" },
  ];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const category = t.triggerType === "schedule" ? "time-based" : "event-based";
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(category);
    return matchesSearch && matchesFilter;
  });

  function toggleFilter(type: "time-based" | "event-based") {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((f) => f !== type) : [...prev, type]
    );
  }

  return (
    <>
      {createOpen && (
        <CreateAutomationDialog
          onClose={() => { setCreateOpen(false); setCreateSuggestion(null); }}
          onCreate={handleCreate}
          suggestion={createSuggestion}
        />
      )}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-md">
        <div className="mx-auto w-full max-w-[800px]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-sm bg-background-primary pt-6 pb-4">
          <h1 className="flex-1 text-title3 font-semibold text-text-primary">Automations</h1>
          {searchOpen ? (
            <div className="flex items-center gap-xs rounded-md border border-action-default-border-focus bg-background-primary px-2 py-1" style={{ width: 200 }}>
              <Icon name="searchIcon" size={14} className="shrink-0 text-text-secondary" />
              <input
                ref={searchInputRef}
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) { setSearchOpen(false); } }}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); } }}
                placeholder="Search tasks..."
                className="w-full bg-transparent text-paragraph text-text-primary outline-none placeholder:text-text-secondary"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="shrink-0 text-text-secondary hover:text-text-primary">
                  <Icon name="closeSmallIcon" size={14} />
                </button>
              )}
            </div>
          ) : (
            <IconButton
              aria-label="Search tasks"
              icon={<Icon name="searchIcon" size={14} />}
              size="small"
              tone="neutral"
              className="text-text-secondary"
              onClick={() => setSearchOpen(true)}
            />
          )}
          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              aria-label="Filter by type"
              onClick={() => setFilterOpen((v) => !v)}
              className={cx(
                "relative flex h-7 items-center gap-xs rounded px-2 text-hint font-medium transition-colors",
                activeFilters.length > 0
                  ? "bg-blue-100 text-action-tertiary-text-default hover:bg-blue-200"
                  : "text-text-secondary hover:bg-action-default-background-hover hover:text-text-primary",
              )}
            >
              <Icon name="filterIcon" size={14} />
              {activeFilters.length > 0 && (
                <span className="text-action-tertiary-text-default">{activeFilters.length}</span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-8 z-50 min-w-[188px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]">
                <p className="px-3 py-1.5 text-hint font-semibold text-text-secondary uppercase tracking-wide">Filter by type</p>
                {FILTER_OPTIONS.map(({ value, label }) => {
                  const active = activeFilters.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleFilter(value)}
                      className="flex w-full items-center gap-sm px-3 py-1.5 text-left text-paragraph text-text-primary hover:bg-background-secondary"
                    >
                      <span className={cx(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        active ? "border-action-primary-background-default bg-action-primary-background-default" : "border-border",
                      )}>
                        {active && <Icon name="checkIcon" size={10} className="text-white" />}
                      </span>
                      {label}
                    </button>
                  );
                })}
                {activeFilters.length > 0 && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={() => setActiveFilters([])}
                      className="flex w-full items-center gap-sm px-3 py-1.5 text-left text-paragraph text-action-tertiary-text-default hover:bg-background-secondary"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Split button: Create (dialog) + chevron (Create in chat) */}
          <div className="relative flex" ref={splitMenuRef}>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-7 items-center gap-xs rounded-l px-3 text-hint font-medium text-action-primary-text-default bg-action-primary-background-default hover:bg-action-primary-background-hover transition-colors"
            >
              <Icon name="plusIcon" size={12} />
              Create
            </button>
            <button
              type="button"
              aria-label="More create options"
              onClick={() => setSplitMenuOpen((v) => !v)}
              className="flex h-7 w-6 items-center justify-center rounded-r border-l border-action-primary-background-hover bg-action-primary-background-default text-action-primary-text-default hover:bg-action-primary-background-hover transition-colors"
            >
              <Icon name="chevronDownIcon" size={12} />
            </button>
            {splitMenuOpen && (
              <div className="absolute right-0 top-8 z-50 min-w-[160px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => {
                    setSplitMenuOpen(false);
                    const threadId = `create-automation-${Date.now()}`;
                    state.injectThread(
                      { id: threadId, label: "Create a new automation", status: "done", time: "now", subtitle: "New automation" },
                      [
                        { type: "user", id: `${threadId}-user`, text: "Create a new automation" },
                        { type: "assistant-text", id: `${threadId}-response`, text: "", nodes: (
                          <>
                            <p>I can help you set up a new automation. Automations can run in two ways:</p>
                            <div className="flex flex-col gap-xs">
                              <p className="font-medium text-text-primary">Time-based</p>
                              <p className="text-text-secondary">Runs on a schedule you define. For example:</p>
                              <ul className="ml-4 flex list-disc flex-col gap-xs text-text-secondary">
                                <li>Every Monday at 9:00 AM</li>
                                <li>Daily at 6:00 AM</li>
                                <li>Every Friday at 5:00 PM</li>
                              </ul>
                            </div>
                            <div className="flex flex-col gap-xs">
                              <p className="font-medium text-text-primary">Event-based</p>
                              <p className="text-text-secondary">Triggered when something happens in your workspace:</p>
                              <ul className="ml-4 flex list-disc flex-col gap-xs text-text-secondary">
                                <li><span className="font-medium text-text-primary">Table update</span> — runs when a specific Unity Catalog table is updated</li>
                                <li><span className="font-medium text-text-primary">File arrival</span> — runs when a new file lands in a volume or external location</li>
                                <li><span className="font-medium text-text-primary">Job / pipeline completion</span> — runs after a Databricks job or pipeline finishes</li>
                                <li><span className="font-medium text-text-primary">Model training</span> — runs when a model training job completes</li>
                              </ul>
                            </div>
                            <p>To get started, tell me:</p>
                            <ol className="ml-4 flex list-decimal flex-col gap-xs">
                              <li><span className="font-medium">Name</span> — what should this automation be called?</li>
                              <li><span className="font-medium">What it should do</span> — what question or task should it run each time?</li>
                              <li><span className="font-medium">How to trigger it</span> — time-based schedule, or one of the events above?</li>
                            </ol>
                          </>
                        )},
                      ]
                    );
                    onSetMainView("thread");
                  }}
                  className="flex w-full items-center gap-sm px-3 py-1.5 text-left text-paragraph text-text-primary hover:bg-background-secondary"
                >
                  <Icon name="newThreadIcon" size={14} className="text-text-secondary" />
                  Create in chat
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="py-4">
          <div>
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Icon name="clockIcon" size={32} className="text-text-placeholder" />
              {tasks.length === 0 ? (
                <>
                  <p className="text-paragraph font-medium text-text-primary">No automations yet</p>
                  <p className="text-paragraph text-text-secondary">Run Genie Code tasks on a schedule or in response to events.</p>
                  <PrimaryButton size="default" onClick={() => setCreateOpen(true)}>Create automation</PrimaryButton>
                </>
              ) : (
                <>
                  <p className="text-paragraph font-medium text-text-primary">No matching automations</p>
                  <p className="text-paragraph text-text-secondary">Try adjusting your filters or search query.</p>
                  <DefaultButton size="default" onClick={() => { setActiveFilters([]); setSearchQuery(""); }}>Clear filters</DefaultButton>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setDetailTaskId(task.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setDetailTaskId(task.id); }}
                    className={cx(
                      "flex w-full cursor-pointer items-center gap-sm rounded-md border px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "border-action-default-border-focus bg-action-default-background-hover"
                        : !task.enabled
                        ? "border-border bg-background-secondary hover:border-action-default-border-hover"
                        : "border-border bg-background-primary hover:border-action-default-border-hover",
                    )}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-background-tertiary" title={triggerLabel(task.triggerType)}>
                      <Icon name={triggerIcon(task.triggerType)} size={14} className="text-text-secondary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-xs">
                        <p className={cx("truncate text-paragraph font-medium", !task.enabled ? "text-text-secondary" : "text-text-primary")}>{task.title}</p>
                        {!task.enabled && (
                          <span className="shrink-0 rounded-sm bg-background-tertiary px-1.5 py-0.5 text-hint font-medium text-text-secondary">Paused</span>
                        )}
                      </div>
                      <p className="text-hint text-text-secondary">{task.schedule}{task.lastRun !== "Never" ? ` · Last run ${task.lastRun}` : ""}</p>
                    </div>
                    <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                      <IconButton
                        aria-label="More"
                        icon={<Icon name="overflowIcon" size={14} />}
                        size="small"
                        tone="neutral"
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId((prev) => (prev === task.id ? null : task.id)); }}
                      />
                      {openMenuId === task.id && (
                        <div className="absolute right-0 top-7 z-50 min-w-[180px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]">
                          {[
                            { icon: "playIcon", label: "Run now", danger: false },
                            { icon: "pencilIcon", label: task.triggerType !== "schedule" ? "Edit in job" : "Edit automation", danger: false },
                            { icon: "trashIcon", label: "Delete automation", danger: true },
                          ].map(({ icon, label, danger }) => (
                            <button
                              key={label}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                if (danger) { setTasks((prev) => prev.filter((t) => t.id !== task.id)); }
                                else if (label === "Edit in job") { router.push(`/workflows/${task.id}`); }
                              }}
                              className={cx("flex w-full items-center gap-sm px-3 py-1.5 text-left text-paragraph hover:bg-background-secondary", danger ? "text-action-danger-default-text-default" : "text-text-primary")}
                            >
                              <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={14} className={danger ? "text-action-danger-default-text-default" : "text-text-secondary"} />
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>

        {/* Suggested */}
        <div className="border-t border-border py-5">
          <p className="mb-3 text-title4 font-semibold text-text-primary">Suggested</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SUGGESTED_TASKS.map((task) => (
              <button
                key={task.title}
                type="button"
                onClick={() => {
                  if (task.triggerType === "schedule") {
                    setCreateSuggestion({ title: task.title, triggerType: task.triggerType });
                    setCreateOpen(true);
                  } else {
                    const threadId = `suggest-${task.triggerType}-${Date.now()}`;
                    const chatNodes: Record<string, { userText: string; nodes: React.ReactNode }> = {
                      table_update: {
                        userText: `Set up a "${task.title}" automation`,
                        nodes: (
                          <>
                            <p>I can set up a <span className="font-medium">Monitor data quality</span> automation that runs whenever a table is updated. This is an event-based automation triggered by a table update.</p>
                            <p>To configure it, I need a couple of details:</p>
                            <ol className="ml-4 flex list-decimal flex-col gap-xs">
                              <li><span className="font-medium">Which table?</span> — provide the full Unity Catalog path (e.g., <span className="font-mono text-hint">main.default.my_table</span>)</li>
                              <li><span className="font-medium">What to check</span> — should I look for nulls, duplicates, schema drift, or all of the above?</li>
                              <li><span className="font-medium">Where to send results</span> — Slack channel, email, or just save a report?</li>
                            </ol>
                            <p>Which table would you like to monitor?</p>
                          </>
                        ),
                      },
                      file_arrival: {
                        userText: `Set up a "${task.title}" automation`,
                        nodes: (
                          <>
                            <p>I can set up a <span className="font-medium">Generate EDA report</span> automation that runs whenever a new file arrives in a volume or external location. This is an event-based automation triggered by file arrival.</p>
                            <p>To configure it, I need a few details:</p>
                            <ol className="ml-4 flex list-decimal flex-col gap-xs">
                              <li><span className="font-medium">Which path to watch?</span> — provide the Unity Catalog volume or external location path (e.g., <span className="font-mono text-hint">/Volumes/main/default/landing/</span>)</li>
                              <li><span className="font-medium">File type</span> — CSV, Parquet, JSON, or any?</li>
                              <li><span className="font-medium">Where to save the report</span> — which notebook or folder should the EDA output go to?</li>
                            </ol>
                            <p>Which path should I watch for new files?</p>
                          </>
                        ),
                      },
                      model_training: {
                        userText: `Set up a "${task.title}" automation`,
                        nodes: (
                          <>
                            <p>I can set up a <span className="font-medium">Weekly model retraining</span> automation that triggers after a model training job completes. This is an event-based automation triggered by model training.</p>
                            <p>To configure it, I need a few details:</p>
                            <ol className="ml-4 flex list-decimal flex-col gap-xs">
                              <li><span className="font-medium">Which model?</span> — provide the model name or Unity Catalog path (e.g., <span className="font-mono text-hint">main.default.forecast_model</span>)</li>
                              <li><span className="font-medium">What to run after training</span> — evaluate against a holdout set, promote to staging, or run a comparison report?</li>
                              <li><span className="font-medium">Where to send results</span> — Slack, email, or MLflow?</li>
                            </ol>
                            <p>Which model should trigger this automation?</p>
                          </>
                        ),
                      },
                      job_completion: {
                        userText: `Set up a "${task.title}" automation`,
                        nodes: (
                          <>
                            <p>I can set up a <span className="font-medium">Quality check on pipeline</span> automation that runs whenever a job or pipeline finishes. This is an event-based automation triggered by job or pipeline completion.</p>
                            <p>To configure it, I need a few details:</p>
                            <ol className="ml-4 flex list-decimal flex-col gap-xs">
                              <li><span className="font-medium">Which job or pipeline?</span> — provide the job name or pipeline path (e.g., <span className="font-mono text-hint">data_engineering/silver_transform</span>)</li>
                              <li><span className="font-medium">What to check</span> — row counts, error rates, duration anomalies, or all?</li>
                              <li><span className="font-medium">Alert threshold</span> — should I notify only on failure, or also on slow runs?</li>
                            </ol>
                            <p>Which job or pipeline should trigger this check?</p>
                          </>
                        ),
                      },
                    };
                    const entry = chatNodes[task.triggerType];
                    if (!entry) return;
                    state.injectThread(
                      { id: threadId, label: entry.userText, status: "done", time: "now", subtitle: task.title },
                      [
                        { type: "user", id: `${threadId}-user`, text: entry.userText },
                        { type: "assistant-text", id: `${threadId}-response`, text: "", nodes: entry.nodes },
                      ]
                    );
                    onSetMainView("thread");
                  }
                }}
                className="flex items-start gap-sm rounded-md border border-border bg-background-primary p-3 text-left transition-colors hover:border-action-default-border-hover"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-background-secondary">
                  <Icon name={task.icon as Parameters<typeof Icon>[0]["name"]} size={14} className="text-text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-paragraph font-medium text-text-primary">{task.title}</p>
                  <p className="mt-0.5 text-hint text-text-secondary">{task.description}</p>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                  <Icon name="plusIcon" size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
        </div>{/* max-w-[800px] */}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Scheduled task detail view
// ---------------------------------------------------------------------------

const TASK_MOCK_RESPONSES: Record<string, string> = {
  t1: "I've re-run all 8 dashboard queries across the `sales`, `ops`, and `marketing` catalogs. All queries completed successfully. I sent a summary to **#data-ops** on Slack with row counts, any nulls detected, and a link back to the refreshed dashboards.",
  t2: "Scan complete across 12 key tables. Found **3 issues**: `orders.customer_id` has 0.4% null rate (within threshold), `events` table has 142 duplicate event IDs (flagged), and `products` schema added a new `sku_v2` column not in the baseline. No critical drift detected. Report saved to `data_quality_2026-05-18.md`.",
  t3: "Feature pipeline completed in 4m 32s. Retrained forecast model on the latest 90-day window — RMSE improved from 0.214 to 0.198. Model artifact saved to `models/forecast_v3_2026-05-11` and registered in MLflow. Ready for promotion to staging.",
};

function buildRunSteps(task: ScheduledTask): ChatStep[] {
  const response = TASK_MOCK_RESPONSES[task.id] ?? "Run completed successfully.";
  return [
    { type: "user", id: `${task.id}-user`, text: task.prompt },
    { type: "assistant-text", id: `${task.id}-response`, text: response },
  ];
}

const TASK_RUN_HISTORY: Record<string, Array<{ date: string; status: "pending" | "notified" | "failed" }>> = {
  t1: [
    { date: "Mon, May 11 at 8:00 AM", status: "notified" },
    { date: "Mon, May 4 at 8:00 AM", status: "notified" },
    { date: "Mon, Apr 28 at 8:00 AM", status: "failed" },
    { date: "Mon, Apr 21 at 8:00 AM", status: "notified" },
  ],
  t2: [
    { date: "Mon, May 11 at 2:57 PM", status: "pending" },
    { date: "Mon, May 11 at 9:02 AM", status: "notified" },
    { date: "Sun, May 10 at 9:02 AM", status: "notified" },
    { date: "Sat, May 9 at 9:01 AM", status: "notified" },
  ],
  t3: [
    { date: "Sun, May 11 at 11:00 PM", status: "failed" },
    { date: "Sun, May 4 at 11:00 PM", status: "notified" },
    { date: "Sun, Apr 27 at 11:00 PM", status: "notified" },
    { date: "Sun, Apr 20 at 11:00 PM", status: "notified" },
  ],
  t4: [
    { date: "Sun, May 18 at 1:12 PM", status: "pending" },
    { date: "Sun, May 18 at 9:00 AM", status: "notified" },
    { date: "Sat, May 17 at 9:00 AM", status: "notified" },
    { date: "Fri, May 16 at 9:03 AM", status: "notified" },
  ],
};

function ScheduledTaskDetailView({
  task,
  onBack,
  onToggleEnabled,
  onSave,
  onOpenRun,
}: {
  task: ScheduledTask;
  onBack: () => void;
  onToggleEnabled: () => void;
  onSave: (updated: ScheduledTask) => void;
  onOpenRun: (threadId: string, label: string) => void;
}) {
  const router = useRouter();
  const isEventBased = task.triggerType !== "schedule";
  const [runs, setRuns] = React.useState(TASK_RUN_HISTORY[task.id] ?? []);
  const handleRunNow = () => {
    const now = new Date();
    const label = now.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    setRuns((prev) => [{ date: label, status: "pending" as const }, ...prev]);
  };
  const enabled = task.enabled;
  const [overflowOpen, setOverflowOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [configOpen, setConfigOpen] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(true);
  const [instructionsOpen, setInstructionsOpen] = React.useState(true);
  const [connectorsOpen, setConnectorsOpen] = React.useState(true);
  const overflowRef = React.useRef<HTMLSpanElement>(null);
  const overflowMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (overflowMenuRef.current && !overflowMenuRef.current.contains(e.target as Node) && overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runStatusLabel = (s: "pending" | "notified" | "failed") =>
    s === "pending" ? "In progress" : s === "notified" ? "Notified" : "Failed";

  const runStatusIcon = (s: "pending" | "notified" | "failed") =>
    s === "pending" ? "clockIcon" : s === "notified" ? "notificationIcon" : "dangerSmallIcon";

  const runStatusColor = (s: "pending" | "notified" | "failed") =>
    s === "pending" ? "text-text-secondary" : s === "notified" ? "text-green-600" : "text-red-600";

  const nextRun = task.triggerType === "job_completion"
    ? `Next run on ${task.schedule} pipeline complete`
    : task.schedule.startsWith("Every Mon")
    ? "Next run Tue, May 12 at 8:00 AM"
    : task.schedule.startsWith("Daily")
    ? "Next run Tue, May 12 at 6:00 AM"
    : "Next run Sun, May 18 at 11:00 PM";

  const scheduleValue = (task.triggerType === "table_update" || task.triggerType === "model_training" || task.triggerType === "job_completion")
    ? task.schedule
    : task.schedule.startsWith("Every Mon")
    ? "Weekly on Mondays at 9 AM (UTC-07:00) America/Los_Angeles"
    : task.schedule.startsWith("Daily")
    ? "Daily at 6:00 AM (UTC-07:00) America/Los_Angeles"
    : "Weekly on Sundays at 11:00 PM (UTC-07:00) America/Los_Angeles";

  const instructions = task.prompt;

  const description = task.title === "Weekly dashboard refresh"
    ? "Refreshes all dashboard datasets and sends a Slack digest to the #data-ops channel."
    : task.title === "Ski resorts quality scan"
    ? "Scans main.2026_northeast.ski_resorts for nulls, duplicates, and schema drift."
    : task.title === "Forecast model retrain"
    ? "Kicks off the feature pipeline and retrains the forecast model every Sunday night."
    : task.title === "Pipeline monitoring"
    ? "Monitors the silver_transform pipeline for failures and anomalies. Alerts when job duration or error rate exceeds baseline thresholds."
    : task.prompt;

  return (
    <>
    {editOpen && (
      <CreateAutomationDialog
        onClose={() => setEditOpen(false)}
        initialTask={task}
        onSave={(updated) => { onSave(updated); setEditOpen(false); }}
      />
    )}
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-[800px] px-6 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-xs text-hint">
          <button type="button" onClick={onBack} className="text-action-tertiary-text-default hover:underline">
            Automations
          </button>
          <Icon name="chevronRightIcon" size={12} className="text-text-secondary" />
        </div>

        {/* Title row */}
        <div className="mb-1 flex items-center gap-sm">
          <h1 className="flex-1 text-title3 font-semibold text-text-primary">{task.title}</h1>
          <div className="relative">
            <span ref={overflowRef} className="inline-flex">
              <IconButton
                aria-label="More options"
                icon={<Icon name="overflowIcon" size={14} />}
                size="small"
                tone="neutral"
                onClick={() => setOverflowOpen((v) => !v)}
              />
            </span>
            {overflowOpen && (
              <div
                ref={overflowMenuRef}
                className="absolute right-0 top-8 z-50 min-w-[160px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]"
              >
                {[
                  { icon: "pencilIcon", label: isEventBased ? "Edit in job" : "Edit", danger: false },
                  { icon: "trashIcon", label: "Delete", danger: true },
                ].map(({ icon, label, danger }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setOverflowOpen(false);
                      if (label === "Edit") setEditOpen(true);
                      else if (label === "Edit in job") router.push(`/workflows/${task.id}`);
                    }}
                    className={cx("flex w-full items-center gap-sm px-2 py-1 text-left text-paragraph hover:bg-background-secondary", danger ? "text-action-danger-default-text-default" : "text-text-primary")}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className={danger ? "text-action-danger-default-text-default" : "text-text-secondary"} />
                    </span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <PrimaryButton size="small" leadingIcon={<Icon name="playIcon" size={12} />} onClick={handleRunNow}>Run now</PrimaryButton>
        </div>

        {/* Status + next run */}
        <div className="mb-3 flex items-center gap-sm">
          <span className={cx("flex items-center gap-xs text-hint font-medium", enabled ? "text-green-600" : "text-text-secondary")}>
            {enabled && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
            {enabled ? "Active" : "Paused"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => onToggleEnabled()}
            className={cx(
              "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors",
              enabled ? "bg-action-primary-background-default" : "bg-border-accessible",
            )}
          >
            <span className={cx("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform", enabled ? "translate-x-3.5" : "translate-x-0.5")} />
          </button>
          <span className="text-hint text-text-secondary">· {nextRun}</span>
        </div>

        {/* Description */}
        <p className="mb-6 text-paragraph text-text-secondary">{description}</p>

        {/* Configuration — collapsible card with subsections */}
        <div className="mb-3 rounded-md border border-border bg-background-primary">
          <button
            type="button"
            onClick={() => setConfigOpen((v) => !v)}
            className="flex h-11 w-full items-center px-4 text-left hover:bg-background-secondary rounded-t-md transition-colors"
          >
            <span className="flex-1 text-paragraph font-semibold text-text-primary">Configuration</span>
            {configOpen && (
              <DefaultButton
                size="small"
                leadingIcon={<Icon name="pencilIcon" size={12} />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (isEventBased) {
                    router.push(`/workflows/${task.id}`);
                  } else {
                    setEditOpen(true);
                  }
                }}
                className="mr-2"
              >
                {isEventBased ? "Edit in job" : "Edit"}
              </DefaultButton>
            )}
            <Icon name={configOpen ? "chevronDownIcon" : "chevronRightIcon"} size={16} className="shrink-0 text-text-secondary" />
          </button>
          {configOpen && (
            <div>
              {/* Schedule subsection */}
              <div>
                <button
                  type="button"
                  onClick={() => setScheduleOpen((v) => !v)}
                  className="flex w-full items-center gap-sm px-4 py-2.5 text-left"
                >
                  <Icon name={scheduleOpen ? "chevronDownIcon" : "chevronRightIcon"} size={12} className="shrink-0 text-text-secondary" />
                  <span className="flex-1 text-paragraph text-text-primary">{task.triggerType === "table_update" ? "Tables" : task.triggerType === "model_training" ? "Model" : "Trigger"}</span>
                </button>
                {scheduleOpen && (
                  <div className="px-4 pb-3 pt-0.5">
                    <p className="text-paragraph text-text-secondary">{scheduleValue}</p>
                  </div>
                )}
              </div>

              {/* Instructions subsection */}
              <div>
                <button
                  type="button"
                  onClick={() => setInstructionsOpen((v) => !v)}
                  className="flex w-full items-center gap-sm px-4 py-2.5 text-left"
                >
                  <Icon name={instructionsOpen ? "chevronDownIcon" : "chevronRightIcon"} size={12} className="shrink-0 text-text-secondary" />
                  <span className="flex-1 text-paragraph text-text-primary">Prompt</span>
                </button>
                {instructionsOpen && (
                  <div className="px-4 pb-3 pt-0.5">
                    <p className="text-paragraph text-text-secondary">{instructions}</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Run History — always expanded, no card wrapper */}
        <div className="mb-3 mt-lg">
          <p className="mb-2 text-paragraph font-semibold text-text-primary">Run History</p>
          {runs.length === 0 ? (
            <div className="flex items-center justify-center gap-xs rounded-md border border-dashed border-border px-4 py-4">
              <span className="text-paragraph text-text-secondary">No runs yet.</span>
              <button type="button" onClick={handleRunNow} className="text-paragraph text-action-tertiary-text-default hover:underline">Run now</button>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-background-primary divide-y divide-border">
              {runs.map((run, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpenRun(`run-${task.id}-${i}`, run.date)}
                  className="flex w-full items-center px-4 py-2.5 text-left hover:bg-background-secondary transition-colors"
                >
                  <span className="flex-1 text-paragraph text-text-primary">{run.date}</span>
                  {run.status === "pending" && (
                    <span className="flex items-center gap-xs text-hint font-medium text-text-secondary">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-text-secondary" />
                      In progress
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Customizations main view — tabbed wrapper for Skills and MCP servers
// ---------------------------------------------------------------------------

function CustomizationsMainView({
  activeTab,
  onTabChange,
  onSkillClick,
  selectedSkillFile,
  skills,
  scope,
  onScopeChange,
  selectedServerId,
  onServerClick,
  onConfigureMcpTools,
  onOpenAssistantInstructionsFile,
}: {
  activeTab: CustomizationsTab;
  onTabChange: (tab: CustomizationsTab) => void;
  onSkillClick: (file: string) => void;
  selectedSkillFile: string | null;
  skills: Skill[];
  scope: "user" | "workspace";
  onScopeChange: (s: "user" | "workspace") => void;
  selectedServerId: string | null;
  onServerClick: (id: string) => void;
  onConfigureMcpTools: (id: string) => void;
  onOpenAssistantInstructionsFile: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-md">
      <div className="mx-auto flex min-h-0 w-full max-w-[800px] min-w-0 flex-1 flex-col">
        {/* Tab bar */}
        <div className="flex shrink-0 items-center border-b border-border">
          {([["skills", "Skills & instructions"], ["connections", "MCP servers"]] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={cx(
                "border-b-2 px-1 pb-2 pt-3 text-paragraph transition-colors mr-6",
                activeTab === tab
                  ? "border-action-primary-background-default font-medium text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {activeTab === "skills" ? (
          <ToolsMainView
            onSkillClick={onSkillClick}
            selectedSkillFile={selectedSkillFile}
            skills={skills}
            scope={scope}
            onScopeChange={onScopeChange}
            onOpenAssistantInstructionsFile={onOpenAssistantInstructionsFile}
          />
        ) : (
          <ConnectionsMainView
            layout="drawer"
            selectedServerId={selectedServerId}
            onServerClick={onServerClick}
            onConfigureMcpTools={onConfigureMcpTools}
          />
        )}
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
  reviewedThreadIds = new Set(),
  onRenameActiveThread,
  onRenameThread,
  activeMainView,
  onSetMainView,
}: {
  threads: ReturnType<typeof useGenieChatState>["threads"];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  reviewedThreadIds?: Set<string>;
  onRenameActiveThread?: () => void;
  onRenameThread?: (id: string, newLabel: string) => void;
  activeMainView: MainView;
  onSetMainView: (view: MainView) => void;
}) {
  const setCollapsed = onCollapsedChange;
  const [width, setWidth] = React.useState(DEFAULT_NAV_WIDTH);
  const [searchActive, setSearchActive] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const isDragging = React.useRef(false);
  const [navMenuOpen, setNavMenuOpen] = React.useState(false);
  const [incognito, setIncognito] = React.useState(false);
  const navMenuRef = React.useRef<HTMLDivElement>(null);
  const navMenuBtnRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!navMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node) && navMenuBtnRef.current && !navMenuBtnRef.current.contains(e.target as Node)) {
        setNavMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [navMenuOpen]);
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

  if (collapsed) {
    return (
      <div className="flex h-full w-9 shrink-0 flex-col items-center border-r border-border py-2 gap-sm">
        <Tooltip label="Open sidebar" align="left">
          <IconButton
            aria-label="Expand thread panel"
            icon={<Icon name="sidebarClosedIcon" size={16} />}
            size="small"
            tone="neutral"
            onClick={() => setCollapsed(false)}
          />
        </Tooltip>
        <Tooltip label="New chat" align="left">
          <IconButton
            aria-label="New chat"
            icon={<Icon name="newThreadIcon" size={14} />}
            size="small"
            tone="neutral"
            onClick={() => { onNewChat(); onSetMainView("thread"); setCollapsed(false); }}
          />
        </Tooltip>
        <Tooltip label="Customizations" align="left">
          <IconButton
            aria-label="Customizations"
            icon={<Icon name="WrenchIcon" size={14} />}
            size="small"
            tone="neutral"
            className={activeMainView === "customizations" ? "!bg-background-tertiary" : ""}
            onClick={() => { onSetMainView(activeMainView === "customizations" ? "thread" : "customizations"); setCollapsed(false); }}
          />
        </Tooltip>
        <Tooltip label="Automations" align="left">
          <IconButton
            aria-label="Automations"
            icon={<Icon name="lightningIcon" size={14} />}
            size="small"
            tone="neutral"
            className={activeMainView === "scheduled" ? "!bg-background-tertiary" : ""}
            onClick={() => { onSetMainView("scheduled"); setCollapsed(false); }}
          />
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="relative flex h-full shrink-0 flex-col border-r border-border" style={{ width }}>
      {/* Header */}
      <div className="flex h-10 w-full min-w-0 shrink-0 items-center gap-xs px-3">
        <span className="min-w-0 flex-1 truncate text-paragraph font-semibold text-text-primary">Genie Code</span>
        <div className="relative flex shrink-0 items-center gap-xs">
          <Tooltip label="Close sidebar" align="right">
            <IconButton
              aria-label="Collapse thread panel"
              icon={<Icon name="sidebarOpenIcon" size={16} />}
              size="small"
              tone="neutral"
              onClick={() => setCollapsed(true)}
            />
          </Tooltip>
          <div className="relative">
            <span ref={navMenuBtnRef} className="inline-flex">
              <IconButton
                aria-label="More options"
                icon={<Icon name="overflowIcon" size={16} />}
                size="small"
                tone="neutral"
                onClick={() => setNavMenuOpen((v) => !v)}
              />
            </span>
            {navMenuOpen && (
              <div
                ref={navMenuRef}
                className="absolute left-0 top-8 z-50 min-w-[220px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]"
              >
                {[
                  { icon: "shareIcon", label: "Share" },
                  { icon: "BranchIcon", label: "Clone" },
                ].map(({ icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setNavMenuOpen(false)}
                    className="flex w-full items-center gap-sm px-3 py-2 text-left text-paragraph text-text-primary hover:bg-background-secondary"
                  >
                    <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className="shrink-0 text-text-secondary" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        {/* Quick actions */}
        <div className="flex flex-col px-2 pt-1">
          <button
            type="button"
            onClick={() => { onNewChat(); onSetMainView("thread"); }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-paragraph text-text-primary hover:bg-background-secondary"
          >
            <Icon name="newThreadIcon" size={14} className="shrink-0 text-text-secondary" />
            New chat
          </button>
          <button
            type="button"
            onClick={() => onSetMainView(activeMainView === "customizations" ? "thread" : "customizations")}
            className={cx(
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-paragraph hover:bg-background-secondary",
              activeMainView === "customizations" ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-primary",
            )}
          >
            <Icon name="WrenchIcon" size={14} className="shrink-0 text-text-secondary" />
            Customizations
          </button>
          <button
            type="button"
            onClick={() => onSetMainView("scheduled")}
            className={cx(
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-paragraph hover:bg-background-secondary",
              activeMainView === "scheduled" ? "bg-action-default-background-hover font-medium text-text-primary" : "text-text-primary",
            )}
          >
            <Icon name="lightningIcon" size={14} className="shrink-0 text-text-secondary" />
            Automations
          </button>
          {searchActive ? (
            <div className="mt-xs flex w-full items-center gap-2 rounded-md border border-[#1A6FCC] bg-background-secondary px-2 py-2">
              <Icon name="searchIcon" size={14} className="shrink-0 text-text-secondary" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchQuery("");
                    setSearchActive(false);
                  }
                }}
                onBlur={() => {
                  if (!searchQuery) setSearchActive(false);
                }}
                placeholder="Search chats..."
                className="min-w-0 flex-1 bg-transparent text-paragraph text-text-primary outline-none placeholder:text-text-secondary"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setSearchActive(false); }}
                  className="shrink-0 text-text-secondary hover:text-text-primary"
                >
                  <Icon name="closeIcon" size={12} />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setSearchActive(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
              className="mt-xs flex w-full items-center gap-2 rounded-md border border-transparent bg-background-secondary px-2 py-2 text-left text-paragraph text-text-secondary hover:border-border"
            >
              <Icon name="searchIcon" size={14} className="shrink-0" />
              Search chats
            </button>
          )}
        </div>

        {/* Thread list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <GenieChatThreadList
            threads={searchQuery ? threads.filter((t) => t.label.toLowerCase().includes(searchQuery.toLowerCase())) : threads}
            activeThreadId={activeMainView === "thread" ? activeThreadId : null}
            onSelect={(id) => { onSelect(id); onSetMainView("thread"); setSearchQuery(""); setSearchActive(false); }}
            reviewedThreadIds={reviewedThreadIds}
            onRenameActiveThread={onRenameActiveThread}
            onRenameThread={onRenameThread}
          />
        </div>
      </div>

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
  const router = useRouter();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-hint text-text-secondary">{asset.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DefaultButton size="small" leadingIcon={<Icon name="playIcon" size={12} />}>Run</DefaultButton>
          <DefaultButton size="small">Save</DefaultButton>
          <PrimaryButton size="small" onClick={() => router.push("/editor")}>View source →</PrimaryButton>
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
  const router = useRouter();
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
          <DefaultButton size="small">Share</DefaultButton>
          <PrimaryButton size="small" onClick={() => router.push("/editor")}>View source →</PrimaryButton>
        </div>
      </div>

      {/* Cells */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {/* Text cell */}
          <div className="shrink-0 rounded-md border border-border bg-background-primary p-4">
            <p className="mb-2 text-[15px] font-semibold leading-6 text-text-primary">Ski Resort EDA — Snowfall &amp; Revenue Analysis</p>
            <p className="mb-2 text-paragraph text-text-secondary">Exploratory analysis of ski resort operational data across the 2025–26 season, including:</p>
            <ul className="mb-2 flex flex-col gap-0.5 pl-4 text-paragraph text-text-secondary">
              <li>Snowfall trends and lift operations by resort</li>
              <li>Ticket sales volume and revenue by day type</li>
              <li>Visitor traffic vs. snowfall correlation</li>
              <li>6-month forecast using seasonal decomposition</li>
            </ul>
            <p className="text-paragraph text-text-secondary">
              <span className="font-semibold text-text-primary">Data Sources: </span>
              <code className="rounded bg-background-secondary px-1 text-hint">`ski_catalog.operations.ski_conditions`</code>
              {" · "}
              <code className="rounded bg-background-secondary px-1 text-hint">`ski_catalog.sales.ticket_sales`</code>
            </p>
          </div>

          {/* Code cell 1 — SQL */}
          <div className="shrink-0 overflow-hidden rounded-md border border-border bg-background-primary">
            <div className="flex h-8 items-center gap-2 border-b border-border px-2">
              <IconButton aria-label="Run" icon={<Icon name="playIcon" size={12} />} size="small" tone="neutral" className="text-green-600" />
              <span className="text-hint text-text-secondary">✓ 0.8s</span>
              <div className="flex-1" />
              <span className="rounded bg-background-secondary px-1.5 py-0.5 text-hint font-medium text-text-secondary">SQL</span>
              <IconButton aria-label="AI" icon={<Icon name="SparkleIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="Expand" icon={<Icon name="fullscreenIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="Delete" icon={<Icon name="closeIcon" size={12} />} size="small" tone="neutral" />
            </div>
            <div className="overflow-hidden p-3 font-mono text-[12px] leading-5">
              {[
                "%sql",
                "-- Aggregate snowfall and visitor counts by resort and month",
                "SELECT",
                "    resort,",
                "    DATE_TRUNC('month', date) AS month,",
                "    SUM(snowfall_in)          AS total_snowfall_in,",
                "    AVG(lifts_open)           AS avg_lifts_open,",
                "    SUM(visitors)             AS total_visitors",
                "FROM ski_catalog.operations.ski_conditions",
                "WHERE date >= '2025-11-01'",
                "GROUP BY resort, month",
                "ORDER BY resort, month",
              ].map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 shrink-0 select-none text-right text-text-secondary opacity-40">{line ? i + 1 : ""}</span>
                  <span className={cx(
                    "min-w-0 flex-1 whitespace-pre text-text-primary",
                    line.startsWith("--") && "text-text-secondary",
                    line.startsWith("%") && "text-[#7c3aed]",
                    (line.trim().startsWith("SELECT") || line.trim().startsWith("FROM") || line.trim().startsWith("WHERE") || line.trim().startsWith("GROUP") || line.trim().startsWith("ORDER")) && "text-blue-600",
                  )}>{line || " "}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code cell 2 — Python */}
          <div className="shrink-0 overflow-hidden rounded-md border border-border bg-background-primary">
            <div className="flex h-8 items-center gap-2 border-b border-border px-2">
              <IconButton aria-label="Run" icon={<Icon name="playIcon" size={12} />} size="small" tone="neutral" className="text-green-600" />
              <span className="text-hint text-text-secondary">✓ 1.2s</span>
              <div className="flex-1" />
              <span className="rounded bg-background-secondary px-1.5 py-0.5 text-hint font-medium text-text-secondary">Python</span>
              <IconButton aria-label="AI" icon={<Icon name="SparkleIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="Expand" icon={<Icon name="fullscreenIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={12} />} size="small" tone="neutral" />
              <IconButton aria-label="Delete" icon={<Icon name="closeIcon" size={12} />} size="small" tone="neutral" />
            </div>
            <div className="overflow-hidden p-3 font-mono text-[12px] leading-5">
              {[
                "import pandas as pd",
                "import matplotlib.pyplot as plt",
                "from statsmodels.tsa.seasonal import seasonal_decompose",
                "",
                "# Load query result into DataFrame",
                "df = spark.sql(\"SELECT * FROM ski_monthly\").toPandas()",
                "df['month'] = pd.to_datetime(df['month'])",
                "df = df.set_index('month').sort_index()",
                "",
                "# Run seasonal decomposition for visitor forecast",
                "result = seasonal_decompose(df['total_visitors'], model='additive', period=3)",
                "result.plot()",
                "plt.tight_layout()",
                "plt.show()",
              ].map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 shrink-0 select-none text-right text-text-secondary opacity-40">{line ? i + 1 : ""}</span>
                  <span className={cx(
                    "min-w-0 flex-1 whitespace-pre text-text-primary",
                    line.startsWith("#") && "text-text-secondary",
                    (line.startsWith("import") || line.startsWith("from")) && "text-[#7c3aed]",
                  )}>{line || " "}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard preview
// ---------------------------------------------------------------------------

function DashboardPreview({ activeThreadId }: { activeThreadId?: string | null }) {
  // Sparkline path helpers
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

  const StatCard = ({ id, label, value, sub, pts, color }: { id: string; label: string; value: string; sub: string; pts: number[]; color: string }) => (
    <button
      type="button"
      onClick={() => setSelectedWidget((w) => w === id ? null : id)}
      className={cx(
        "flex flex-col gap-2 rounded-lg border bg-background-primary p-4 text-left transition-colors",
        selectedWidget === id ? "border-action-default-border-focus ring-1 ring-action-default-border-focus" : "border-border hover:border-action-default-border-hover",
      )}
    >
      <span className="text-hint text-text-secondary">{label}</span>
      <span className="text-[22px] font-semibold leading-none text-text-primary">{value}</span>
      <Sparkline pts={pts} color={color} />
      <span className="text-hint text-text-secondary">{sub}</span>
    </button>
  );

  // Bar chart data — daily active users last 14 days
  const barData = [42, 38, 55, 60, 58, 72, 68, 80, 75, 84, 79, 88, 83, 92];
  const barMax = Math.max(...barData);

  // Engagement breakdown
  const engagementRows = [
    { label: "Query generation", pct: 48, count: "12,840" },
    { label: "Data exploration", pct: 28, count: "7,490" },
    { label: "Notebook authoring", pct: 14, count: "3,745" },
    { label: "Dashboard creation", pct: 10, count: "2,675" },
  ];

  // Top users table
  const topUsers = [
    { name: "sarah.chen@databricks.com", sessions: 142, queries: 894 },
    { name: "marcus.j@databricks.com", sessions: 118, queries: 762 },
    { name: "priya.r@databricks.com", sessions: 97, queries: 631 },
    { name: "thomas.w@databricks.com", sessions: 84, queries: 548 },
    { name: "aiko.t@databricks.com", sessions: 76, queries: 497 },
  ];

  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("Ski Resort Dashboard");
  const [activeDataset, setActiveDataset] = React.useState("ski_conditions");
  const [resultTab, setResultTab] = React.useState<"Result Table" | "Schema">("Result Table");
  const [dataSidebarTab, setDataSidebarTab] = React.useState<"datasets" | "catalog">("datasets");
  const [selectedWidget, setSelectedWidget] = React.useState<string | null>(null);

  const datasets = [
    { id: "ski_conditions", name: "ski_conditions" },
    { id: "lift_operations", name: "lift_operations" },
    { id: "ticket_sales", name: "ticket_sales" },
    { id: "snowfall_history", name: "snowfall_history" },
  ];

  const resultRows = [
    { date: "2024-01-15", resort: "Vail", snowfall_in: 8, lifts_open: 32, visitors: 4820 },
    { date: "2024-01-16", resort: "Breckenridge", snowfall_in: 5, lifts_open: 28, visitors: 3910 },
    { date: "2024-01-17", resort: "Aspen", snowfall_in: 12, lifts_open: 14, visitors: 2150 },
    { date: "2024-01-18", resort: "Vail", snowfall_in: 3, lifts_open: 35, visitors: 5200 },
    { date: "2024-01-19", resort: "Park City", snowfall_in: 6, lifts_open: 40, visitors: 6100 },
    { date: "2024-01-20", resort: "Breckenridge", snowfall_in: 9, lifts_open: 30, visitors: 4400 },
    { date: "2024-01-21", resort: "Aspen", snowfall_in: 2, lifts_open: 16, visitors: 2800 },
    { date: "2024-01-22", resort: "Vail", snowfall_in: 14, lifts_open: 31, visitors: 4650 },
    { date: "2024-01-23", resort: "Park City", snowfall_in: 7, lifts_open: 42, visitors: 6300 },
    { date: "2024-01-24", resort: "Breckenridge", snowfall_in: 4, lifts_open: 27, visitors: 3750 },
  ];

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Edit view header */}
      <div className="shrink-0 border-b border-border bg-background-primary">
        <div className="flex items-center gap-sm px-4 pt-3 pb-2">
          <span className="min-w-0 truncate text-title3 font-semibold text-text-primary">Ski Resort Dashboard</span>
          <button type="button" aria-label="Bookmark" className="shrink-0 text-text-secondary hover:text-text-primary">
            <Icon name="starIcon" size={16} />
          </button>
          <div className="flex-1" />
          <button type="button" aria-label="More options" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
            <Icon name="overflowIcon" size={16} />
          </button>
          <button type="button" className="flex shrink-0 items-center justify-center h-7 w-7 rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
            <Icon name="refreshIcon" size={14} />
          </button>
          <DefaultButton size="small" leadingIcon={<span className="inline-block h-2 w-2 shrink-0 rounded-full bg-green-500" />} menu className="min-w-0 max-w-[120px]">
            <span className="truncate">0 - Shared SQL Warehouse</span>
          </DefaultButton>
          <DefaultButton size="small" className="shrink-0">Publish</DefaultButton>
          <DefaultButton size="small" className="shrink-0" onClick={() => router.push("/dashboard/edit")}>Share</DefaultButton>
          <PrimaryButton size="small" className="shrink-0" onClick={() => router.push(`/dashboard/edit${activeThreadId ? `?thread=${activeThreadId}` : ""}`)}>View source →</PrimaryButton>
        </div>
        {/* Tabs */}
        <div className="flex items-end px-4">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "Data" ? "Ski Resort Dashboard" : "Data")}
            className={cx(
              "mr-2 flex items-center gap-xs pb-2 text-paragraph border-b-2 transition-colors",
              activeTab === "Data"
                ? "border-action-default-border-focus font-medium text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon name="tableIcon" size={14} />
            Data
          </button>
          <span className="mb-2 mr-2 h-4 w-px self-end bg-border" />
          <button type="button" className="mb-2 mr-3 flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
            <Icon name="filterIcon" size={12} />
          </button>
          {["Ski Resort Dashboard", "Executive Summary"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cx(
                "mr-sm flex items-center gap-xs pb-2 text-paragraph border-b-2 transition-colors",
                activeTab === tab
                  ? "border-action-default-border-focus font-medium text-text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {tab}
              {activeTab === tab && <Icon name="overflowIcon" size={12} className="text-text-secondary" />}
            </button>
          ))}
          <button type="button" className="pb-2 text-text-secondary hover:text-text-primary">
            <Icon name="plusIcon" size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      {activeTab === "Data" ? (
        <div className="flex min-h-0 flex-1">
          {/* Datasets + Catalog sidebar */}
          {(() => {
            const catalogGroups = [
              { label: "Active", count: 4, items: [
                { name: "unique_orders", icon: "tableIcon" },
                { name: "<dbtag1>always_highligh...", icon: "tableIcon" },
                { name: "order_details", icon: "tableIcon" },
                { name: "customers_100k", icon: "tableIcon" },
              ]},
              { label: "Recents", count: 3, items: [
                { name: "craigslist_vehicles", icon: "tableIcon" },
                { name: "bookings_profile_metrics", icon: "tableIcon" },
                { name: "sample_orders_daily_202...", icon: "tableIcon" },
              ]},
              { label: "Favorites", count: 8, items: [
                { name: "dim_orders", icon: "folderOutlinedIcon" },
                { name: "craigslist_vehicles", icon: "tableIcon" },
                { name: "car_prices", icon: "tableIcon" },
                { name: "kyle_gilbreath", icon: "notebookIcon" },
                { name: "kyle_g", icon: "databaseOutlinedIcon" },
                { name: "samples", icon: "databaseOutlinedIcon" },
                { name: "jason_messer", icon: "databaseOutlinedIcon" },
                { name: "dumpling_shop", icon: "databaseOutlinedIcon" },
              ]},
              { label: "My Data", count: null, items: [
                { name: "My Files", icon: "folderOutlinedIcon" },
              ]},
            ];
            return (
              <div className="flex w-[220px] shrink-0 flex-col overflow-hidden border-r border-border bg-background-secondary">
                {/* Sidebar header */}
                <div className="flex shrink-0 items-center justify-between px-3 py-2">
                  <span className="text-paragraph font-medium text-text-primary">Data</span>
                  <div className="flex items-center gap-xs">
                    <button type="button" className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                      <Icon name="refreshIcon" size={12} />
                    </button>
                    <button type="button" className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                      <Icon name="closeIcon" size={12} />
                    </button>
                  </div>
                </div>
                {/* Segmented control */}
                <div className="shrink-0 border-b border-border px-3 py-2">
                  <div className="flex rounded-sm border border-border bg-background-tertiary p-0.5">
                    {(["datasets", "catalog"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setDataSidebarTab(tab)}
                        className={cx(
                          "flex-1 rounded-[3px] px-2 py-0.5 text-hint transition-colors",
                          dataSidebarTab === tab
                            ? "bg-background-primary font-medium text-text-primary shadow-sm"
                            : "text-text-secondary hover:text-text-primary",
                        )}
                      >
                        {tab === "datasets" ? "Datasets" : "Catalog"}
                      </button>
                    ))}
                  </div>
                </div>

                {dataSidebarTab === "datasets" ? (
                  <>
                    <div className="min-h-0 flex-1 overflow-y-auto px-1 py-1">
                      {datasets.map((ds) => (
                        <button
                          key={ds.id}
                          type="button"
                          onClick={() => setActiveDataset(ds.id)}
                          className={cx(
                            "group flex w-full items-center gap-xs rounded-sm px-2 py-1.5 text-left text-paragraph",
                            activeDataset === ds.id
                              ? "bg-action-default-background-hover text-text-primary"
                              : "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
                          )}
                        >
                          <Icon name="tableIcon" size={14} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{ds.name}</span>
                          {activeDataset === ds.id && (
                            <Icon name="overflowHorizontalIcon" size={12} className="shrink-0 opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-1 border-t border-border px-2 py-2">
                      <button type="button" className="flex items-center gap-xs rounded-sm px-1 py-1.5 text-paragraph text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                        <Icon name="plusIcon" size={12} />
                        Add dataset
                      </button>
                      <button type="button" className="flex items-center gap-xs rounded-sm px-1 py-1.5 text-paragraph text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                        <Icon name="plusIcon" size={12} />
                        Add SQL dataset
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Search */}
                    <div className="flex shrink-0 items-center gap-xs border-b border-border px-2 py-2">
                      <div className="flex flex-1 items-center gap-xs rounded-sm border border-border bg-background-primary px-2 py-1">
                        <Icon name="searchIcon" size={12} className="shrink-0 text-text-secondary" />
                        <input type="text" placeholder="Type to search..." className="min-w-0 flex-1 bg-transparent text-hint text-text-primary placeholder:text-text-placeholder outline-none" />
                      </div>
                      <button type="button" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                        <Icon name="filterIcon" size={12} />
                      </button>
                    </div>
                    {/* For you / All pills */}
                    <div className="flex shrink-0 gap-xs px-3 py-2">
                      <button type="button" className="rounded-full border border-border bg-background-secondary px-3 py-0.5 text-hint font-medium text-text-primary">For you</button>
                      <button type="button" className="rounded-full border border-border px-3 py-0.5 text-hint text-text-secondary hover:bg-background-secondary">All</button>
                    </div>
                    {/* Tree */}
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      {catalogGroups.map((group) => (
                        <div key={group.label}>
                          <div className="flex items-center gap-xs px-3 py-1">
                            <Icon name="chevronDownIcon" size={12} className="text-text-secondary" />
                            <span className="text-hint text-text-secondary">{group.label}{group.count !== null ? ` (${group.count})` : ""}</span>
                          </div>
                          {group.items.map((item) => (
                            <button key={item.name} type="button" className="flex w-full items-center gap-xs pl-7 pr-3 py-1 text-left text-hint text-text-primary hover:bg-background-secondary">
                              <Icon name="chevronRightIcon" size={10} className="shrink-0 text-text-secondary" />
                              <Icon name={item.icon} size={14} className="shrink-0 text-text-secondary" />
                              <span className="min-w-0 flex-1 truncate">{item.name}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* SQL editor + results */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Editor toolbar */}
            <div className="flex shrink-0 items-center gap-sm border-b border-border px-3 py-2">
              <button type="button" className="flex items-center gap-xs rounded-md bg-action-primary-background-default px-3 py-1 text-paragraph font-medium text-action-primary-text-default hover:bg-action-primary-background-hover">
                <Icon name="playIcon" size={14} />
                Run
              </button>
              <span className="text-hint text-text-secondary">3 hours ago</span>
              <div className="flex-1" />
              <button type="button" className="flex items-center gap-xs text-hint text-action-tertiary-text-default hover:text-text-primary">
                <Icon name="SparkleIcon" size={12} />
                Edit
              </button>
            </div>

            {/* SQL editor */}
            <div className="shrink-0 border-b border-border bg-background-secondary px-4 py-3 font-mono text-hint">
              <span className="text-text-secondary">1</span>
              <span className="ml-3">
                <span className="text-blue-500">select</span>
                <span className="text-text-primary"> * </span>
                <span className="text-blue-500">from</span>
                <span className="text-orange-400"> ski_resort</span>
                <span className="text-text-primary">.</span>
                <span className="text-orange-400">conditions</span>
                <span className="text-text-primary">.</span>
                <span className="text-orange-400">{activeDataset}</span>
              </span>
            </div>

            {/* Add parameter */}
            <div className="shrink-0 border-b border-border px-3 py-2">
              <button type="button" className="flex items-center gap-xs rounded-md border border-border px-3 py-1 text-paragraph text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                <Icon name="plusIcon" size={12} />
                Add parameter
              </button>
            </div>

            {/* Result tabs + table */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-border px-3">
                <div className="flex items-end">
                  {(["Result Table", "Schema"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setResultTab(t)}
                      className={cx(
                        "mr-4 pb-2 pt-2 text-paragraph border-b-2 transition-colors",
                        resultTab === t
                          ? "border-action-default-border-focus font-medium text-text-primary"
                          : "border-transparent text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button type="button" className="flex items-center gap-xs rounded-md border border-border px-2 py-1 text-hint text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                  <Icon name="plusIcon" size={12} />
                  Add custom calculation
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <table className="w-full text-hint">
                  <thead className="sticky top-0 bg-background-primary">
                    <tr className="border-b border-border text-left text-text-secondary">
                      <th className="w-8 px-2 py-2 font-normal text-text-secondary" />
                      <th className="px-3 py-2 font-normal">
                        <div className="flex items-center gap-xs"><Icon name="calendarIcon" size={12} />date</div>
                      </th>
                      <th className="px-3 py-2 font-normal">
                        <div className="flex items-center gap-xs"><Icon name="LettersIcon" size={12} />resort</div>
                      </th>
                      <th className="px-3 py-2 font-normal text-right">
                        <div className="flex items-center justify-end gap-xs"><Icon name="NumbersIcon" size={12} />snowfall_in</div>
                      </th>
                      <th className="px-3 py-2 font-normal text-right">
                        <div className="flex items-center justify-end gap-xs"><Icon name="NumbersIcon" size={12} />lifts_open</div>
                      </th>
                      <th className="px-3 py-2 font-normal text-right">
                        <div className="flex items-center justify-end gap-xs"><Icon name="NumbersIcon" size={12} />visitors</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((row, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-background-secondary">
                        <td className="px-2 py-1.5 text-text-secondary">{i + 1}</td>
                        <td className="px-3 py-1.5 text-text-primary">{row.date}</td>
                        <td className="px-3 py-1.5 text-text-primary">{row.resort}</td>
                        <td className="px-3 py-1.5 text-right text-text-secondary">{row.snowfall_in}</td>
                        <td className="px-3 py-1.5 text-right text-text-secondary">{row.lifts_open}</td>
                        <td className="px-3 py-1.5 text-right text-text-secondary">{row.visitors.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard id="dau" label="Daily Active Users" value="2,847" sub="↑ 12% vs prior period" pts={dauPoints} color="#2272b4" />
              <StatCard id="wau" label="Weekly Active Users" value="9,214" sub="↑ 8% vs prior period" pts={wauPoints} color="#6b46c1" />
            </div>
            <button
              type="button"
              onClick={() => setSelectedWidget((w) => w === "bar" ? null : "bar")}
              className={cx("w-full rounded-lg border bg-background-primary p-4 text-left transition-colors", selectedWidget === "bar" ? "border-action-default-border-focus ring-1 ring-action-default-border-focus" : "border-border hover:border-action-default-border-hover")}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-paragraph font-medium text-text-primary">Daily Active Users — Last 14 Days</span>
                <span className="text-hint text-text-secondary">Jan 11 – Jan 24</span>
              </div>
              <div className="flex items-end gap-1" style={{ height: 100 }}>
                {barData.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-end">
                    <div className="w-full rounded-sm bg-[#2272b4] opacity-80" style={{ height: `${(v / barMax) * 100}px` }} />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-hint text-text-secondary">
                <span>Jan 11</span><span>Jan 17</span><span>Jan 24</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setSelectedWidget((w) => w === "engagement" ? null : "engagement")}
              className={cx("w-full rounded-lg border bg-background-primary p-4 text-left transition-colors", selectedWidget === "engagement" ? "border-action-default-border-focus ring-1 ring-action-default-border-focus" : "border-border hover:border-action-default-border-hover")}
            >
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
            </button>
            <button
              type="button"
              onClick={() => setSelectedWidget((w) => w === "topusers" ? null : "topusers")}
              className={cx("w-full rounded-lg border bg-background-primary p-4 text-left transition-colors", selectedWidget === "topusers" ? "border-action-default-border-focus ring-1 ring-action-default-border-focus" : "border-border hover:border-action-default-border-hover")}
            >
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
                      <td className="py-1.5 text-text-primary truncate max-w-[120px]">{u.name}</td>
                      <td className="py-1.5 text-right text-text-secondary">{u.sessions}</td>
                      <td className="py-1.5 text-right text-text-secondary">{u.queries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </button>
          </div>
        </div>

        {/* Widget config panel */}
        {selectedWidget && (
          <div className="flex w-[240px] shrink-0 flex-col overflow-y-auto border-l border-border bg-background-primary">
            {/* Panel header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <span className="text-paragraph font-semibold text-text-primary">Widget</span>
              <button type="button" onClick={() => setSelectedWidget(null)} className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
                <Icon name="closeIcon" size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-0 divide-y divide-border">
              {/* Widget checkboxes */}
              <div className="flex items-center gap-3 px-4 py-3">
                <label className="flex items-center gap-2 text-paragraph text-text-primary cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#2272b4]" />
                  Title
                </label>
                <label className="flex items-center gap-2 text-paragraph text-text-primary cursor-pointer">
                  <input type="checkbox" className="accent-[#2272b4]" />
                  Description
                </label>
              </div>

              {/* Dataset */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-paragraph font-semibold text-text-primary">Dataset</span>
                  <button type="button" className="text-hint text-action-tertiary-text-default hover:underline">Show filters</button>
                </div>
                <div className="flex items-center justify-between rounded-sm border border-border px-3 py-1.5 text-paragraph text-text-primary">
                  <span>unique_orders</span>
                  <Icon name="chevronDownIcon" size={14} className="text-text-secondary" />
                </div>
              </div>

              {/* Visualization */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <span className="text-paragraph font-semibold text-text-primary">Visualization</span>
                <div className="flex items-center justify-between rounded-sm border border-border px-3 py-1.5 text-paragraph text-text-primary">
                  <div className="flex items-center gap-xs">
                    <Icon name="chartBarIcon" size={16} className="text-[#2272b4]" />
                    <span>Bar</span>
                  </div>
                  <Icon name="chevronDownIcon" size={14} className="text-text-secondary" />
                </div>
              </div>

              {/* X axis */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-paragraph font-semibold text-text-primary">X axis</span>
                  <div className="flex items-center gap-xs">
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="overflowIcon" size={14} /></button>
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-sm bg-background-secondary px-3 py-1.5 text-paragraph text-text-primary">
                  <div className="flex items-center gap-xs">
                    <Icon name="calendarIcon" size={14} className="text-text-secondary" />
                    <span>MONTHLY(month)</span>
                  </div>
                  <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="closeSmallIcon" size={12} /></button>
                </div>
              </div>

              {/* Y axis */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-paragraph font-semibold text-text-primary">Y axis</span>
                  <div className="flex items-center gap-xs">
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="overflowIcon" size={14} /></button>
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-sm bg-background-secondary px-3 py-1.5 text-paragraph text-text-primary">
                  <div className="flex items-center gap-xs">
                    <Icon name="NumbersIcon" size={14} className="text-text-secondary" />
                    <span>SUM(count)</span>
                  </div>
                  <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="closeSmallIcon" size={12} /></button>
                </div>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-paragraph font-semibold text-text-primary">Color</span>
                  <div className="flex items-center gap-xs">
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="overflowIcon" size={14} /></button>
                    <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-sm bg-background-secondary px-3 py-1.5 text-paragraph text-text-primary">
                  <div className="flex items-center gap-xs">
                    <Icon name="LettersIcon" size={14} className="text-text-secondary" />
                    <span>category</span>
                  </div>
                  <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="closeSmallIcon" size={12} /></button>
                </div>
              </div>

              {/* Tooltip */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-paragraph font-semibold text-text-primary">Tooltip</span>
                <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
              </div>

              {/* Labels */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-paragraph font-semibold text-text-primary">Labels</span>
                <button type="button" className="flex h-5 w-9 items-center rounded-full bg-border px-0.5 transition-colors">
                  <span className="h-4 w-4 rounded-full bg-background-primary shadow-sm" />
                </button>
              </div>

              {/* Facet */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-paragraph font-semibold text-text-primary">Facet</span>
                <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
              </div>

              {/* Annotation */}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-paragraph font-semibold text-text-primary">Annotation</span>
                <button type="button" className="text-text-secondary hover:text-text-primary"><Icon name="plusIcon" size={14} /></button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}
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
  dashboard: [
    { kind: "context", text: `{` },
    { kind: "context", text: `  "datasets": [` },
    { kind: "add",     text: `+   { "name": "f555d3cd", "displayName": "unique_orders",` },
    { kind: "add",     text: `+     "queryLines": ["select * from dbdemos.dumpling_shop.unique_orders"] },` },
    { kind: "add",     text: `+   { "name": "b424d2aa", "displayName": "bookings",` },
    { kind: "add",     text: `+     "queryLines": ["select * from \`<dbtag1>always_highlighted_in_search_results?<dbtag1>\`.default.\`<dbtag1>always_highlighted?<dbtag1>\` limit 100"] },` },
    { kind: "add",     text: `+   { "name": "c8ca9c29", "displayName": "order_details",` },
    { kind: "add",     text: `+     "queryLines": ["SELECT * FROM dbdemos.dumpling_shop.order_details"] },` },
    { kind: "remove",  text: `-   { "name": "9b99d957", "displayName": "customers_50k",` },
    { kind: "remove",  text: `-     "queryLines": ["SELECT * FROM kyle_gilbreath.big_tables.customers_50k"] }` },
    { kind: "add",     text: `+   { "name": "9b99d957", "displayName": "customers_100k",` },
    { kind: "add",     text: `+     "queryLines": ["SELECT * FROM kyle_gilbreath.big_tables.customers_100k"] }` },
    { kind: "context", text: `  ],` },
    { kind: "context", text: `  "pages": [` },
    { kind: "context", text: `    { "name": "eb25f21c", "displayName": "This is a test page name",` },
    { kind: "add",     text: `+     "layout": [ { "widget": { "name": "996f7b68", "spec": { "widgetType": "bar" } } },` },
    { kind: "add",     text: `+                 { "widget": { "name": "b902e340", "spec": { "widgetType": "table" } } } ],` },
    { kind: "context", text: `      "pageType": "PAGE_TYPE_CANVAS" },` },
    { kind: "add",     text: `+   { "name": "a29f2c31", "displayName": "New Page 1",` },
    { kind: "add",     text: `+     "layout": [ { "widget": { "name": "0785390a", "multilineTextboxSpec": { "lines": ["# This is a new page"] } } } ],` },
    { kind: "add",     text: `+     "pageType": "PAGE_TYPE_CANVAS" }` },
    { kind: "context", text: `  ],` },
    { kind: "context", text: `  "uiSettings": { "theme": { "widgetHeaderAlignment": "ALIGNMENT_UNSPECIFIED" }, "applyModeEnabled": false }` },
    { kind: "context", text: `}` },
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
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex shrink-0 items-center text-text-secondary hover:text-text-primary"
        >
          <Icon name={open ? "chevronDownIcon" : "chevronRightIcon"} size={12} />
        </button>
        <Icon
          name={asset.kind === "notebook" ? "notebookIcon" : asset.kind === "dashboard" ? "dashboardIcon" : "fileCodeIcon"}
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
type McpPreviewTab = "Tools" | "Configuration";

function ScheduledTaskConfigPanel({ task }: { task: ScheduledTask }) {
  const statusLabel = task.status === "success" ? "Success" : task.status === "failed" ? "Failed" : "Running";
  const statusColor = task.status === "success" ? "text-green-600" : task.status === "failed" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-md border border-border bg-background-primary">
      {/* Status banner */}
      <div className="flex shrink-0 items-center gap-sm border-b border-border px-4 py-3">
        <span className={cx("h-2 w-2 shrink-0 rounded-full", task.status === "success" ? "bg-green-500" : task.status === "failed" ? "bg-red-500" : "bg-yellow-500")} />
        <span className={cx("text-hint font-medium", statusColor)}>{statusLabel}</span>
        <span className="text-hint text-text-secondary">· Last run {task.lastRun}</span>
      </div>

      {/* Config fields */}
      <div className="flex flex-col divide-y divide-border">
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Task name</span>
          <span className="text-paragraph text-text-primary">{task.title}</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Schedule</span>
          <span className="text-paragraph text-text-primary">{task.schedule}</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Trigger</span>
          <span className="text-paragraph text-text-primary">Time-based</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Notification</span>
          <span className="text-paragraph text-text-primary">On failure only</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-sm border-t border-border px-4 py-3 mt-auto">
        <DefaultButton size="small">Edit task</DefaultButton>
        <DefaultButton size="small">Run now</DefaultButton>
      </div>
    </div>
  );
}

function RightBrowserPanel({ kind, onClose, schemaExpanded, setSchemaExpanded, onOpenAsset }: {
  kind: "workspace" | "schema";
  onClose: () => void;
  schemaExpanded: string | null;
  setSchemaExpanded: (v: string | null) => void;
  onOpenAsset?: (asset: ReviewAsset) => void;
}) {
  return (
    <div className="flex h-full w-[200px] shrink-0 flex-col border-l border-border">
      {kind === "workspace" ? (
        <>
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
            <span className="text-hint font-medium text-text-primary">Workspace</span>
            <div className="flex items-center gap-xs">
              <button type="button" className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
                <Icon name="refreshIcon" size={12} />
              </button>
              <button type="button" onClick={onClose} className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
                <Icon name="closeIcon" size={12} />
              </button>
            </div>
          </div>
          <div className="shrink-0 border-b border-border px-2 py-1.5">
            <div className="flex items-center gap-xs rounded-sm border border-border bg-background-primary px-2 py-1">
              <Icon name="searchIcon" size={12} className="shrink-0 text-text-secondary" />
              <input type="text" placeholder="Search..." className="min-w-0 flex-1 bg-transparent text-hint text-text-primary placeholder:text-text-placeholder outline-none" />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-xs border-b border-border px-3 py-1.5 text-hint text-text-secondary">
            <Icon name="chevronLeftIcon" size={12} />
            <Icon name="folderOutlinedIcon" size={12} />
            <span className="truncate">Drafts</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            {WORKSPACE_FILES_CHAT.map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenAsset?.({ id: `workspace-${i}`, name: f.name, kind: f.kind })}
                className="flex w-full items-center gap-xs px-3 py-1.5 text-left text-hint text-text-primary hover:bg-background-secondary"
              >
                <Icon name={f.icon} size={14} className="shrink-0 text-text-secondary" />
                <span className="min-w-0 flex-1 truncate">{f.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
            <span className="text-hint font-medium text-text-primary">Catalog</span>
            <button type="button" onClick={onClose} className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary">
              <Icon name="closeIcon" size={12} />
            </button>
          </div>
          <div className="shrink-0 border-b border-border px-2 py-1.5">
            <div className="flex items-center gap-xs rounded-sm border border-border bg-background-primary px-2 py-1">
              <Icon name="searchIcon" size={12} className="shrink-0 text-text-secondary" />
              <input type="text" placeholder="Search tables..." className="min-w-0 flex-1 bg-transparent text-hint text-text-primary placeholder:text-text-placeholder outline-none" />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-1">
            {SCHEMA_TABLES_CHAT.map((t) => (
              <div key={t.name}>
                <button
                  type="button"
                  onClick={() => setSchemaExpanded(schemaExpanded === t.name ? null : t.name)}
                  className="flex w-full items-center gap-xs px-3 py-1.5 text-left text-hint text-text-primary hover:bg-background-secondary"
                >
                  <Icon name={schemaExpanded === t.name ? "chevronDownIcon" : "chevronRightIcon"} size={10} className="shrink-0 text-text-secondary" />
                  <Icon name="tableIcon" size={14} className="shrink-0 text-text-secondary" />
                  <span className="min-w-0 flex-1 truncate">{t.name}</span>
                </button>
                {schemaExpanded === t.name && t.cols.map((col) => (
                  <div key={col} className="flex items-center gap-xs py-1 pl-9 pr-3 text-hint text-text-secondary hover:bg-background-secondary">
                    <Icon name="NumbersIcon" size={12} className="shrink-0" />
                    <span className="truncate">{col}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PreviewPanel({
  onClose,
  selectedAsset,
  activeThreadId,
  initialWidth = DEFAULT_PREVIEW_WIDTH,
  initialBrowser = null,
  reviewAssets,
  openAssets,
  setOpenAssets,
  activeAssetId,
  setActiveAssetId,
  activeTab,
  setActiveTab,
  isReviewed = false,
  skillFile,
  onSkillSave,
  readOnly = false,
  mcpServer = null,
  scheduledTask = null,
}: {
  onClose: () => void;
  selectedAsset: ReviewAsset | null;
  activeThreadId: string | null;
  initialWidth?: number;
  initialBrowser?: "workspace" | "schema" | null;
  reviewAssets?: ReviewAsset[];
  openAssets: ReviewAsset[];
  setOpenAssets: (updater: ReviewAsset[] | ((prev: ReviewAsset[]) => ReviewAsset[])) => void;
  activeAssetId: string | null;
  setActiveAssetId: (id: string | null) => void;
  activeTab: PreviewTab;
  setActiveTab: (tab: PreviewTab) => void;
  isReviewed?: boolean;
  skillFile?: string | null;
  onSkillSave?: (file: string, content: string) => void;
  readOnly?: boolean;
  mcpServer?: McpServer | null;
  scheduledTask?: ScheduledTask | null;
}) {
  const [mcpTab, setMcpTab] = React.useState<McpPreviewTab>("Tools");
  const [mcpSearch, setMcpSearch] = React.useState("");
  const [mcpToolEnabled, setMcpToolEnabled] = React.useState<Record<string, boolean>>({});

  // Reset MCP state when server changes
  React.useEffect(() => {
    if (!mcpServer) return;
    setMcpTab("Tools");
    setMcpSearch("");
    setMcpToolEnabled(Object.fromEntries(mcpServer.tools.map((t) => [t.id, t.enabled])));
  }, [mcpServer?.id]);

  // Open or switch to asset tab when selectedAsset changes
  React.useEffect(() => {
    if (!selectedAsset) return;
    setOpenAssets((prev) => {
      if (prev.find((a) => a.id === selectedAsset.id)) return prev;
      return [...prev, selectedAsset];
    });
    setActiveAssetId(selectedAsset.id);
  }, [selectedAsset]);

  const [skillEditMode, setSkillEditMode] = React.useState(false);
  const [skillEditContent, setSkillEditContent] = React.useState<string>("");

  // Reset edit mode when skillFile changes
  React.useEffect(() => {
    setSkillEditMode(false);
    setSkillEditContent(skillFile ? (SKILL_FILE_CONTENT[skillFile] ?? `# ${skillFile}\n\nSkill file content not available.`) : "");
  }, [skillFile]);

  const activeAsset = openAssets.find((a) => a.id === activeAssetId) ?? null;

  const closeAssetTab = (id: string) => {
    setOpenAssets((prev) => {
      const next = prev.filter((a) => a.id !== id);
      if (activeAssetId === id) {
        setActiveAssetId(next.length > 0 ? next[next.length - 1]!.id : null);
      }
      return next;
    });
  };
  const [width, setWidth] = React.useState(initialWidth);
  const [rightBrowser, setRightBrowser] = React.useState<"workspace" | "schema" | null>(initialBrowser);
  const workspaceBrowserOpen = rightBrowser === "workspace";
  const toggleWorkspace = () => setRightBrowser((v) => v === "workspace" ? null : "workspace");
  const toggleSchema = () => setRightBrowser((v) => v === "schema" ? null : "schema");
  const [schemaExpanded, setSchemaExpanded] = React.useState<string | null>("ski_conditions");
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
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize z-10"
      />
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center gap-xs pr-3">
        {/* Tabs / skill title */}
        <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
          {scheduledTask ? (
            <span className="truncate pl-3 text-paragraph font-medium text-text-primary">{scheduledTask.title}</span>
          ) : mcpServer ? (
            (["Tools", "Configuration"] as McpPreviewTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMcpTab(tab)}
                className={cx(
                  "flex h-7 shrink-0 items-center justify-center rounded-md px-3 text-paragraph",
                  mcpTab === tab
                    ? "bg-action-default-background-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-action-default-background-hover",
                )}
              >
                {tab}
              </button>
            ))
          ) : skillFile ? (
            <span className="truncate pl-3 text-paragraph font-medium text-text-primary">{skillFile.replace(".md", "")}</span>
          ) : (
            (["Assets", "Review"] as PreviewTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cx(
                  "flex h-7 shrink-0 items-center justify-center rounded-md px-3 text-paragraph",
                  activeTab === tab
                    ? "bg-action-default-background-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-action-default-background-hover",
                )}
              >
                {tab}
              </button>
            ))
          )}
          {/* Fade-out mask */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-background-primary" />
        </div>
        {/* Right actions */}
        {scheduledTask ? (
          <div className="flex shrink-0 items-center gap-xs">
            <IconButton
              aria-label="Close preview panel"
              icon={<Icon name="closeIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={onClose}
            />
          </div>
        ) : skillFile ? (
          <div className="flex shrink-0 items-center gap-xs">
            {skillEditMode ? (
              <PrimaryButton
                size="small"
                onClick={() => {
                  onSkillSave?.(skillFile, skillEditContent);
                  setSkillEditMode(false);
                }}
              >
                Save file
              </PrimaryButton>
            ) : !readOnly ? (
              <DefaultButton
                size="small"
                leadingIcon={<Icon name="pencilIcon" size={12} />}
                onClick={() => setSkillEditMode(true)}
              >
                Edit file
              </DefaultButton>
            ) : null}
            <IconButton
              aria-label="Close preview panel"
              icon={<Icon name="closeIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={onClose}
            />
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-xs">
            {activeTab === "Assets" && (
              <>
                <IconButton
                  aria-label="Browse workspace files"
                  icon={<Icon name="folderOutlinedIcon" size={14} />}
                  size="small"
                  tone="neutral"
                  className={rightBrowser === "workspace" ? "!bg-background-tertiary" : ""}
                  onClick={toggleWorkspace}
                />
                <IconButton
                  aria-label="Browse data catalog"
                  icon={<span className="inline-flex -scale-x-100"><Icon name="catalogShapesIcon" size={14} /></span>}
                  size="small"
                  tone="neutral"
                  className={rightBrowser === "schema" ? "!bg-background-tertiary" : ""}
                  onClick={toggleSchema}
                />
              </>
            )}
            <Tooltip label="Close preview panel" align="right">
              <IconButton
                aria-label="Close preview panel"
                icon={
                  <span className="inline-flex rotate-180">
                    <Icon name="sidebarOpenIcon" size={16} />
                  </span>
                }
                size="small"
                tone="neutral"
                onClick={onClose}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* Pane */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-3 pr-3 pl-0">
        {scheduledTask ? (
          <ScheduledTaskConfigPanel task={scheduledTask} />
        ) : mcpServer ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-background-primary">
            {mcpTab === "Tools" ? (
              <>
                {/* Search + count */}
                <div className="flex shrink-0 items-center gap-xs border-b border-border px-3 py-2">
                  <div className="flex min-w-0 flex-1 items-center gap-xs rounded-sm border border-border px-2 py-1">
                    <Icon name="searchIcon" size={12} className="shrink-0 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={mcpSearch}
                      onChange={(e) => setMcpSearch(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-hint text-text-primary placeholder:text-text-placeholder outline-none"
                    />
                  </div>
                  <span className="shrink-0 text-hint text-text-secondary">
                    {mcpServer.tools.filter((t) => mcpToolEnabled[t.id] ?? t.enabled).length}/{mcpServer.tools.length} on
                  </span>
                </div>
                {/* Tool list */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {mcpServer.tools
                    .filter((t) => !mcpSearch || t.name.toLowerCase().includes(mcpSearch.toLowerCase()) || t.description.toLowerCase().includes(mcpSearch.toLowerCase()))
                    .map((tool) => (
                      <div key={tool.id} className="flex items-start gap-sm border-b border-border px-3 py-2.5 last:border-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-hint font-medium text-text-primary" style={{ fontFamily: "monospace" }}>{tool.name}</p>
                          <p className="mt-0.5 text-hint text-text-secondary">{tool.description}</p>
                        </div>
                        <McpToggle
                          checked={mcpToolEnabled[tool.id] ?? tool.enabled}
                          onChange={(v) => setMcpToolEnabled((prev) => ({ ...prev, [tool.id]: v }))}
                        />
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col divide-y divide-border overflow-y-auto">
                <div className="flex flex-col gap-xs px-4 py-3">
                  <span className="text-hint text-text-secondary">Name</span>
                  <span className="text-paragraph text-text-primary">{mcpServer.name}</span>
                </div>
                <div className="flex flex-col gap-xs px-4 py-3">
                  <span className="text-hint text-text-secondary">Transport</span>
                  <span className="text-paragraph text-text-primary">stdio</span>
                </div>
                <div className="flex flex-col gap-xs px-4 py-3">
                  <span className="text-hint text-text-secondary">Status</span>
                  <span className="text-paragraph text-green-600">Connected</span>
                </div>
                <div className="flex flex-col gap-xs px-4 py-3">
                  <span className="text-hint text-text-secondary">Tools</span>
                  <span className="text-paragraph text-text-primary">
                    {mcpServer.tools.filter((t) => mcpToolEnabled[t.id] ?? t.enabled).length} of {mcpServer.tools.length} enabled
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : skillFile ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-background-primary">
            {skillEditMode ? (
              <textarea
                className="min-h-0 flex-1 resize-none bg-background-primary px-6 py-5 font-mono text-paragraph text-text-primary outline-none"
                value={skillEditContent}
                onChange={(e) => setSkillEditContent(e.target.value)}
                spellCheck={false}
              />
            ) : (
              <SkillFileViewer skillFile={skillFile} content={skillEditContent} />
            )}
          </div>
        ) : activeTab === "Review" ? (
          reviewAssets && reviewAssets.length > 0 && !isReviewed ? (
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
          <div className="flex min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border bg-background-primary">
            {/* Main asset area */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
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
                <DashboardPreview activeThreadId={activeThreadId} />
              ) : activeAsset?.kind === "file" ? (
                <PythonFilePreview asset={activeAsset} />
              ) : activeAsset ? (
                <NotebookPreview asset={activeAsset} />
              ) : null}
            </div>
            {rightBrowser !== null && <RightBrowserPanel kind={rightBrowser} onClose={() => setRightBrowser(null)} schemaExpanded={schemaExpanded} setSchemaExpanded={setSchemaExpanded} onOpenAsset={(asset) => { setOpenAssets((prev) => prev.find((a) => a.id === asset.id) ? prev : [...prev, asset]); setActiveAssetId(asset.id); setActiveTab("Assets"); }} />}
          </div>
        ) : (
          <div className="flex min-h-0 w-full flex-1 overflow-hidden rounded-md border border-border bg-background-primary">
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center overflow-clip">
              <EmptyChartGraphic />
              <div className="flex flex-col items-center gap-2 px-6 pb-6 text-center">
                <p className="text-[18px] font-semibold leading-6 text-text-primary">
                  No assets shown
                </p>
                <DefaultButton
                  onClick={() => setRightBrowser(rightBrowser === "workspace" ? null : "workspace")}
                >
                  Open asset
                </DefaultButton>
              </div>
            </div>
            {rightBrowser !== null && activeTab === "Assets" && <RightBrowserPanel kind={rightBrowser} onClose={() => setRightBrowser(null)} schemaExpanded={schemaExpanded} setSchemaExpanded={setSchemaExpanded} onOpenAsset={(asset) => { setOpenAssets((prev) => prev.find((a) => a.id === asset.id) ? prev : [...prev, asset]); setActiveAssetId(asset.id); setActiveTab("Assets"); }} />}
          </div>
        )}
      </div>
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
  const initialThread = searchParams.get("thread");
  const isNew = searchParams.get("new") === "1";
  const handleSubmitRef = React.useRef(state.handleSubmit);
  handleSubmitRef.current = state.handleSubmit;
  const handleNewChatRef = React.useRef(state.handleNewChat);
  handleNewChatRef.current = state.handleNewChat;
  const handleSelectThreadRef = React.useRef(state.handleSelectThread);
  handleSelectThreadRef.current = state.handleSelectThread;
  React.useEffect(() => {
    if (isNew) {
      handleNewChatRef.current();
    } else if (initialThread) {
      handleSelectThreadRef.current(initialThread);
    }
    if (!initialPrompt) return;
    const t = setTimeout(() => handleSubmitRef.current(initialPrompt, "ski"), 200);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [initialBrowser, setInitialBrowser] = React.useState<"workspace" | "schema" | null>(null);
  const [selectedAsset, setSelectedAsset] = React.useState<ReviewAsset | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [initialPreviewWidth, setInitialPreviewWidth] = React.useState(DEFAULT_PREVIEW_WIDTH);

  // Per-thread panel state: keyed by threadId
  const [threadOpenAssets, setThreadOpenAssets] = React.useState<Record<string, ReviewAsset[]>>({});
  const [threadActiveAssetId, setThreadActiveAssetId] = React.useState<Record<string, string | null>>({});
  const [threadActiveTab, setThreadActiveTab] = React.useState<Record<string, PreviewTab>>({});
  const [reviewedThreadIds, setReviewedThreadIds] = React.useState<Set<string>>(new Set());

  const threadId = state.activeThreadId ?? "__none__";
  const openAssets = threadOpenAssets[threadId] ?? [];
  const activeAssetId = threadActiveAssetId[threadId] ?? null;
  const activeTab = threadActiveTab[threadId] ?? "Assets";
  const isReviewed = reviewedThreadIds.has(threadId);
  const handleReviewed = React.useCallback(() => {
    setReviewedThreadIds((prev) => new Set([...prev, threadId]));
  }, [threadId]);

  const setOpenAssets = React.useCallback((updater: ReviewAsset[] | ((prev: ReviewAsset[]) => ReviewAsset[])) => {
    setThreadOpenAssets((prev) => {
      const current = prev[threadId] ?? [];
      return { ...prev, [threadId]: typeof updater === "function" ? updater(current) : updater };
    });
  }, [threadId]);

  const setActiveAssetId = React.useCallback((id: string | null) => {
    setThreadActiveAssetId((prev) => ({ ...prev, [threadId]: id }));
  }, [threadId]);

  const setActiveTab = React.useCallback((tab: PreviewTab) => {
    setThreadActiveTab((prev) => ({ ...prev, [threadId]: tab }));
  }, [threadId]);

  const reviewAssets = React.useMemo(() => {
    if (state.runStatus !== "done") return undefined;
    if (state.activeThreadId === "thread-dashboard") return ASSISTANT_DASHBOARD_REVIEW_ASSETS;
    const summary = state.steps.find((s) => s.type === "assets-summary") as { assets: ReviewAsset[] } | undefined;
    return summary?.assets;
  }, [state.steps, state.runStatus, state.activeThreadId]);

  const assetClickRef = React.useRef(false);
  const manualOpenRef = React.useRef(false);
  const focusTitleInputRef = React.useRef<(() => void) | null>(null);
  const handleFocusTitleInputReady = React.useCallback((fn: () => void) => { focusTitleInputRef.current = fn; }, []);

  const [mainView, setMainView] = React.useState<MainView>("thread");
  const [customizationsTab, setCustomizationsTab] = React.useState<CustomizationsTab>("skills");
  const [selectedSkillFile, setSelectedSkillFile] = React.useState<string | null>(null);
  const [skillDialogFile, setSkillDialogFile] = React.useState<string | null>(null);
  const [skills, setSkills] = React.useState(() => [...SKILLS]);
  const [toolsScope, setToolsScope] = React.useState<"user" | "workspace">("user");
  const [selectedMcpServerId, setSelectedMcpServerId] = React.useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
  const [scheduledViewKey, setScheduledViewKey] = React.useState(0);
  // Maps run thread IDs to their parent task IDs for breadcrumb navigation
  const runThreadTaskIdRef = React.useRef<Map<string, string>>(new Map());
  const [scheduledDetailTaskId, setScheduledDetailTaskId] = React.useState<string | null>(null);

  const handleSkillSave = React.useCallback((file: string, newContent: string) => {
    SKILL_FILE_CONTENT[file] = newContent;
    // Parse name from first # heading, description from first non-empty non-heading line
    const lines = newContent.split("\n");
    const titleLine = lines.find((l) => l.startsWith("# "));
    const name = titleLine ? titleLine.slice(2).trim() : file.replace(".md", "");
    const descLine = lines.find((l) => l.trim() && !l.startsWith("#"));
    const description = descLine ? descLine.replace(/^\s*-\s*/, "").trim() : "";
    setSkills((prev) => prev.map((s) => s.primaryFile === file ? { ...s, name, description } : s));
  }, []);

  const handleSetMainView = React.useCallback((view: MainView, clearDetail = true) => {
    setMainView((prev) => {
      if (view === "scheduled" && prev === "scheduled") setScheduledViewKey((k) => k + 1);
      return view;
    });
    if (view !== "customizations") {
      setSelectedMcpServerId(null);
      setSelectedSkillFile(null);
    }
    if (view !== "scheduled") {
      setSelectedTaskId(null);
    }
    if (view === "scheduled" && clearDetail) {
      setScheduledDetailTaskId(null);
    }
    if (view === "customizations" || view === "scheduled") {
      setPreviewOpen(false);
    }
  }, [customizationsTab]);

  const handleSkillClick = React.useCallback((file: string) => {
    setSelectedSkillFile(file);
    if (file !== ASSISTANT_INSTRUCTIONS_FILE) {
      setSkillDialogFile(file);
    }
  }, []);

  const handleOpenAssistantInstructionsInEditor = React.useCallback(() => {
    router.push(`/editor?skill=${encodeURIComponent(ASSISTANT_INSTRUCTIONS_FILE)}`);
  }, [router]);

  // Auto-switch to Review tab when assets become available, unless opened via asset click or manual toggle
  React.useEffect(() => {
    if (reviewAssets && reviewAssets.length > 0 && previewOpen) {
      if (!assetClickRef.current && !manualOpenRef.current) setActiveTab("Review");
      assetClickRef.current = false;
      manualOpenRef.current = false;
    }
  }, [reviewAssets, previewOpen]);

  const handleAssetClick = React.useCallback((asset: ReviewAsset) => {
    assetClickRef.current = true;
    setSelectedAsset(asset);
    if (containerRef.current) {
      setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
    }
    setPreviewOpen(true);
    setActiveTab("Assets");
  }, [setActiveTab]);

  const handleTogglePreview = React.useCallback(() => {
    if (!previewOpen && containerRef.current) {
      setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
      setActiveTab("Assets");
      manualOpenRef.current = true;
    }
    setPreviewOpen((v) => !v);
  }, [previewOpen, setActiveTab]);

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
          reviewedThreadIds={reviewedThreadIds}
          onRenameActiveThread={() => setTimeout(() => focusTitleInputRef.current?.(), 50)}
          onRenameThread={state.handleRenameThread}
          activeMainView={mainView}
          onSetMainView={handleSetMainView}
        />

        {mainView === "customizations" ? (
          <CustomizationsMainView
            activeTab={customizationsTab}
            onTabChange={(tab) => {
              setCustomizationsTab(tab);
              setSelectedSkillFile(null);
              setSelectedMcpServerId(null);
            }}
            onSkillClick={handleSkillClick}
            selectedSkillFile={selectedSkillFile}
            skills={skills}
            scope={toolsScope}
            onScopeChange={(s) => { setToolsScope(s); setSelectedSkillFile(null); }}
            selectedServerId={selectedMcpServerId}
            onServerClick={(id) => setSelectedMcpServerId((prev) => (prev === id ? null : id))}
            onConfigureMcpTools={(id) => setSelectedMcpServerId(id)}
            onOpenAssistantInstructionsFile={handleOpenAssistantInstructionsInEditor}
          />
        ) : mainView === "scheduled" ? (
          <ScheduledTasksMainView
            key={scheduledViewKey}
            selectedTaskId={selectedTaskId}
            onTaskClick={(id) => {
              setSelectedTaskId((prev) => (prev === id ? null : id));
              if (containerRef.current) setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth * 0.45));
            }}
            state={state}
            onSetMainView={handleSetMainView}
            onRegisterRunThread={(threadId, taskId) => { runThreadTaskIdRef.current.set(threadId, taskId); }}
            navigateToDetailTaskId={scheduledDetailTaskId}
          />
        ) : (
          <GenieChatBody
            state={state}
            size="full"
            hideThreadToggle
            hideMoreOptions={state.activeThreadId === null}
            previewOpen={previewOpen}
            onAssetClick={handleAssetClick}
            onFullScreen={() => { sessionStorage.setItem("openGeniePanel", "1"); router.back(); }}
            reviewed={isReviewed}
            onReviewed={handleReviewed}
            onFocusTitleInputReady={handleFocusTitleInputReady}
            onNavigateToParent={(threadId) => {
              const taskId = runThreadTaskIdRef.current.get(threadId);
              if (taskId) {
                setScheduledDetailTaskId(taskId);
                handleSetMainView("scheduled", false);
              }
            }}
          />
        )}

        {/* Right rail — shown when preview panel is closed */}
        {mainView !== "customizations" && mainView !== "scheduled" && !previewOpen && (
          <div className="flex h-full w-9 shrink-0 flex-col items-center border-l border-border py-2 gap-sm">
            <Tooltip label="Open preview panel" align="right">
              <IconButton
                aria-label="Open preview panel"
                icon={<span className="inline-flex scale-x-[-1]"><Icon name="sidebarClosedIcon" size={16} /></span>}
                size="small"
                tone="neutral"
                onClick={handleTogglePreview}
              />
            </Tooltip>
            <Tooltip label="Workspace" align="right">
              <IconButton
                aria-label="Open workspace browser"
                icon={<Icon name="folderOutlinedIcon" size={14} />}
                size="small"
                tone="neutral"
                onClick={() => {
                  setInitialBrowser("workspace");
                  setActiveTab("Assets");
                  if (containerRef.current) setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
                  setPreviewOpen(true);
                }}
              />
            </Tooltip>
            <Tooltip label="Catalog" align="right">
              <IconButton
                aria-label="Open catalog browser"
                icon={<span className="inline-flex -scale-x-100"><Icon name="catalogShapesIcon" size={14} /></span>}
                size="small"
                tone="neutral"
                onClick={() => {
                  setInitialBrowser("schema");
                  setActiveTab("Assets");
                  if (containerRef.current) setInitialPreviewWidth(Math.round(containerRef.current.offsetWidth / 2));
                  setPreviewOpen(true);
                }}
              />
            </Tooltip>
          </div>
        )}

        {mainView !== "customizations" && (previewOpen || (mainView === "scheduled" && selectedTaskId)) && (
          <PreviewPanel
            onClose={() => { setPreviewOpen(false); setSelectedSkillFile(null); setSelectedMcpServerId(null); setSelectedTaskId(null); setInitialBrowser(null); }}
            selectedAsset={selectedAsset}
            activeThreadId={state.activeThreadId}
            initialWidth={initialPreviewWidth}
            initialBrowser={initialBrowser}
            reviewAssets={reviewAssets}
            openAssets={openAssets}
            setOpenAssets={setOpenAssets}
            activeAssetId={activeAssetId}
            setActiveAssetId={setActiveAssetId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isReviewed={isReviewed}
            skillFile={null}
            onSkillSave={handleSkillSave}
            readOnly={false}
            mcpServer={null}
            scheduledTask={mainView === "scheduled" ? (SCHEDULED_TASKS.find((t) => t.id === selectedTaskId) ?? null) : null}
          />
        )}
      </div>

      {skillDialogFile && (
        <SkillPreviewDialog
          skillFile={skillDialogFile}
          onClose={() => setSkillDialogFile(null)}
        />
      )}

      {mainView === "customizations" && customizationsTab === "connections" && selectedMcpServerId ? (
        <McpToolsConfigDialog
          server={MCP_SERVERS.find((s) => s.id === selectedMcpServerId)!}
          onClose={() => setSelectedMcpServerId(null)}
        />
      ) : null}
    </main>
  );
}
