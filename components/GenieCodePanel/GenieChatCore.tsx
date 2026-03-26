"use client";

import * as React from "react";

import { AgentChat } from "@/components/AgentChat";
import type { ChatStep, RunStatus, ReviewAsset } from "@/components/AgentChat";
import { PromptBar } from "@/components/AgentChat/PromptBar";
import { SKI_RESORT_STEPS, SKI_RESORT_DELAYS } from "@/components/AgentChat/data/skiResortRun";
import { EDA_STEPS, EDA_DELAYS } from "@/components/AgentChat/data/edaRun";
import { FIND_DATA_STEPS, FIND_DATA_DELAYS } from "@/components/AgentChat/data/findDataRun";
import { ASSISTANT_DASHBOARD_STEPS, ASSISTANT_DASHBOARD_REVIEW_ASSETS } from "@/components/AgentChat/data/assistantDashboardRun";
import { DefaultButton } from "@/components/DefaultButton";
import { GenieChatIcon } from "@/components/GenieChatIcon";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

export type ThreadStatus = "running" | "attention" | "input" | "done" | "review";
export type GenieThread = { id: string; label: string; status: ThreadStatus; time?: string; subtitle?: string; diff?: { added: number; removed: number; files: number } };

export const SEED_THREADS: GenieThread[] = [
  { id: "thread-eda", label: "EDA on ski resort properties with a 6 month forecast", status: "done", time: "2h", subtitle: "Created Ski Resort EDA notebook, ran forecast model" },
  { id: "thread-dashboard", label: "Assistant Usage Dashboard: Analyze Last 90 Days", status: "attention", time: "7h", subtitle: "2 files ready for review", diff: { added: 40, removed: 2, files: 2 } },
  { id: "thread-input", label: "Cluster resorts into groups based on price, size, and snowfall", status: "done", time: "3d", subtitle: "Opened ski_resort_eda.py, ran clustering analysis" },
];

export const GENIE_EXAMPLE_PROMPTS = [
  "Do EDA on my ski_resort data",
  "Run exploratory data analysis",
  "Find data",
];

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Shared hook
// ---------------------------------------------------------------------------

