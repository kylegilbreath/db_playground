# Scheduled Genie Code Tasks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Scheduled Tasks feature in the full-screen Genie Code view — including a create/edit config panel, task detail page with run history, and a "Schedule" button on thread responses.

**Architecture:** All changes are scoped to `app/chat/page.tsx` and `components/AgentChat/messages/FeedbackRow.tsx`. The data model lives as local state in `page.tsx`. The config panel is a shared slide-in drawer used for both create (from "New" button or "Schedule" on a thread response) and edit (from the task detail page). The task detail page replaces the existing `PreviewPanel` for scheduled tasks — clicking a task row navigates into a detail view rather than opening a side panel.

**Tech Stack:** React, TypeScript, Tailwind CSS with project semantic tokens, existing component primitives (`IconButton`, `PrimaryButton`, `DefaultButton`, `TertiaryButton`, `Icon`, `TextInput`)

---

## File Map

| File | Action | What changes |
|---|---|---|
| `app/chat/page.tsx` | Modify | Update `ScheduledTask` type, add `ScheduleTrigger` type, update sample data, rewrite `ScheduledTasksMainView`, add `ScheduledTaskDetailPage`, rewrite `ScheduledTaskConfigPanel` as a slide-in form, add `autoModeOn` state, wire up navigation between list → detail, update root render to remove PreviewPanel for scheduled tasks |
| `components/AgentChat/messages/FeedbackRow.tsx` | Modify | Add "Schedule" `IconButton` and `onSchedule` prop |
| `components/AgentChat/AgentChat.tsx` | Modify | Thread `onSchedule` prop down to `FeedbackRow` |
| `components/AgentChat/index.ts` | No change | Already exports what's needed |

---

### Task 1: Update types and sample data

**Files:**
- Modify: `app/chat/page.tsx:554-566`

- [ ] **Step 1: Replace the `ScheduledTask` type and add `ScheduleTrigger`**

Find and replace the existing type block (lines 554–566) with:

```typescript
type ScheduleTrigger =
  | { type: "time"; schedule: string }
  | { type: "job_completion"; jobId: string; jobName: string }
  | { type: "file_arrival"; path: string };

type ScheduledTask = {
  id: string;
  title: string;
  prompt: string;
  trigger: ScheduleTrigger;
  notification: "always" | "on_failure" | "never";
  lastRun: string | null;
  status: "success" | "failed" | "running" | "idle";
};
```

- [ ] **Step 2: Replace the `SCHEDULED_TASKS` static data**

Replace the existing `SCHEDULED_TASKS` constant with:

```typescript
const INITIAL_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: "t1",
    title: "Weekly dashboard refresh",
    prompt: "Re-run all dashboard queries, summarize changes, and post a Slack summary.",
    trigger: { type: "time", schedule: "Every Mon 8:00 AM" },
    notification: "on_failure",
    lastRun: "2d ago",
    status: "success",
  },
  {
    id: "t2",
    title: "Data quality scan",
    prompt: "Scan key tables for nulls, duplicates, and schema drift. Report anomalies.",
    trigger: { type: "time", schedule: "Daily 6:00 AM" },
    notification: "always",
    lastRun: "14h ago",
    status: "success",
  },
  {
    id: "t3",
    title: "Forecast model retrain",
    prompt: "Kick off the feature pipeline and retrain the forecast model.",
    trigger: { type: "job_completion", jobId: "job-42", jobName: "forecast_pipeline" },
    notification: "on_failure",
    lastRun: "4d ago",
    status: "failed",
  },
];
```

- [ ] **Step 3: Add mock run history data**

Add this constant directly after `INITIAL_SCHEDULED_TASKS`:

