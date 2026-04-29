"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { useRouter } from "next/navigation";

import { AgentChat } from "@/components/AgentChat";
import type { ChatStep, RunStatus, ReviewAsset } from "@/components/AgentChat";
import { PromptBar } from "@/components/AgentChat/PromptBar";
import { SKI_RESORT_STEPS, SKI_RESORT_DELAYS } from "@/components/AgentChat/data/skiResortRun";
import { EDA_STEPS, EDA_DELAYS } from "@/components/AgentChat/data/edaRun";
import { FIND_DATA_STEPS, FIND_DATA_DELAYS } from "@/components/AgentChat/data/findDataRun";
import { ASSISTANT_DASHBOARD_STEPS, ASSISTANT_DASHBOARD_REVIEW_ASSETS } from "@/components/AgentChat/data/assistantDashboardRun";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { GenieChatIcon } from "@/components/GenieChatIcon";
import { IconButton } from "@/components/IconButton";
import { Icon, PhIcon } from "@/components/icons";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { AssistantInstructionsCard, RenderSkillDialogMarkdown } from "@/components/AssistantInstructions/AssistantInstructionsCard";
import { ASSISTANT_INSTRUCTIONS_FILE } from "@/lib/assistant-instructions";
import { SKILL_CONTENTS } from "@/app/editor/page";

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

export type ThreadStatus = "running" | "attention" | "input" | "done" | "review";
export type GenieThread = { id: string; label: string; status: ThreadStatus; time?: string; subtitle?: string; diff?: { added: number; removed: number; files: number } };