export function useGenieChatState() {
  const [text, setText] = React.useState("");
  const [threads, setThreads] = React.useState<GenieThread[]>(SEED_THREADS);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>("thread-dashboard");
  const [steps, setSteps] = React.useState<ChatStep[]>(ASSISTANT_DASHBOARD_STEPS);
  const [runStatus, setRunStatus] = React.useState<RunStatus>("done");
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // Steps pending after a tool-confirmation pause
  const pendingStepsRef = React.useRef<{ steps: ChatStep[]; threadId: string } | null>(null);
  // Persisted steps keyed by thread ID
  const threadStepsRef = React.useRef<Map<string, ChatStep[]>>(new Map([
    ["thread-dashboard", ASSISTANT_DASHBOARD_STEPS],
    ["thread-eda", EDA_STEPS],
    ["thread-revenue", SKI_RESORT_STEPS],
    ["thread-input", FIND_DATA_STEPS],
  ]));

  React.useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  // Persist steps for the active thread whenever they change
  React.useEffect(() => {
    if (activeThreadId && steps.length > 0) {
      threadStepsRef.current.set(activeThreadId, steps);
    }
  }, [steps, activeThreadId]);

  const streamRun = React.useCallback((runSteps: ChatStep[], delays: number[], threadId: string) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    // Find if there's a tool-confirmation step — pause before steps after it
    const confirmIdx = runSteps.findIndex((s) => s.type === "tool-confirmation");
    const pauseAt = confirmIdx !== -1 ? confirmIdx : runSteps.length - 1;

    runSteps.slice(0, pauseAt + 1).forEach((step, i) => {
      const t = setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (i === pauseAt) {
          if (confirmIdx !== -1 && confirmIdx < runSteps.length - 1) {
            // Pause — store remaining steps, set thread to "input"
            pendingStepsRef.current = { steps: runSteps.slice(pauseAt + 1), threadId };
            setRunStatus("done");
            setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, status: "input" as ThreadStatus, time: "now", subtitle: "Waiting for your approval", diff: undefined } : t));
          } else {
            // No confirmation or confirmation is last step — done
            setRunStatus("done");
            setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, status: "attention" as ThreadStatus, time: "now", subtitle: "Completed" } : t));
          }
        }
      }, delays[i]);
      timersRef.current.push(t);
    });
  }, []);

  const stepsForPrompt = React.useCallback((prompt: string, runHint?: string): [ChatStep[], number[]] => {
    if (runHint === "eda") return [EDA_STEPS, EDA_DELAYS];
    if (runHint === "ski") return [SKI_RESORT_STEPS, SKI_RESORT_DELAYS];
    if (prompt.toLowerCase().includes("find data")) return [FIND_DATA_STEPS, FIND_DATA_DELAYS];
    if (prompt.toLowerCase().includes("ski_resort") || prompt.toLowerCase().includes("ski resort")) return [SKI_RESORT_STEPS, SKI_RESORT_DELAYS];
    if (prompt.toLowerCase().includes("exploratory") || prompt.toLowerCase().includes("eda")) return [EDA_STEPS, EDA_DELAYS];
    return [SKI_RESORT_STEPS, SKI_RESORT_DELAYS];
  }, []);

  const handleSelectThread = React.useCallback((id: string) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveThreadId(id);
    setRunStatus(id === "thread-dashboard" ? "done" : "idle");
    setSteps(threadStepsRef.current.get(id) ?? []);
  }, []);

  const handleSubmit = React.useCallback((promptOverride?: string, runHint?: string) => {
    const trimmed = (typeof promptOverride === "string" ? promptOverride : text).trim();
    if (!trimmed || runStatus === "running") return;
    const newId = `thread-${Date.now()}`;
    setText("");
    setRunStatus("running");
    setActiveThreadId(newId);
    setThreads((prev) => [{ id: newId, label: trimmed, status: "running", time: "now", subtitle: "Running…" }, ...prev]);
    setSteps([{ type: "user", id: "user-msg", text: trimmed }]);
    const [runSteps, delays] = stepsForPrompt(trimmed, runHint);
    streamRun(runSteps, delays, newId);
  }, [text, runStatus, stepsForPrompt, streamRun]);

  const handleToolAllow = React.useCallback(() => {
    const pending = pendingStepsRef.current;
    if (!pending) return;
    pendingStepsRef.current = null;
    setRunStatus("running");
    setThreads((prev) => prev.map((t) => t.id === pending.threadId ? { ...t, status: "running" as ThreadStatus } : t));
    // Stream remaining steps with relative delays starting from now
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const baseDelay = 400;
    pending.steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setSteps((prev) => {
          const next = [...prev, step];
          if (i === pending.steps.length - 1) {
            // Derive subtitle from last assistant-text step
            const lastText = [...next].reverse().find((s) => s.type === "assistant-text") as { text?: string } | undefined;
            const subtitle = lastText?.text ? lastText.text.split("\n")[0]! : undefined;
            setThreads((prev) => prev.map((t) => t.id === pending.threadId ? { ...t, status: "attention" as ThreadStatus, subtitle, diff: { added: 23, removed: 4, files: 3 } } : t));
          }
          return next;
        });
        if (i === pending.steps.length - 1) {
          setRunStatus("done");
        }
      }, baseDelay + i * 800);
      timersRef.current.push(t);
    });
  }, []);

  const handleNewChat = React.useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    pendingStepsRef.current = null;
    setActiveThreadId(null);
    setSteps([]);
    setRunStatus("idle");
    setText("");
  }, []);

  const hasAssets = steps.some((s) => s.type === "assets-summary");
  const activeThreadTitle = activeThreadId
    ? (threads.find((t) => t.id === activeThreadId)?.label ?? null)
    : null;

  const handleRenameThread = React.useCallback((id: string, newLabel: string) => {
    if (!newLabel.trim()) return;
    setThreads((prev) => prev.map((t) => t.id === id ? { ...t, label: newLabel.trim() } : t));
  }, []);

  return {
    text,
    setText,
    threads,
    activeThreadId,
    setActiveThreadId,
    handleSelectThread,
    handleToolAllow,
    activeThreadTitle,
    steps,
    runStatus,
    messagesEndRef,
    handleSubmit,
    handleNewChat,
    handleRenameThread,
    hasAssets,
    timersRef,
  };
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function GenieChatEmptyState({
  text,
  onTextChange,
  onSubmit,
  size = "compact",
  animationKey,
}: {
  text: string;
  onTextChange: (v: string) => void;
  onSubmit: (promptOverride?: string) => void;
  size?: "compact" | "full";
  animationKey?: number;
}) {
  const iconSize = size === "full" ? 160 : 120;
  const gap = size === "full" ? "gap-4" : "gap-3";
  const maxW = size === "full" ? "max-w-[560px]" : "max-w-[400px]";

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
      <div className={cx("flex w-full flex-col items-center", maxW, size === "full" ? "gap-8" : "gap-6")}>
        <div className={cx("flex flex-col items-center", gap)}>
          <GenieChatIcon size={iconSize} animationKey={animationKey} />
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-heading-m font-semibold text-text-primary">Genie Code</h2>
            <p className="text-paragraph text-text-secondary">Run multi-step data and AI tasks</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          {GENIE_EXAMPLE_PROMPTS.map((prompt) => (
            <DefaultButton key={prompt} radius="full" onClick={() => onSubmit(prompt)}>
              {prompt}
            </DefaultButton>
          ))}
        </div>
        <div className="w-full">
          <PromptBar value={text} onValueChange={onTextChange} onSubmit={onSubmit} size={size} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thread sidebar
// ---------------------------------------------------------------------------

function ThreadStatusIcon({ status }: { status: ThreadStatus }) {
  if (status === "running") {
    return (
      <span className="inline-block shrink-0 size-[14px] animate-spin text-text-secondary">
        <svg width="14" height="14" viewBox="0 0 9.75 9.75" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.25 1.5C3.17893 1.5 1.5 3.17893 1.5 5.25C1.5 5.66421 1.16421 6 0.75 6C0.335786 6 0 5.66421 0 5.25C0 2.3505 2.3505 0 5.25 0C5.66421 0 6 0.335786 6 0.75C6 1.16421 5.66421 1.5 5.25 1.5Z" fill="currentColor"/>
        </svg>
      </span>
    );
  }
  if (status === "attention") {
    return <Icon name="branchCheckIn" size={14} className="shrink-0 text-text-secondary" />;
  }
  if (status === "review") {
    return <Icon name="BracketsCheckIcon" size={14} className="shrink-0 text-text-secondary" />;
  }
  if (status === "input") {
    return (
      <span className="relative inline-flex shrink-0 size-[14px] items-center justify-center">
        {/* Pulsing ring */}
        <span className="absolute inline-flex size-[10px] animate-ping rounded-full bg-blue-400 opacity-50" />
        {/* Solid dot */}
        <span className="relative inline-flex size-[6px] rounded-full bg-blue-600" />
      </span>
    );
  }
  return null;
}

// Group threads by a simple "Today" / "Previous 7 days" bucketing (demo-only).
function groupThreads(threads: GenieThread[]): Array<{ label: string; threads: GenieThread[] }> {
  // First 3 seed threads → "Today"; any user-created threads also land in "Today".
  // Split: seed threads with known IDs go to "Today"; we can just split at index 3 for demo.
  const today = threads.slice(0, 3);
  const previous = threads.slice(3);
  const groups: Array<{ label: string; threads: GenieThread[] }> = [
    { label: "Today", threads: today },
  ];
  if (previous.length > 0) groups.push({ label: "Previous 7 days", threads: previous });
  return groups;
}

export function GenieChatThreadList({
  threads,
  activeThreadId,
  onSelect,
}: {
  threads: GenieThread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
}) {
  const groups = groupThreads(threads);
  return (
    <div className="flex flex-col gap-1 px-1">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col">
          <span className="px-2 py-2 text-hint text-text-secondary">{group.label}</span>
          {group.threads.map((t) => {
            const hasIcon = t.status === "running" || t.status === "attention" || t.status === "input" || t.status === "review";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={cx(
                  "flex w-full items-start gap-2 rounded-md py-2.5 pr-3 pl-3 text-left hover:bg-action-default-background-hover",
                  activeThreadId === t.id && "bg-action-default-background-hover",
                )}
              >
                <span className="mt-[3px] shrink-0">
                  {hasIcon ? <ThreadStatusIcon status={t.status} /> : <span className="inline-block w-[14px]" />}
                </span>
                <span className="min-w-0 flex-1 flex flex-col gap-[4px]">
                  <span className="flex items-baseline gap-sm">
                    <span className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">{t.label}</span>
                    {t.time && <span className="shrink-0 text-hint text-text-secondary">{t.time}</span>}
                  </span>
                  {(t.subtitle || t.diff) && (
                    <span className="flex items-center gap-xs">
                      {t.subtitle && <span className="min-w-0 flex-1 truncate text-hint text-text-secondary">{t.subtitle}</span>}
                      {t.diff && t.status !== "input" && (
                        <span className="flex shrink-0 items-center gap-xs text-hint">
                          <span className="font-medium text-green-600">+{t.diff.added}</span>
                          <span className="font-medium text-red-500">-{t.diff.removed}</span>
                          <span className="text-text-secondary opacity-40">·</span>
                          <span className="text-text-secondary">{t.diff.files} file{t.diff.files !== 1 ? "s" : ""}</span>
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function GenieChatThreadSidebar({
  threads,
  activeThreadId,
  onSelect,
  onNewChat,
  onClose,
}: {
  threads: GenieThread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full w-[180px] shrink-0 flex-col border-l border-border">
      <div className="flex h-10 shrink-0 items-center px-3">
        <span className="flex-1 text-paragraph font-medium text-text-primary">Chat history</span>
        <IconButton
          aria-label="Collapse sidebar"
          icon={<Icon name="sidebarCollapseIcon" size={14} />}
          size="small"
          tone="neutral"
          onClick={onClose}
        />
      </div>
      <div className="flex flex-col px-2 pb-2">
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
      <GenieChatThreadList threads={threads} activeThreadId={activeThreadId} onSelect={onSelect} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenieChatBody — the scrollable message area + composer, or empty state
// ---------------------------------------------------------------------------

export type GenieChatBodyProps = {
  state: ReturnType<typeof useGenieChatState>;
  /** "compact" = side panel, "full" = full-screen page */
  size?: "compact" | "full";
  /**
   * Hide the inline thread-history toggle (use when the parent already
   * provides a persistent thread sidebar, e.g. the full-screen left nav).
   */
  hideThreadToggle?: boolean;
  onFullScreen?: () => void;
  /** Called when the nav-toggle button is clicked (full-screen mode only). */
  onToggleNav?: () => void;
  /** Whether the right preview panel is currently open (controls icon state). */
  previewOpen?: boolean;
  /** Called when the user clicks an asset chip in the chat. */
  onAssetClick?: (asset: ReviewAsset) => void;
  /** Controlled thread sidebar open state (optional — uncontrolled if omitted). */
  threadSidebarOpen?: boolean;
  /** Called when the thread sidebar should open or close. */
  onThreadSidebarChange?: (open: boolean) => void;
  /** Called to close/toggle the chat side panel (compact mode). */
  onClosePanel?: () => void;
};

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function Tip({ label, children, align = "right" }: { label: string; children: React.ReactNode; align?: "center" | "left" | "right" }) {
  const posClass = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  const caretClass = align === "left" ? "left-2" : align === "right" ? "right-2" : "left-1/2 -translate-x-1/2";
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

// ---------------------------------------------------------------------------
// More-options dropdown menu
// ---------------------------------------------------------------------------

const MORE_OPTIONS_ITEMS = [
  { icon: "gearOutlinedIcon", label: "Settings" },
  { icon: "shareIcon", label: "Share chat thread" },
  { icon: "BranchIcon", label: "Clone chat thread" },
  { icon: "questionMarkOutlinedIcon", label: "Help" },
  { icon: "speechBubbleIcon", label: "Send feedback to Databricks" },
] as const;

export function MoreOptionsMenu({
  onClose,
  onTogglePanel,
  onFullScreen,
  isFullScreen,
}: {
  onClose: () => void;
  onTogglePanel?: () => void;
  onFullScreen?: () => void;
  isFullScreen?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [incognito, setIncognito] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-2 top-9 z-50 min-w-[220px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]"
    >
      {/* Top actions */}
      <div className="pb-1">
        {!isFullScreen && onTogglePanel && (
          <button
            type="button"
            onClick={() => { onTogglePanel(); onClose(); }}
            className="flex w-full items-center justify-between px-2 py-1 text-left text-paragraph text-text-primary hover:bg-background-secondary"
          >
            <span>Close chat pane</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => { onFullScreen?.(); onClose(); }}
          className="flex w-full items-center justify-between px-2 py-1 text-left text-paragraph text-text-primary hover:bg-background-secondary"
        >
          <span>{isFullScreen ? "Minimize chat" : "Maximize chat"}</span>
          <span className="text-hint text-text-secondary">⌥⌘M</span>
        </button>
      </div>
      <div className="mb-1 border-t border-border" />
      {MORE_OPTIONS_ITEMS.map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={onClose}
          className="flex w-full items-center gap-sm px-2 py-1 text-left text-paragraph text-text-primary hover:bg-background-secondary"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center py-1">
            <Icon name={icon} size={16} className="text-text-secondary" />
          </span>
          <span className="py-0.5">{label}</span>
        </button>
      ))}
      {/* Divider + Incognito toggle */}
      <div className="mt-1 border-t border-border px-2 pb-1 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-paragraph text-text-primary">Incognito</span>
          <button
            type="button"
            role="switch"
            aria-checked={incognito}
            onClick={() => setIncognito((v) => !v)}
            className={`relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full transition-colors ${incognito ? "bg-action-default-background-press" : "bg-background-tertiary"}`}
          >
            <span
              className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${incognito ? "translate-x-[16px]" : "translate-x-[2px]"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GenieChatBody({
  state,
  size = "compact",
  hideThreadToggle = false,
  onFullScreen,
  onToggleNav,
  previewOpen = false,
  onAssetClick,
  threadSidebarOpen: threadSidebarOpenProp,
  onThreadSidebarChange,
  onClosePanel,
}: GenieChatBodyProps) {
  const {
    text,
    setText,
    threads,
    activeThreadId,
    handleSelectThread,
    handleToolAllow,
    activeThreadTitle,
    steps,
    runStatus,
    messagesEndRef,
    handleSubmit,
    handleNewChat,
    handleRenameThread,
    hasAssets,
    timersRef: timers,
  } = state;

  const [threadSidebarOpenInternal, setThreadSidebarOpenInternal] = React.useState(false);
  const threadSidebarOpen = threadSidebarOpenProp ?? threadSidebarOpenInternal;
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);

  // Increment each time we enter the empty state so the animation replays
  const [emptyStateKey, setEmptyStateKey] = React.useState(0);
  const prevThreadIdRef = React.useRef<string | null>(activeThreadId);
  React.useEffect(() => {
    const wasInThread = prevThreadIdRef.current !== null;
    const nowEmpty = activeThreadId === null;
    if (wasInThread && nowEmpty) setEmptyStateKey((k) => k + 1);
    prevThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  const setThreadSidebar = React.useCallback((open: boolean) => {
    setThreadSidebarOpenInternal(open);
    onThreadSidebarChange?.(open);
  }, [onThreadSidebarChange]);

  const handleStop = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    // runStatus is set externally; parent exposes no setter — we just cancel pending steps.
  }, [timers]);

  const composerMaxW = size === "full" ? "max-w-[790px]" : undefined;

  return (
    <div className="flex h-full min-w-0 flex-1 overflow-hidden">
      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className={cx("relative flex h-10 shrink-0 items-center gap-xs px-3", size === "compact" && "border-b border-border")}>
          {(size === "compact" || activeThreadTitle) && (
            activeThreadId && activeThreadTitle ? (
              <input
                key={activeThreadId}
                className="min-w-0 flex-1 truncate bg-transparent text-paragraph font-medium text-text-primary outline-none hover:text-text-primary focus:rounded focus:outline focus:outline-2 focus:outline-action-default-border-focus"
                defaultValue={activeThreadTitle}
                onBlur={(e) => handleRenameThread(activeThreadId, e.currentTarget.value)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              />
            ) : (
              <span className="min-w-0 flex-1 truncate text-paragraph font-medium text-text-primary">
                {activeThreadTitle ?? "Genie Code"}
              </span>
            )
          )}
          {size === "full" && !activeThreadTitle && <div className="flex-1" />}
          {!previewOpen && (
            <Tip label="Connected to Serverless compute">
              <IconButton
                aria-label="Status"
                icon={<span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />}
                size="small"
                tone="neutral"
              />
            </Tip>
          )}
          {size === "compact" && (
            <Tip label="New chat">
              <IconButton
                aria-label="New chat"
                icon={<Icon name="newThreadIcon" size={14} />}
                size="small"
                tone="neutral"
                onClick={handleNewChat}
              />
            </Tip>
          )}
          {!hideThreadToggle && (
            <Tip label="Chat history" align="right">
              <IconButton
                aria-label={threadSidebarOpen ? "Close chat history" : "Open chat history"}
                icon={<Icon name="historyIcon" size={14} className={threadSidebarOpen ? "text-text-primary" : ""} />}
                size="small"
                tone="neutral"
                className={threadSidebarOpen ? "!bg-background-tertiary" : ""}
                onClick={() => setThreadSidebar(!threadSidebarOpen)}
              />
            </Tip>
          )}
          {!previewOpen && (
            <>
              <IconButton
                aria-label="More options"
                icon={<Icon name="overflowIcon" size={14} />}
                size="small"
                tone="neutral"
                onClick={() => setMoreMenuOpen((v) => !v)}
              />
              {moreMenuOpen && (
                <MoreOptionsMenu
                  onClose={() => setMoreMenuOpen(false)}
                  onTogglePanel={onClosePanel}
                  onFullScreen={onFullScreen}
                  isFullScreen={size === "full"}
                />
              )}
            </>
          )}
          {size === "full" && onToggleNav && !previewOpen && (
            <div className="group relative">
              <IconButton
                aria-label="Toggle preview panel"
                icon={
                  <span className="inline-flex rotate-180">
                    <Icon name="sidebarClosedIcon" size={16} />
                  </span>
                }
                size="small"
                tone="neutral"
                onClick={onToggleNav}
              />
              <div className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 whitespace-nowrap rounded bg-[#161616] px-2 py-1 text-hint text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="absolute bottom-full right-2 border-4 border-transparent border-b-[#161616]" />
                Toggle preview panel
              </div>
            </div>
          )}
          {onFullScreen && size !== "full" && (
            <div className="group relative">
              <IconButton
                aria-label="Maximize chat"
                icon={<Icon name="fullscreenIcon" size={14} />}
                tone="neutral"
                size="small"
                onClick={onFullScreen}
              />
              {/* Tooltip */}
              <div className="pointer-events-none absolute right-0 top-full z-50 mt-1.5 whitespace-nowrap rounded bg-[#161616] px-2 py-1 text-hint text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="absolute bottom-full right-2 border-4 border-transparent border-b-[#161616]" />
                Maximize chat
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {activeThreadId === null ? (
          <GenieChatEmptyState
            text={text}
            onTextChange={setText}
            onSubmit={handleSubmit}
            size={size}
            animationKey={emptyStateKey}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col gap-md overflow-y-auto px-4 py-4">
              {composerMaxW ? (
                <div className={cx("mx-auto w-full", composerMaxW)}>
                  <AgentChat steps={steps} onSuggestionSelect={(t) => handleSubmit(t)} onToolAllow={handleToolAllow} onAssetClick={onAssetClick} />
                </div>
              ) : (
                <AgentChat steps={steps} onSuggestionSelect={(t) => handleSubmit(t)} onToolAllow={handleToolAllow} onAssetClick={onAssetClick} />
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className={cx("shrink-0 px-4 py-3", composerMaxW && "flex justify-center")}>
              <div className={composerMaxW ? cx("w-full", composerMaxW) : undefined}>
                <PromptBar
                  value={text}
                  onValueChange={setText}
                  onSubmit={() => handleSubmit()}
                  onStop={handleStop}
                  runStatus={runStatus}
                  reviewAssets={
                    runStatus === "done" && activeThreadId === "thread-dashboard"
                      ? ASSISTANT_DASHBOARD_REVIEW_ASSETS
                      : hasAssets && runStatus === "done"
                        ? (steps.find((s) => s.type === "assets-summary") as any)?.assets as ReviewAsset[]
                        : undefined
                  }
                  onAssetClick={onAssetClick}
                />
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