```typescript
type TaskRun = {
  id: string;
  taskId: string;
  status: "success" | "failed" | "running";
  timestamp: string;
  duration: string;
  summary: string;
  emailSent: boolean;
  threadId: string;
};

const MOCK_TASK_RUNS: TaskRun[] = [
  { id: "r1", taskId: "t1", status: "success", timestamp: "Mon Apr 28, 8:02 AM", duration: "1m 14s", summary: "Dashboard queries refreshed. WAU up 4% vs. prior week.", emailSent: false, threadId: "thread-run-1" },
  { id: "r2", taskId: "t1", status: "success", timestamp: "Mon Apr 21, 8:03 AM", duration: "1m 08s", summary: "Dashboard queries refreshed. No significant changes detected.", emailSent: false, threadId: "thread-run-2" },
  { id: "r3", taskId: "t2", status: "success", timestamp: "Mon Apr 28, 6:01 AM", duration: "42s", summary: "No nulls or schema drift detected across 12 monitored tables.", emailSent: false, threadId: "thread-run-3" },
  { id: "r4", taskId: "t3", status: "failed", timestamp: "Thu Apr 24, 11:12 PM", duration: "3m 02s", summary: "Retrain failed: feature pipeline job timed out at step 3.", emailSent: true, threadId: "thread-run-4" },
];
```

- [ ] **Step 4: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): update types and sample data for scheduled tasks"
```

---

### Task 2: Add `autoModeOn` state and a trigger summary helper

**Files:**
- Modify: `app/chat/page.tsx` (main component state + new helper function)

- [ ] **Step 1: Add a `triggerSummary` helper function**

Add this function near the other helpers at the top of the file, after the `cx` function:

```typescript
function triggerSummary(trigger: ScheduleTrigger): string {
  if (trigger.type === "time") return trigger.schedule;
  if (trigger.type === "job_completion") return `After job: ${trigger.jobName}`;
  return `On file: ${trigger.path}`;
}
```

- [ ] **Step 2: Add `autoModeOn` state and `scheduledTasks` state to the main page component**

Inside the main page component (the default export), alongside the existing `mainView`, `selectedTaskId` etc. state declarations (around line 2628), add:

```typescript
const [scheduledTasks, setScheduledTasks] = React.useState<ScheduledTask[]>(INITIAL_SCHEDULED_TASKS);
const [autoModeOn, setAutoModeOn] = React.useState(false);
const [configPanelOpen, setConfigPanelOpen] = React.useState(false);
const [configPanelTask, setConfigPanelTask] = React.useState<ScheduledTask | null>(null);
const [configPanelPrefill, setConfigPanelPrefill] = React.useState<string>("");
const [detailTaskId, setDetailTaskId] = React.useState<string | null>(null);
```

- [ ] **Step 3: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): add autoModeOn, scheduledTasks state, and triggerSummary helper"
```

---

### Task 3: Rewrite `ScheduledTasksMainView`

**Files:**
- Modify: `app/chat/page.tsx:568-681`

- [ ] **Step 1: Replace `ScheduledTasksMainView` with the updated version**

Replace the entire `ScheduledTasksMainView` function (lines 568–681) with:

```typescript
function ScheduledTasksMainView({
  tasks,
  onTaskClick,
  onNewTask,
}: {
  tasks: ScheduledTask[];
  onTaskClick: (id: string) => void;
  onNewTask: () => void;
}) {
  const [activeTab, setActiveTab] = React.useState<"mine" | "all">("mine");

  const statusDot = (s: ScheduledTask["status"]) => {
    if (s === "success") return "bg-green-500";
    if (s === "failed") return "bg-red-500";
    if (s === "running") return "bg-yellow-500";
    return "bg-neutral-400";
  };

  const statusLabel = (s: ScheduledTask["status"]) => {
    if (s === "idle") return "Never run";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 px-8 pt-6 pb-4">
        <h1 className="text-title3 font-semibold text-text-primary">Scheduled tasks</h1>
      </div>

      {/* Stats row */}
      <div className="shrink-0 grid grid-cols-3 gap-3 px-8 pb-5">
        {[
          { label: "Total tasks", value: String(tasks.length) },
          { label: "Successful · 7d", value: "11" },
          { label: "Failed · 7d", value: "1" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-xs rounded-md border border-border bg-background-primary px-4 py-3">
            <span className="text-hint text-text-secondary">{stat.label}</span>
            <span className="text-title2 font-semibold text-text-primary">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-sm border-b border-border px-8 pb-0">
        {(["mine", "all"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cx(
              "pb-2 text-paragraph border-b-2 transition-colors",
              activeTab === t
                ? "border-action-default-border-focus font-medium text-text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            {t === "mine" ? "Mine" : "All"}
          </button>
        ))}
        <div className="flex-1" />
        <button type="button" className="mb-2 flex h-7 w-7 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
          <Icon name="searchIcon" size={14} />
        </button>
        <div className="mb-2">
          <PrimaryButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />} onClick={onNewTask}>New</PrimaryButton>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 px-8 py-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Icon name="clockIcon" size={32} className="text-text-placeholder" />
            <p className="text-paragraph font-medium text-text-primary">No scheduled tasks yet</p>
            <p className="text-paragraph text-text-secondary">Run Genie Code tasks on a schedule or in response to events.</p>
            <PrimaryButton size="default" onClick={onNewTask}>Create task</PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onTaskClick(task.id)}
                className="flex w-full items-center gap-sm rounded-md border border-border bg-background-primary px-4 py-3 text-left transition-colors hover:border-action-default-border-hover"
              >
                <span className={cx("h-2 w-2 shrink-0 rounded-full", statusDot(task.status))} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-paragraph font-medium text-text-primary">{task.title}</p>
                  <p className="text-hint text-text-secondary">
                    {triggerSummary(task.trigger)}
                    {task.lastRun ? ` · Last run ${task.lastRun}` : ` · ${statusLabel(task.status)}`}
                  </p>
                </div>
                <span className="text-hint text-text-secondary">{statusLabel(task.status)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggested */}
      <div className="shrink-0 border-t border-border px-8 py-5">
        <p className="mb-3 text-title4 font-semibold text-text-primary">Suggested</p>
        <div className="grid grid-cols-2 gap-3">
          {SUGGESTED_TASKS.map((task) => (
            <button
              key={task.title}
              type="button"
              onClick={onNewTask}
              className="flex flex-col gap-xs rounded-md border border-border bg-background-primary p-4 text-left transition-colors hover:border-action-default-border-hover"
            >
              <Icon name={task.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-text-secondary" />
              <p className="text-paragraph font-medium text-text-primary">{task.title}</p>
              <p className="text-hint text-text-secondary">{task.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): rewrite ScheduledTasksMainView with updated data model and navigation"
```

---

### Task 4: Build `ScheduledTaskDetailPage`

**Files:**
- Modify: `app/chat/page.tsx` (add new component after `ScheduledTasksMainView`)

- [ ] **Step 1: Add `ScheduledTaskDetailPage` component**

Add the following component after the closing brace of `ScheduledTasksMainView`:

```typescript
function ScheduledTaskDetailPage({
  task,
  runs,
  onBack,
  onEdit,
  onRunNow,
  onDelete,
}: {
  task: ScheduledTask;
  runs: TaskRun[];
  onBack: () => void;
  onEdit: () => void;
  onRunNow: () => void;
  onDelete: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const taskRuns = runs.filter((r) => r.taskId === task.id);

  const statusDot = (s: TaskRun["status"]) => {
    if (s === "success") return "bg-green-500";
    if (s === "failed") return "bg-red-500";
    return "bg-yellow-500";
  };

  const statusLabel = (s: TaskRun["status"]) =>
    s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {/* Breadcrumb */}
      <div className="shrink-0 flex items-center gap-xs px-8 pt-5 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-xs text-hint text-text-secondary hover:text-text-primary transition-colors"
        >
          <Icon name="chevronLeftIcon" size={12} />
          Scheduled tasks
        </button>
        <span className="text-hint text-text-secondary">/</span>
        <span className="text-hint text-text-primary font-medium truncate">{task.title}</span>
      </div>

      {/* Page header */}
      <div className="shrink-0 flex items-start gap-sm px-8 pt-3 pb-5">
        <div className="flex-1 min-w-0">
          <h1 className="text-title3 font-semibold text-text-primary">{task.title}</h1>
          <p className="text-hint text-text-secondary mt-xs">{triggerSummary(task.trigger)}</p>
        </div>
        <div className="flex items-center gap-sm shrink-0">
          <DefaultButton size="small" onClick={onEdit}>Edit task</DefaultButton>
          <PrimaryButton size="small" onClick={onRunNow}>Run now</PrimaryButton>
          <div className="relative">
            <IconButton
              aria-label="More options"
              icon={<Icon name="overflowIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={() => setShowDeleteConfirm((v) => !v)}
            />
            {showDeleteConfirm && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-background-primary shadow-md">
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); onDelete(); }}
                  className="w-full px-3 py-2 text-left text-paragraph text-action-danger-default-text-default hover:bg-action-danger-default-background-hover"
                >
                  Delete task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Run history */}
      <div className="flex-1 border-t border-border px-8 pt-5">
        <p className="mb-3 text-title4 font-semibold text-text-primary">Run history</p>
        {taskRuns.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Icon name="clockIcon" size={28} className="text-text-placeholder" />
            <p className="text-paragraph text-text-secondary">No runs yet. This task hasn't been triggered.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {taskRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center gap-sm rounded-md border border-border bg-background-primary px-4 py-3"
              >
                <span className={cx("h-2 w-2 shrink-0 rounded-full", statusDot(run.status))} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-sm">
                    <span className="text-hint font-medium text-text-primary">{statusLabel(run.status)}</span>
                    <span className="text-hint text-text-secondary">{run.timestamp}</span>
                    <span className="text-hint text-text-secondary">· {run.duration}</span>
                    {run.emailSent && (
                      <span className="rounded-full bg-background-secondary px-2 py-0.5 text-hint text-text-secondary">Email sent</span>
                    )}
                  </div>
                  <p className="mt-xs text-hint text-text-secondary truncate">{run.summary}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-hint text-action-tertiary-text-default hover:underline"
                >
                  View thread →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): add ScheduledTaskDetailPage with run history"
```