export const SEED_THREADS: GenieThread[] = [
  { id: "thread-eda", label: "EDA on ski resort properties with a 6 month forecast", status: "done", time: "2h", subtitle: "Created Ski Resort EDA notebook, ran forecast model" },
  { id: "thread-dashboard", label: "Assistant Usage Dashboard: Analyze Last 90 Days", status: "attention", time: "7h", subtitle: "2 files ready for review", diff: { added: 40, removed: 2, files: 2 } },
  { id: "thread-input", label: "Cluster resorts into groups based on price, size, and snowfall", status: "done", time: "3d", subtitle: "Opened ski_resort_eda.py, ran clustering analysis" },
  { id: "thread-long", label: "Build a revenue attribution model comparing paid vs. organic acquisition channels across Q1 and Q2", status: "done", time: "5d", subtitle: "Created attribution_model.py, generated comparison charts" },
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
  // Persisted run status keyed by thread ID
  const threadRunStatusRef = React.useRef<Map<string, RunStatus>>(new Map([
    ["thread-dashboard", "done"],
    ["thread-eda", "done"],
    ["thread-revenue", "done"],
    ["thread-input", "done"],
  ]));

  React.useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  // Persist steps and run status for the active thread whenever they change
  React.useEffect(() => {
    if (activeThreadId && steps.length > 0) {
      threadStepsRef.current.set(activeThreadId, steps);
    }
  }, [steps, activeThreadId]);

  React.useEffect(() => {
    if (activeThreadId) {
      threadRunStatusRef.current.set(activeThreadId, runStatus);
    }
  }, [runStatus, activeThreadId]);

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
    setRunStatus(threadRunStatusRef.current.get(id) ?? "idle");
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
  const iconSize = size === "full" ? 180 : 140;
  const gap = size === "full" ? "gap-4" : "gap-3";
  const maxW = size === "full" ? "max-w-[680px]" : "max-w-[400px]";

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
      <div className={cx("flex w-full flex-col items-center", maxW, size === "full" ? "gap-8" : "gap-6")}>
        <div className={cx("flex flex-col items-center", gap)}>
          <div className="animate-[fadeUp_0.5s_ease-out_both]">
            <GenieChatIcon size={iconSize} animationKey={animationKey} />
          </div>
          <div className="flex flex-col items-center gap-1 animate-[fadeUp_0.5s_ease-out_0.1s_both]">
            <h2 className="text-heading-m font-semibold text-text-primary">Genie Code</h2>
            <p className="text-paragraph text-text-secondary">Run multi-step data and AI tasks</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center justify-center gap-2 animate-[fadeUp_0.5s_ease-out_0.2s_both]">
          {GENIE_EXAMPLE_PROMPTS.map((prompt) => (
            <DefaultButton key={prompt} radius="full" onClick={() => onSubmit(prompt)} className="border-transparent bg-background-secondary hover:bg-background-tertiary">
              {prompt}
            </DefaultButton>
          ))}
        </div>
        <div className="w-full animate-[fadeUp_0.5s_ease-out_0.3s_both]">
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

const THREAD_MENU_ITEMS = [
  { icon: "shareIcon", label: "Share chat thread" },
  { icon: "BranchIcon", label: "Clone chat thread" },
  { icon: "pencilIcon", label: "Rename" },
  { icon: "trashIcon", label: "Delete" },
] as const;

function ThreadMoreMenu({ onClose, onRename, anchorRef }: { onClose: () => void; onRename: () => void; anchorRef: React.RefObject<HTMLElement | null> }) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={ref}
      className="absolute right-1 top-8 z-50 min-w-[200px] overflow-hidden rounded border border-border bg-background-primary py-1 shadow-[0px_2px_16px_0px_rgba(0,0,0,0.08)]"
    >
      {THREAD_MENU_ITEMS.map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => { if (label === "Rename") { onRename(); } onClose(); }}
          className="flex w-full items-center gap-sm px-2 py-1 text-left text-paragraph text-text-primary hover:bg-background-secondary"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            <Icon name={icon} size={16} className="text-text-secondary" />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function GenieChatThreadList({
  threads,
  activeThreadId,
  onSelect,
  reviewedThreadIds = new Set(),
  onRenameActiveThread,
}: {
  threads: GenieThread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  reviewedThreadIds?: Set<string>;
  onRenameActiveThread?: () => void;
}) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const menuButtonRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  const groups = groupThreads(threads);
  return (
    <div className="flex flex-col gap-1 px-1">
      {groups.map((group) => (
        <div key={group.label} className="flex flex-col">
          <span className="px-2 py-2 text-hint text-text-secondary">{group.label}</span>
          {group.threads.map((t) => {
            const hasIcon = !reviewedThreadIds.has(t.id) && (t.status === "running" || t.status === "attention" || t.status === "input" || t.status === "review");
            const isHovered = hoveredId === t.id;
            const isMenuOpen = menuOpenId === t.id;
            return (
              <div
                key={t.id}
                className="relative"
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => { if (!isMenuOpen) setHoveredId(null); }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(t.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(t.id); }}
                  className={cx(
                    "flex w-full cursor-pointer items-start gap-2 rounded-md py-2.5 pr-3 pl-3 text-left hover:bg-action-default-background-hover",
                    (activeThreadId === t.id || isMenuOpen) && "bg-action-default-background-hover",
                  )}
                >
                  <span className="mt-[3px] shrink-0">
                    {hasIcon ? <ThreadStatusIcon status={t.status} /> : <span className="inline-block w-[14px]" />}
                  </span>
                  <span className="min-w-0 flex-1 flex flex-col gap-[4px]">
                    <span className="flex items-center gap-sm">
                      <span className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">{t.label}</span>
                      {(isHovered || isMenuOpen) ? (
                        <button
                          ref={(el) => { if (el) menuButtonRefs.current.set(t.id, el); }}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : t.id); }}
                          className="shrink-0 flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-action-default-background-press hover:text-text-primary"
                        >
                          <Icon name="overflowIcon" size={14} />
                        </button>
                      ) : (
                        t.time && <span className="shrink-0 text-hint text-text-secondary">{t.time}</span>
                      )}
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
                </div>
                {isMenuOpen && (
                  <ThreadMoreMenu
                    onClose={() => { setMenuOpenId(null); setHoveredId(null); }}
                    onRename={() => { if (t.id !== activeThreadId) onSelect(t.id); onRenameActiveThread?.(); }}
                    anchorRef={{ current: menuButtonRefs.current.get(t.id) ?? null }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const DEFAULT_SIDEBAR_WIDTH = 180;
const MIN_SIDEBAR_WIDTH = 140;
const MAX_SIDEBAR_WIDTH = 400;

export function GenieChatThreadSidebar({
  threads,
  activeThreadId,
  onSelect,
  onNewChat,
  onClose,
  onRenameActiveThread,
}: {
  threads: GenieThread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
  onRenameActiveThread?: () => void;
}) {
  const [width, setWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startWidth = React.useRef(DEFAULT_SIDEBAR_WIDTH);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    const onMouseMove = (mv: MouseEvent) => {
      if (!isDragging.current) return;
      // Sidebar is on the right, so dragging left increases width
      const next = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidth.current - (mv.clientX - startX.current)));
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
    <div className="relative flex h-full shrink-0 flex-col border-l border-border" style={{ width }}>
      <div className="flex h-10 shrink-0 items-center px-3">
        <span className="flex-1 text-paragraph font-medium text-text-primary">Chat history</span>
        <Tip label="Close chat history" align="right">
          <IconButton
            aria-label="Collapse sidebar"
            icon={<Icon name="sidebarCollapseIcon" size={14} />}
            size="small"
            tone="neutral"
            onClick={onClose}
          />
        </Tip>
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
      <GenieChatThreadList threads={threads} activeThreadId={activeThreadId} onSelect={onSelect} onRenameActiveThread={onRenameActiveThread} />
      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat history sidebar"
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-action-default-border-hover active:bg-action-default-border-hover"
        onMouseDown={handleMouseDown}
      />
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
  /** Whether the current thread's review has been actioned (hides accept/reject buttons). */
  reviewed?: boolean;
  /** Called when the user accepts or rejects all — so parent can mark thread as reviewed. */
  onReviewed?: () => void;
  /** Called with a function that focuses the thread title input — lets parent trigger rename. */
  onFocusTitleInputReady?: (focusFn: () => void) => void;
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
// Editor settings drawer
// ---------------------------------------------------------------------------

type SettingsTab = "General" | "Skills & instructions" | "MCP servers";

const SETTINGS_TABS: SettingsTab[] = ["General", "Skills & instructions", "MCP servers"];

type ToggleSetting = {
  type?: "toggle";
  title: string;
  description: string;
  defaultOn: boolean;
};

type SelectSetting = {
  type?: "select";
  title: string;
  description: string;
  options: string[];
  defaultValue: string;
};

type RadioSetting = {
  type: "radio";
  title: string;
  options: Array<{ label: string; icon?: string }>;
  defaultValue: string;
};

type SelectWithHelperSetting = {
  type: "select-helper";
  title: string;
  description: string;
  options: string[];
  defaultValue: string;
  helperText: string;
};

type SelectWithCheckboxesSetting = {
  type: "select-checkboxes";
  title: string;
  description: string;
  options: string[];
  defaultValue: string;
  checkboxes: string[];
};

const GENERAL_SETTINGS: Array<ToggleSetting | SelectSetting | RadioSetting | SelectWithHelperSetting | SelectWithCheckboxesSetting> = [
  { type: "radio", title: "Toggle panel view", options: [{ label: "Docked" }, { label: "Side" }], defaultValue: "Side" },
  { type: "select-helper", title: "Serverless Usage Policy", description: "Specifies the policy for running code generated by Genie Code in the chat output.", options: ["0", "Standard", "Restricted"], defaultValue: "0", helperText: "Selected policy has no tags" },
  { type: "select-checkboxes", title: "LLM Model", description: "Choose which LLM model Genie Code uses. For Databricks internal use only.", options: ["Default", "Claude 3.5 Sonnet", "GPT-4o", "Llama 3.1 70B"], defaultValue: "Default", checkboxes: ["LLM Debug", "AI Tracking Debug (reloads page)", "Enable Glean tools"] },
];

// ---------------------------------------------------------------------------
// Tools tab — skill data + components
// ---------------------------------------------------------------------------

export type SettingsSkillFile = { name: string; file: string };
export type SettingsSkillFolder = { name: string; children: SettingsSkillFile[] };
export type SettingsSkillEntry = SettingsSkillFile | SettingsSkillFolder;
export function isSkillFolder(e: SettingsSkillEntry): e is SettingsSkillFolder { return "children" in e; }

export type SettingsSkill = { id: string; name: string; primaryFile: string; entries: SettingsSkillEntry[] };

export const SETTINGS_SKILLS: SettingsSkill[] = [
  { id: "10x-engineer", name: "10x-engineer", primaryFile: "10x-engineer.md", entries: [{ name: "SKILL.md", file: "10x-engineer.md" }, { name: "README.md", file: "10x-engineer-readme.md" }] },
  { id: "frontend-reviewer", name: "frontend-reviewer", primaryFile: "frontend-reviewer.md", entries: [{ name: "SKILL.md", file: "frontend-reviewer.md" }, { name: "README.md", file: "frontend-reviewer-readme.md" }, { name: "STYLE_PRESETS.md", file: "frontend-reviewer-style.md" }] },
  { id: "ux-designer", name: "ux-designer", primaryFile: "ux-designer.md", entries: [{ name: "SKILL.md", file: "ux-designer.md" }, { name: "references", children: [{ name: "patterns-and-flows.md", file: "ux-designer-patterns.md" }, { name: "psychology-deep-dive.md", file: "ux-designer-psychology.md" }] } as SettingsSkillFolder] },
];

const SETTINGS_WORKSPACE_SKILLS: SettingsSkill[] = [
  { id: "unit-tests", name: "unit-tests", primaryFile: "unit-tests.md", entries: [{ name: "SKILL.md", file: "unit-tests.md" }, { name: "README.md", file: "unit-tests-readme.md" }] },
];

function SkillPreviewDialog({ file, skillName, onClose, onOpenInEditor }: { file: string; skillName: string; onClose: () => void; onOpenInEditor: () => void }) {
  const content = SKILL_CONTENTS[file] ?? `# ${file}\n\nNo content available.`;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="flex h-[600px] w-[560px] flex-col overflow-hidden rounded-md bg-background-primary shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-border px-lg py-md">
          <div className="flex flex-col gap-xs">
            <span className="text-title3 font-semibold text-text-primary">{skillName}</span>
            <span className="text-hint text-text-secondary">/Workspace/assistant/skills/{skillName}</span>
          </div>
          <button type="button" onClick={onClose} className="mt-0.5 rounded-sm p-0.5 text-text-secondary hover:bg-action-default-background-hover hover:text-text-primary">
            <Icon name="closeIcon" size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-lg py-md">
          <RenderSkillDialogMarkdown text={content} />
        </div>
        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-sm border-t border-border px-lg py-md">
          <DefaultButton onClick={onClose}>Close</DefaultButton>
          <PrimaryButton leadingIcon={<PhIcon icon={ArrowSquareOut} size={12} />} onClick={onOpenInEditor}>Open in editor</PrimaryButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

function SettingsSkillRow({ skill, selectedFile, onSelect, onClose }: { skill: SettingsSkill; selectedFile: string | null; onSelect: (f: string) => void; onClose?: () => void }) {
  const router = useRouter();
  const allFiles = skill.entries.flatMap((e) => isSkillFolder(e) ? e.children.map((c) => c.file) : [e.file]);
  const hasMany = skill.entries.length > 1;
  const [expanded, setExpanded] = React.useState(() => hasMany && allFiles.includes(selectedFile ?? ""));
  const [previewFile, setPreviewFile] = React.useState<string | null>(null);

  const openPreview = (file: string) => { onSelect(file); setPreviewFile(file); };
  const closePreview = () => setPreviewFile(null);
  const openInEditor = (file: string) => { closePreview(); onClose?.(); router.push(`/editor?skill=${encodeURIComponent(file)}`); };

  return (
    <div className="flex flex-col">
      {previewFile && (
        <SkillPreviewDialog
          file={previewFile}
          skillName={skill.name}
          onClose={closePreview}
          onOpenInEditor={() => openInEditor(previewFile)}
        />
      )}
      <div className="group flex w-full items-center gap-sm rounded-sm px-sm py-xs transition-colors hover:bg-action-default-background-hover">
        <button
          type="button"
          onClick={() => { if (hasMany) { setExpanded((v) => !v); } else { openPreview(skill.primaryFile); } }}
          className="flex flex-1 items-center gap-sm text-left overflow-hidden"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-border bg-background-primary">
            <Icon name="WrenchIcon" size={12} className="text-text-secondary" />
          </div>
          <span className="flex-1 truncate text-paragraph font-medium text-text-primary">{skill.name}</span>
        </button>
        <button
          type="button"
          onClick={() => { onClose?.(); router.push(`/workspace/${skill.id}`); }}
          className="hidden shrink-0 items-center gap-xs text-hint text-action-tertiary-text-default hover:underline group-hover:flex"
        >
          Go to folder
          <Icon name="arrowRightIcon" size={10} className="shrink-0" />
        </button>
        {hasMany && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="shrink-0">
            <Icon name={expanded ? "chevronDownIcon" : "chevronRightIcon"} size={12} className="text-text-secondary" />
          </button>
        )}
      </div>
      {expanded && hasMany && (
        <div className="ml-[20px] flex flex-col border-l border-border pl-sm">
          {skill.entries.map((entry, i) =>
            isSkillFolder(entry) ? (
              <div key={i} className="flex flex-col">
                <span className="px-sm py-xs text-hint text-text-secondary">{entry.name}</span>
                {entry.children.map((child) => (
                  <button key={child.file} type="button" onClick={() => openPreview(child.file)}
                    className="flex w-full items-center gap-xs rounded-sm px-sm py-xs text-left text-paragraph text-text-secondary transition-colors hover:bg-action-default-background-hover">
                    {child.name}
                  </button>
                ))}
              </div>
            ) : (
              <button key={entry.file} type="button" onClick={() => openPreview(entry.file)}
                className="flex w-full items-center gap-xs rounded-sm px-sm py-xs text-left text-paragraph text-text-secondary transition-colors hover:bg-action-default-background-hover">
                {entry.name}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function SettingsToolsTab({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [scope, setScope] = React.useState<"user" | "workspace">("user");
  const [selectedFile, setSelectedFile] = React.useState<string | null>(null);
  const skills = scope === "workspace" ? SETTINGS_WORKSPACE_SKILLS : SETTINGS_SKILLS;

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center">
        <h3 className="flex-1 text-title3 font-semibold text-text-primary">Skills &amp; instructions</h3>
        <div className="flex w-fit rounded-sm border border-border bg-background-tertiary p-0.5">
          {(["user", "workspace"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)}
              className={cx("rounded-[3px] px-3 py-1 text-paragraph transition-colors", scope === s ? "bg-background-primary font-medium text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary")}>
              {s === "user" ? "User" : "Workspace"}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="flex flex-col gap-xs">
        <div className="flex flex-col gap-xs pb-xs">
          <div className="flex items-center">
            <span className="flex-1 text-paragraph font-semibold text-text-primary">{scope === "user" ? "User skills" : "Workspace skills"}</span>
            <DefaultButton size="small" trailingIcon={<PhIcon icon={ArrowSquareOut} size={12} />} onClick={() => { onClose?.(); router.push("/workspace"); }}>Open skills folder</DefaultButton>
          </div>
          <p className="text-paragraph text-text-secondary">Skills let you teach Genie Code new capabilities by providing markdown files with instructions and examples. Create skill files in your skills folder to extend what Genie Code can do. <a href="#" className="text-action-tertiary-text-default hover:underline">Learn more</a></p>
        </div>
        {skills.map((skill) => (
          <SettingsSkillRow key={skill.id} skill={skill} selectedFile={selectedFile} onSelect={setSelectedFile} onClose={onClose} />
        ))}
      </div>

      <div className="h-px w-full bg-border" />

      {/* Instructions */}
      <div className="flex flex-col gap-sm">
        <p className="text-paragraph font-semibold text-text-primary">{scope === "user" ? "User instructions" : "Workspace instructions"}</p>
        {scope === "user" ? (
          <>
            <p className="text-paragraph text-text-secondary">Instructions lets you provide system-level instructions to Genie Code. It&apos;s a persistent way to share context, preferences, or preferred ways of authoring.</p>
            <AssistantInstructionsCard
              compact
              content={SKILL_CONTENTS[ASSISTANT_INSTRUCTIONS_FILE]}
              onOpenFile={() => {
                onClose?.();
                router.push(`/editor?skill=${encodeURIComponent(ASSISTANT_INSTRUCTIONS_FILE)}`);
              }}
            />
            <p className="text-paragraph text-text-secondary">The fastest way to add instructions is to start your input with the <strong className="font-semibold text-text-primary">#</strong> character.</p>
          </>
        ) : (
          <p className="text-paragraph text-text-secondary">Workspace instructions apply to all members of this workspace.</p>
        )}
      </div>
    </div>
  );
}

type SettingsServer = {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  status: "connect" | "connected";
  toolsEnabled?: number;
};

const SETTINGS_MCP_SERVERS: SettingsServer[] = [
  { id: "jira", name: "Jira", icon: "JiraIcon", iconBg: "bg-[#e8f0fe]", status: "connect" },
  { id: "confluence", name: "Confluence", icon: "ConfluenceIcon", iconBg: "bg-[#e8f0fe]", status: "connect" },
  { id: "glean", name: "Glean", icon: "gleanIcon", iconBg: "bg-[#f5f0eb]", status: "connect" },
  { id: "sharepoint", name: "SharePoint", icon: "SharePointIcon", iconBg: "bg-[#e8f4ea]", status: "connect" },
  { id: "gdrive", name: "Google Drive", icon: "driveIcon", iconBg: "bg-[#f1f3f4]", status: "connected", toolsEnabled: 2 },
  { id: "github", name: "GitHub", icon: "githubIcon", iconBg: "bg-[#f0f0f0]", status: "connected", toolsEnabled: 44 },
  { id: "genie-space", name: "Genie Space: chloe's genie space", icon: "AppsIcon", iconBg: "bg-[#f0f9f6]", status: "connected", toolsEnabled: 2 },
];

function SettingsConnectionsTab() {
  const [servers, setServers] = React.useState(SETTINGS_MCP_SERVERS);

  const toggle = (id: string) => {
    setServers((prev) => prev.map((s) =>
      s.id === id ? { ...s, status: s.status === "connected" ? "connect" : "connected" } : s
    ));
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-title3 font-semibold text-text-primary">MCP servers</h3>
      <div className="flex flex-col gap-xs">
        <div className="flex items-center pb-xs">
        </div>
        <p className="text-paragraph text-text-secondary">Manage your installed servers.</p>
        <div className="mt-1 flex flex-col gap-xs">
          {servers.map((server) => (
            <div key={server.id} className="flex items-center gap-sm py-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${server.iconBg}`}>
                <Icon name={server.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-paragraph text-text-primary">{server.name}</p>
                {server.status === "connected" && server.toolsEnabled !== undefined && (
                  <p className="text-hint text-action-tertiary-text-default">{server.toolsEnabled} tools enabled</p>
                )}
              </div>
              {server.status === "connect" ? (
                <button
                  type="button"
                  onClick={() => toggle(server.id)}
                  className="shrink-0 rounded-sm border border-border px-3 py-1 text-hint font-medium text-text-primary hover:bg-action-default-background-hover"
                >
                  Connect
                </button>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked
                  onClick={() => toggle(server.id)}
                  className="relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full bg-blue-600 transition-colors"
                >
                  <span className="absolute top-[2px] h-[14px] w-[14px] translate-x-[16px] rounded-full bg-white shadow-sm transition-transform" />
                </button>
              )}
              <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={14} />} size="small" tone="neutral" />
            </div>
          ))}
        </div>
        <div className="mt-1">
          <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />}>Add Server</DefaultButton>
        </div>
      </div>
    </div>
  );
}

type AnySetting = ToggleSetting | SelectSetting | RadioSetting | SelectWithHelperSetting | SelectWithCheckboxesSetting;

function isToggleSetting(s: AnySetting): s is ToggleSetting {
  return !("type" in s) || s.type === "toggle";
}
function isSelectSetting(s: AnySetting): s is SelectSetting {
  return !("type" in s) ? false : s.type === "select" || (!s.type && "options" in s && !("helperText" in s) && !("checkboxes" in s));
}
function isRadioSetting(s: AnySetting): s is RadioSetting {
  return (s as RadioSetting).type === "radio";
}
function isSelectHelperSetting(s: AnySetting): s is SelectWithHelperSetting {
  return (s as SelectWithHelperSetting).type === "select-helper";
}
function isSelectCheckboxesSetting(s: AnySetting): s is SelectWithCheckboxesSetting {
  return (s as SelectWithCheckboxesSetting).type === "select-checkboxes";
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={`relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full transition-colors ${on ? "bg-blue-600" : "bg-background-tertiary"}`}
    >
      <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-[16px]" : "translate-x-[2px]"}`} />
    </button>
  );
}

function RadioSettingRow({ setting }: { setting: RadioSetting }) {
  const [value, setValue] = React.useState(setting.defaultValue);
  return (
    <div className="flex flex-col gap-xs py-4 first:pt-0">
      <span className="text-paragraph font-medium text-text-primary">{setting.title}</span>
      <div className="mt-1 flex flex-col gap-2">
        {setting.options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setValue(opt.label)}
            className="flex items-center gap-sm text-left"
          >
            <span className={cx(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
              value === opt.label ? "border-blue-600 bg-blue-600" : "border-border bg-background-primary",
            )}>
              {value === opt.label && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-paragraph text-text-primary">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectHelperSettingRow({ setting }: { setting: SelectWithHelperSetting }) {
  const [value, setValue] = React.useState(setting.defaultValue);
  return (
    <div className="flex flex-col gap-xs py-4 first:pt-0">
      <span className="text-paragraph font-medium text-text-primary">{setting.title}</span>
      <p className="text-hint text-text-secondary">{setting.description}</p>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border bg-background-primary px-2 py-1.5 text-paragraph text-text-primary"
      >
        {setting.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <span className="text-hint text-text-secondary">{setting.helperText}</span>
    </div>
  );
}

function SelectCheckboxesSettingRow({ setting }: { setting: SelectWithCheckboxesSetting }) {
  const [value, setValue] = React.useState(setting.defaultValue);
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  return (
    <div className="flex flex-col gap-xs py-4 first:pt-0">
      <span className="text-paragraph font-medium text-text-primary">{setting.title}</span>
      <p className="text-hint text-text-secondary">{setting.description}</p>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 w-full rounded-sm border border-border bg-background-primary px-2 py-1.5 text-paragraph text-text-primary"
      >
        {setting.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="mt-1 flex flex-col gap-1.5">
        {setting.checkboxes.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setChecked((prev) => ({ ...prev, [label]: !prev[label] }))}
            className="flex items-center gap-sm text-left"
          >
            <span className={cx(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
              checked[label] ? "border-blue-600 bg-blue-600" : "border-border bg-background-primary",
            )}>
              {checked[label] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="text-paragraph text-text-primary">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EditorSettingsDrawer({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("General");

  const settingsMap: Partial<Record<SettingsTab, Array<AnySetting>>> = {
    "General": GENERAL_SETTINGS,
  };

  const items = settingsMap[activeTab];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-[680px] flex-col bg-background-primary shadow-[-2px_0px_12px_0px_rgba(0,0,0,0.10)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-title3 font-semibold text-text-primary">Genie Code settings</h2>
          <IconButton aria-label="Close settings" icon={<Icon name="closeIcon" size={14} />} size="small" tone="neutral" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-[160px] shrink-0 border-r border-border py-2">
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cx(
                  "w-full px-4 py-2 text-left text-paragraph transition-colors",
                  activeTab === tab
                    ? "bg-action-default-background-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-background-secondary hover:text-text-primary",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
            {activeTab === "Skills & instructions" ? (
              <SettingsToolsTab onClose={onClose} />
            ) : activeTab === "MCP servers" ? (
              <SettingsConnectionsTab />
            ) : (
              <>
                <h3 className="mb-4 text-title3 font-semibold text-text-primary">{activeTab}</h3>
                <div className="flex flex-col divide-y divide-border">
                  {(items ?? []).map((setting) => {
                    if (isRadioSetting(setting)) {
                      return <RadioSettingRow key={setting.title} setting={setting} />;
                    }
                    if (isSelectHelperSetting(setting)) {
                      return <SelectHelperSettingRow key={setting.title} setting={setting} />;
                    }
                    if (isSelectCheckboxesSetting(setting)) {
                      return <SelectCheckboxesSettingRow key={setting.title} setting={setting} />;
                    }
                    if (isToggleSetting(setting)) {
                      return (
                        <div key={setting.title} className="flex flex-col gap-xs py-4 first:pt-0">
                          <div className="flex items-start justify-between gap-md">
                            <span className="text-paragraph font-medium text-text-primary">{setting.title}</span>
                            <Toggle defaultOn={setting.defaultOn} />
                          </div>
                          <p className="text-hint text-text-secondary">{setting.description}</p>
                        </div>
                      );
                    }
                    // plain select
                    const sel = setting as SelectSetting;
                    return (
                      <div key={sel.title} className="flex flex-col gap-xs py-4 first:pt-0">
                        <span className="text-paragraph font-medium text-text-primary">{sel.title}</span>
                        <p className="text-hint text-text-secondary">{sel.description}</p>
                        <select defaultValue={sel.defaultValue} className="mt-1 w-[160px] rounded-sm border border-border bg-background-primary px-2 py-1 text-paragraph text-text-primary">
                          {sel.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
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
  onOpenSettings,
}: {
  onClose: () => void;
  onTogglePanel?: () => void;
  onFullScreen?: () => void;
  isFullScreen?: boolean;
  onOpenSettings?: () => void;
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
        <button
          type="button"
          onClick={() => { onFullScreen?.(); onClose(); }}
          className="flex w-full items-center justify-between px-2 py-1 text-left text-paragraph text-text-primary hover:bg-background-secondary"
        >
          <span className="flex items-center gap-xs">
            <Icon name={isFullScreen ? "arrowsCollapseIcon" : "arrowsExpandIcon"} size={14} className="text-text-secondary" />
            {isFullScreen ? "Minimize chat" : "Maximize chat"}
          </span>
          <span className="text-hint text-text-secondary">⌥⌘M</span>
        </button>
      </div>
      <div className="mb-1 border-t border-border" />
      {MORE_OPTIONS_ITEMS.map(({ icon, label }) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            if (label === "Settings") {
              onOpenSettings?.();
            }
            onClose();
          }}
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
  reviewed = false,
  onReviewed,
  onFocusTitleInputReady,
}: GenieChatBodyProps) {
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const focusTitleInput = React.useCallback(() => {
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, []);
  React.useEffect(() => {
    onFocusTitleInputReady?.(focusTitleInput);
  }, [onFocusTitleInputReady, focusTitleInput]);

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
  const [settingsOpen, setSettingsOpen] = React.useState(false);

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
          {onFullScreen && size !== "full" && (
            <div className="group relative">
              <IconButton
                aria-label="Maximize chat"
                icon={<Icon name="arrowsExpandIcon" size={14} />}
                tone="neutral"
                size="small"
                onClick={onFullScreen}
              />
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 whitespace-nowrap rounded bg-[#161616] px-2 py-1 text-hint text-white opacity-0 transition-opacity group-hover:opacity-100">
                <span className="absolute bottom-full left-2 border-4 border-transparent border-b-[#161616]" />
                Maximize chat
              </div>
            </div>
          )}
          {size === "full" && onFullScreen && (
            <Tip label="Minimize to side panel" align="left">
              <IconButton
                aria-label="Minimize to side panel"
                icon={<Icon name="arrowsCollapseIcon" size={14} />}
                tone="neutral"
                size="small"
                className="shrink-0"
                onClick={onFullScreen}
              />
            </Tip>
          )}
          {size === "full" && activeThreadId && activeThreadTitle ? (
            <input
              key={activeThreadId}
              ref={titleInputRef}
              className="min-w-0 flex-1 truncate rounded bg-transparent px-1 text-paragraph font-medium text-text-primary outline-none hover:ring-1 hover:ring-border focus:ring-2 focus:ring-action-default-border-focus"
              defaultValue={activeThreadTitle}
              onBlur={(e) => handleRenameThread(activeThreadId, e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-paragraph font-medium text-text-primary">
              {size === "full" ? (activeThreadTitle ?? "Genie Code") : "Genie Code"}
            </span>
          )}
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
                  onOpenSettings={() => setSettingsOpen(true)}
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
          {onClosePanel && (
            <IconButton
              aria-label="Close panel"
              icon={<Icon name="closeIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={onClosePanel}
            />
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
                  reviewed={reviewed}
                  onReviewed={onReviewed}
                  onAssetClick={onAssetClick}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {settingsOpen && ReactDOM.createPortal(
        <EditorSettingsDrawer onClose={() => setSettingsOpen(false)} />,
        document.body,
      )}
    </div>
  );
}