---

### Task 5: Build `ScheduledTaskConfigPanel` (create/edit slide-in)

**Files:**
- Modify: `app/chat/page.tsx:2107-2147`

- [ ] **Step 1: Replace the existing `ScheduledTaskConfigPanel` with the full create/edit form**

Replace the entire `ScheduledTaskConfigPanel` function (currently lines 2107–2147) with:

```typescript
function ScheduledTaskConfigPanel({
  task,
  prefillPrompt,
  autoModeOn,
  onSave,
  onClose,
}: {
  task: ScheduledTask | null;
  prefillPrompt: string;
  autoModeOn: boolean;
  onSave: (t: ScheduledTask) => void;
  onClose: () => void;
}) {
  const isEdit = task !== null;

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [prompt, setPrompt] = React.useState(task?.prompt ?? prefillPrompt);
  const [triggerType, setTriggerType] = React.useState<ScheduleTrigger["type"]>(task?.trigger.type ?? "time");
  const [timeSchedule, setTimeSchedule] = React.useState(
    task?.trigger.type === "time" ? task.trigger.schedule : "Daily 6:00 AM"
  );
  const [jobName, setJobName] = React.useState(
    task?.trigger.type === "job_completion" ? task.trigger.jobName : ""
  );
  const [filePath, setFilePath] = React.useState(
    task?.trigger.type === "file_arrival" ? task.trigger.path : ""
  );
  const [notification, setNotification] = React.useState<ScheduledTask["notification"]>(
    task?.notification ?? "on_failure"
  );

  // Auto-generate title from prompt (first ~6 words)
  React.useEffect(() => {
    if (isEdit) return;
    const words = prompt.trim().split(/\s+/).slice(0, 6).join(" ");
    setTitle(words ? (words.length < prompt.trim().length ? words + "…" : words) : "");
  }, [prompt, isEdit]);

  const buildTrigger = (): ScheduleTrigger => {
    if (triggerType === "time") return { type: "time", schedule: timeSchedule };
    if (triggerType === "job_completion") return { type: "job_completion", jobId: jobName.toLowerCase().replace(/\s/g, "-"), jobName };
    return { type: "file_arrival", path: filePath };
  };

  const handleSave = () => {
    if (!prompt.trim()) return;
    const saved: ScheduledTask = {
      id: task?.id ?? `t${Date.now()}`,
      title: title || prompt.trim().split(/\s+/).slice(0, 6).join(" "),
      prompt: prompt.trim(),
      trigger: buildTrigger(),
      notification,
      lastRun: task?.lastRun ?? null,
      status: task?.status ?? "idle",
    };
    onSave(saved);
  };

  const triggerTabs: { value: ScheduleTrigger["type"]; label: string }[] = [
    { value: "time", label: "Time-based" },
    { value: "job_completion", label: "Job completion" },
    { value: "file_arrival", label: "File arrival" },
  ];

  const notificationOptions: { value: ScheduledTask["notification"]; label: string }[] = [
    { value: "always", label: "Always" },
    { value: "on_failure", label: "On failure only" },
    { value: "never", label: "Never" },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-[400px] flex-col border-l border-border bg-background-primary shadow-xl">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-sm border-b border-border px-4">
        <span className="flex-1 text-paragraph font-semibold text-text-primary">
          {isEdit ? task.title : "New scheduled task"}
        </span>
        <IconButton
          aria-label="Close"
          icon={<Icon name="closeIcon" size={14} />}
          size="small"
          tone="neutral"
          onClick={onClose}
        />
      </div>

      {/* Form */}
      <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-y-auto px-4 py-5">

        {/* Task name */}
        <div className="flex flex-col gap-xs">
          <label className="text-hint font-medium text-text-primary">Task name</label>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Auto-generated from prompt"
          />
        </div>

        {/* Prompt */}
        <div className="flex flex-col gap-xs">
          <label className="text-hint font-medium text-text-primary">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What should Genie Code do when triggered?"
            rows={4}
            className="w-full rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-action-default-border-focus resize-none"
          />
        </div>

        {/* Trigger */}
        <div className="flex flex-col gap-sm">
          <label className="text-hint font-medium text-text-primary">Trigger</label>
          <div className="flex rounded-sm border border-border overflow-hidden">
            {triggerTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setTriggerType(tab.value)}
                className={cx(
                  "flex-1 px-2 py-1.5 text-hint transition-colors",
                  triggerType === tab.value
                    ? "bg-action-default-background-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-background-secondary",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {triggerType === "time" && (
            <div className="flex flex-col gap-xs">
              <select
                value={timeSchedule}
                onChange={(e) => setTimeSchedule(e.target.value)}
                className="rounded-sm border border-border bg-background-primary px-3 py-2 text-paragraph text-text-primary focus:outline-none focus:ring-2 focus:ring-action-default-border-focus"
              >
                <option>Daily 6:00 AM</option>
                <option>Every Mon 8:00 AM</option>
                <option>Every Sun 11:00 PM</option>
                <option>Monthly on the 1st</option>
              </select>
            </div>
          )}

          {triggerType === "job_completion" && (
            <TextInput
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Search jobs..."
            />
          )}

          {triggerType === "file_arrival" && (
            <TextInput
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="Enter file path or pattern"
            />
          )}
        </div>

        {/* Auto Mode notice */}
        <div className={cx(
          "rounded-md border px-3 py-2.5 text-hint",
          autoModeOn
            ? "border-blue-200 bg-blue-50 text-blue-800"
            : "border-yellow-200 bg-yellow-50 text-yellow-800"
        )}>
          {autoModeOn ? (
            <>
              This task runs unattended in Auto Mode — Genie Code will approve its own tool calls using an LLM judge.{" "}
              <button type="button" className="underline font-medium">Learn more</button>
            </>
          ) : (
            <>
              Auto Mode is off. Unattended runs may stall waiting for tool approvals.{" "}
              <button type="button" className="underline font-medium">Turn on Auto Mode</button>
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-xs">
          <label className="text-hint font-medium text-text-primary">Notifications</label>
          <div className="flex rounded-sm border border-border overflow-hidden">
            {notificationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNotification(opt.value)}
                className={cx(
                  "flex-1 px-2 py-1.5 text-hint transition-colors",
                  notification === opt.value
                    ? "bg-action-default-background-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-background-secondary",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-end gap-sm border-t border-border px-4 py-3">
        <DefaultButton size="small" onClick={onClose}>Cancel</DefaultButton>
        <PrimaryButton size="small" onClick={handleSave} disabled={!prompt.trim()}>
          Save task
        </PrimaryButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): build ScheduledTaskConfigPanel as create/edit slide-in form"
```

---

### Task 6: Wire up state and render logic in the main page component

**Files:**
- Modify: `app/chat/page.tsx` (render section, approximately lines 2692–2770)

- [ ] **Step 1: Update the `handleSetMainView` callback to clear `detailTaskId`**

Find `handleSetMainView` and update it to also clear `detailTaskId` and `configPanelOpen`:

```typescript
const handleSetMainView = React.useCallback((view: MainView) => {
  setMainView(view);
  if (view !== "customizations") {
    setSelectedMcpServerId(null);
    setSelectedSkillFile(null);
  }
  if (view !== "scheduled") {
    setSelectedTaskId(null);
    setDetailTaskId(null);
    setConfigPanelOpen(false);
  }
  if (view === "customizations" || view === "scheduled") {
    setPreviewOpen(false);
  }
}, [customizationsTab]);
```

- [ ] **Step 2: Replace the `mainView === "scheduled"` branch in the render**

Find the section that renders `ScheduledTasksMainView` (currently around line 2724) and replace it with:

```typescript
) : mainView === "scheduled" ? (
  <>
    {detailTaskId ? (
      <ScheduledTaskDetailPage
        task={scheduledTasks.find((t) => t.id === detailTaskId)!}
        runs={MOCK_TASK_RUNS}
        onBack={() => setDetailTaskId(null)}
        onEdit={() => {
          const t = scheduledTasks.find((t) => t.id === detailTaskId) ?? null;
          setConfigPanelTask(t);
          setConfigPanelPrefill("");
          setConfigPanelOpen(true);
        }}
        onRunNow={() => {
          setScheduledTasks((prev) =>
            prev.map((t) => t.id === detailTaskId ? { ...t, status: "running" as const } : t)
          );
          setTimeout(() => {
            setScheduledTasks((prev) =>
              prev.map((t) => t.id === detailTaskId ? { ...t, status: "success" as const, lastRun: "just now" } : t)
            );
          }, 2000);
        }}
        onDelete={() => {
          setScheduledTasks((prev) => prev.filter((t) => t.id !== detailTaskId));
          setDetailTaskId(null);
        }}
      />
    ) : (
      <ScheduledTasksMainView
        tasks={scheduledTasks}
        onTaskClick={(id) => setDetailTaskId(id)}
        onNewTask={() => {
          setConfigPanelTask(null);
          setConfigPanelPrefill("");
          setConfigPanelOpen(true);
        }}
      />
    )}
  </>
```

- [ ] **Step 3: Remove the `(mainView === "scheduled" && selectedTaskId)` condition from the PreviewPanel visibility check**

Find the line containing `(mainView === "scheduled" && selectedTaskId)` in the PreviewPanel render condition and remove that clause. Also remove `scheduledTask={...}` from the `PreviewPanel` props since it's no longer used for scheduled tasks.

The updated PreviewPanel condition should look like:

```typescript
{(previewOpen || (mainView === "customizations" && customizationsTab === "skills" && selectedSkillFile) || (mainView === "customizations" && customizationsTab === "connections" && selectedMcpServerId)) && (
  <PreviewPanel
    onClose={() => { setPreviewOpen(false); setSelectedSkillFile(null); setSelectedMcpServerId(null); }}
    selectedAsset={selectedAsset}
    activeThreadId={state.activeThreadId}
    initialWidth={initialPreviewWidth}
    reviewAssets={reviewAssets}
    openAssets={openAssets}
    setOpenAssets={setOpenAssets}
    activeAssetId={activeAssetId}
    setActiveAssetId={setActiveAssetId}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    isReviewed={isReviewed}
    skillFile={mainView === "customizations" && customizationsTab === "skills" ? selectedSkillFile : null}
    onSkillSave={handleSkillSave}
    readOnly={mainView === "customizations" && customizationsTab === "skills" && toolsScope === "workspace"}
    mcpServer={mainView === "customizations" && customizationsTab === "connections" ? (MCP_SERVERS.find((s) => s.id === selectedMcpServerId) ?? null) : null}
  />
)}
```

- [ ] **Step 4: Add the `ScheduledTaskConfigPanel` and its overlay to the render, just before the closing `</div>` of the main container**

```typescript
{configPanelOpen && (
  <>
    <div
      className="fixed inset-0 z-40 bg-black/20"
      onClick={() => setConfigPanelOpen(false)}
    />
    <ScheduledTaskConfigPanel
      task={configPanelTask}
      prefillPrompt={configPanelPrefill}
      autoModeOn={autoModeOn}
      onClose={() => setConfigPanelOpen(false)}
      onSave={(saved) => {
        setScheduledTasks((prev) => {
          const exists = prev.find((t) => t.id === saved.id);
          if (exists) return prev.map((t) => t.id === saved.id ? saved : t);
          return [saved, ...prev];
        });
        setConfigPanelOpen(false);
        if (!configPanelTask) setDetailTaskId(saved.id);
      }}
    />
  </>
)}
```

- [ ] **Step 5: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(scheduled-tasks): wire up detail page, config panel, and state in main page"
```

---

### Task 7: Add "Schedule" button to `FeedbackRow` and thread `AgentChat`

**Files:**
- Modify: `components/AgentChat/messages/FeedbackRow.tsx`
- Modify: `components/AgentChat/AgentChat.tsx`

- [ ] **Step 1: Add `onSchedule` prop to `FeedbackRow`**

Replace the entire contents of `components/AgentChat/messages/FeedbackRow.tsx` with:

```typescript
"use client";
import * as React from "react";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import type { FeedbackMessage } from "../types";

export function FeedbackRow({ step, onSchedule }: { step: FeedbackMessage; onSchedule?: () => void }) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  void step;
  return (
    <div className="flex items-center gap-xs">
      <IconButton
        aria-label="Helpful"
        icon={<Icon name="ThumbsUpIcon" size={14} />}
        size="small"
        tone="neutral"
        onClick={() => setVote((v) => (v === "up" ? null : "up"))}
        className={vote === "up" ? "text-action-default-text" : undefined}
      />
      <IconButton
        aria-label="Not helpful"
        icon={<Icon name="ThumbsDownIcon" size={14} />}
        size="small"
        tone="neutral"
        onClick={() => setVote((v) => (v === "down" ? null : "down"))}
        className={vote === "down" ? "text-action-default-text" : undefined}
      />
      <IconButton
        aria-label="Report issue"
        icon={<Icon name="DangerIcon" size={14} />}
        size="small"
        tone="neutral"
      />
      {onSchedule && (
        <IconButton
          aria-label="Schedule this task"
          icon={<Icon name="clockIcon" size={14} />}
          size="small"
          tone="neutral"
          onClick={onSchedule}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Thread `onSchedule` through `AgentChat`**

Replace the entire contents of `components/AgentChat/AgentChat.tsx` with:

```typescript
import * as React from "react";
import type { ChatStep, ReviewAsset } from "./types";
import { UserMessage } from "./messages/UserMessage";
import { AssistantText } from "./messages/AssistantText";
import { ThinkingBlock } from "./messages/ThinkingBlock";
import { ActionGroup } from "./messages/ActionGroup";
import { ToolConfirmationCard } from "./messages/ToolConfirmationCard";
import { AssetsSummary } from "./messages/AssetsSummary";
import { SuggestionChips } from "./messages/SuggestionChips";
import { FeedbackRow } from "./messages/FeedbackRow";

export function AgentChat({
  steps,
  onSuggestionSelect,
  onToolAllow,
  onAssetClick,
  onSchedule,
}: {
  steps: ChatStep[];
  onSuggestionSelect?: (text: string) => void;
  onToolAllow?: (stepId: string) => void;
  onAssetClick?: (asset: ReviewAsset) => void;
  onSchedule?: () => void;
}) {
  return (
    <div className="flex flex-col gap-md">
      {steps.map((step) => {
        switch (step.type) {
          case "user":
            return <UserMessage key={step.id} step={step} />;
          case "assistant-text":
            return <AssistantText key={step.id} step={step} />;
          case "thinking":
            return <ThinkingBlock key={step.id} step={step} />;
          case "action-group":
            return <ActionGroup key={step.id} step={step} onAssetClick={onAssetClick} />;
          case "tool-confirmation":
            return (
              <ToolConfirmationCard
                key={step.id}
                step={step}
                onAllow={onToolAllow ? () => onToolAllow(step.id) : undefined}
                onAssetClick={onAssetClick}
              />
            );
          case "assets-summary":
            return null;
          case "suggestion-chips":
            return <SuggestionChips key={step.id} step={step} onSelect={onSuggestionSelect} />;
          case "feedback":
            return <FeedbackRow key={step.id} step={step} onSchedule={onSchedule} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
```

- [ ] **Step 3: Pass `onSchedule` from `GenieChatBody` in `GenieChatCore.tsx`**

In `GenieChatCore.tsx`, find the two `<AgentChat ... />` usages (around lines 1445–1448) and add `onSchedule` to each. You need to thread this from the `GenieChatBody` props too.

In `GenieChatCore.tsx`, find the `GenieChatBody` component props interface and add:

```typescript
onSchedule?: () => void;
```

Then in the two `<AgentChat />` usages inside `GenieChatBody`, add:

```typescript
onSchedule={onSchedule}
```

- [ ] **Step 4: Pass `onSchedule` from the main page to `GenieChatBody`**

In `app/chat/page.tsx`, find the `<GenieChatBody ... />` usage (around line 2733) and add:

```typescript
onSchedule={() => {
  setConfigPanelTask(null);
  setConfigPanelPrefill("Repeat: this analysis");
  setConfigPanelOpen(true);
  setMainView("scheduled");
}}
```

- [ ] **Step 5: Commit**

```bash
git add components/AgentChat/messages/FeedbackRow.tsx components/AgentChat/AgentChat.tsx components/GenieCodePanel/GenieChatCore.tsx app/chat/page.tsx
git commit -m "feat(scheduled-tasks): add Schedule button to thread FeedbackRow"
```

---

### Task 8: Verify the full flow in the browser

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/kyle.gilbreath/Desktop/Git/db_playground
npm run dev
```

- [ ] **Step 2: Verify Entry Point A — create from list**
  1. Open `http://localhost:3000/chat`
  2. Click the clock icon in the left nav to open Scheduled Tasks
  3. Click "New" → config panel slides in from the right
  4. Type a prompt → task name auto-populates
  5. Switch trigger types and verify each sub-field appears
  6. Toggle notifications
  7. Click "Save task" → panel closes, new task appears at top of list with "idle" status

- [ ] **Step 3: Verify task detail navigation**
  1. Click any task row → navigates to detail page
  2. Verify breadcrumb shows "Scheduled tasks > [task name]"
  3. Verify run history rows appear for tasks t1, t2, t3
  4. Click back chevron → returns to list

- [ ] **Step 4: Verify Edit and Run Now from detail page**
  1. On detail page, click "Edit task" → config panel opens pre-filled
  2. Change prompt, click "Save task" → panel closes, title updates
  3. Click "Run now" → status briefly shows "running" then "success"

- [ ] **Step 5: Verify Entry Point B — Schedule from thread response**
  1. Navigate to a thread with a completed Genie Code response (a `feedback` step)
  2. Verify clock icon appears in the feedback row action buttons
  3. Click clock icon → config panel opens with prompt pre-filled as "Repeat: this analysis"
  4. Save → panel closes, new task is in the scheduled tasks list

- [ ] **Step 6: Verify delete**
  1. On detail page, click kebab → "Delete task" appears
  2. Click "Delete task" → navigates back to list, task is removed

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Create/edit config panel with sliding drawer
- ✅ Three trigger types (time, job completion, file arrival)
- ✅ Task detail page with breadcrumb and run history
- ✅ "Schedule" button on thread FeedbackRow
- ✅ Email notification config (always / on failure only / never)
- ✅ Auto Mode notice (info when on, warning when off)
- ✅ "idle" status for never-run tasks
- ✅ Trigger summary in list rows
- ✅ Run history with "Email sent" chip
- ✅ "Run now" with optimistic status update
- ✅ Delete with confirmation

**Type consistency check:**
- `ScheduledTask.status` includes `"idle"` — used consistently in `statusDot`, `statusLabel`, and `INITIAL_SCHEDULED_TASKS`
- `ScheduleTrigger` union — used consistently in `buildTrigger()`, `triggerSummary()`, and data
- `TaskRun.taskId` references `ScheduledTask.id` — verified in mock data
- `configPanelTask: ScheduledTask | null` — nullable for create mode, non-null for edit mode
