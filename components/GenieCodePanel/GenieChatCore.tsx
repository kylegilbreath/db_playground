"use client";

import * as React from "react";

import { AgentChat } from "@/components/AgentChat";
import type { ChatStep, RunStatus, ReviewAsset } from "@/components/AgentChat";
import { PromptBar } from "@/components/AgentChat/PromptBar";
import { SKI_RESORT_STEPS, SKI_RESORT_DELAYS } from "@/components/AgentChat/data/skiResortRun";
import { EDA_STEPS, EDA_DELAYS } from "@/components/AgentChat/data/edaRun";
import { FIND_DATA_STEPS, FIND_DATA_DELAYS } from "@/components/AgentChat/data/findDataRun";
import { DefaultButton } from "@/components/DefaultButton";
import { GenieChatIcon } from "@/components/GenieChatIcon";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

export type ThreadStatus = "running" | "attention" | "input" | "done";
export type GenieThread = { id: string; label: string; status: ThreadStatus };

export const SEED_THREADS: GenieThread[] = [
  { id: "thread-eda", label: "EDA on ski resort properties with a 6 month forecast", status: "done" },
  { id: "thread-revenue", label: "What is my dumpling sales revenue by category", status: "attention" },
  { id: "thread-input", label: "Cluster resorts into groups based on price, size, and snowfall", status: "done" },
];

export const GENIE_EXAMPLE_PROMPTS = [
  "What can Genie Code do?",
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
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [steps, setSteps] = React.useState<ChatStep[]>([]);
  const [runStatus, setRunStatus] = React.useState<RunStatus>("idle");
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // Steps pending after a tool-confirmation pause
  const pendingStepsRef = React.useRef<{ steps: ChatStep[]; threadId: string } | null>(null);
  // Persisted steps keyed by thread ID
  const threadStepsRef = React.useRef<Map<string, ChatStep[]>>(new Map([
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
            setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, status: "input" as ThreadStatus } : t));
          } else {
            // No confirmation or confirmation is last step — done
            setRunStatus("done");
            setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, status: "attention" as ThreadStatus } : t));
          }
        }
      }, delays[i]);
      timersRef.current.push(t);
    });
  }, []);

  const stepsForPrompt = React.useCallback((prompt: string): [ChatStep[], number[]] => {
    if (prompt.toLowerCase().includes("find data")) return [FIND_DATA_STEPS, FIND_DATA_DELAYS];
    if (prompt.toLowerCase().includes("exploratory") || prompt.toLowerCase().includes("eda")) return [EDA_STEPS, EDA_DELAYS];
    return [SKI_RESORT_STEPS, SKI_RESORT_DELAYS];
  }, []);

  const handleSelectThread = React.useCallback((id: string) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setActiveThreadId(id);
    setRunStatus("idle");
    setSteps(threadStepsRef.current.get(id) ?? []);
  }, []);

  const handleSubmit = React.useCallback((promptOverride?: string) => {
    const trimmed = (typeof promptOverride === "string" ? promptOverride : text).trim();
    if (!trimmed || runStatus === "running") return;
    const newId = `thread-${Date.now()}`;
    setText("");
    setRunStatus("running");
    setActiveThreadId(newId);
    setThreads((prev) => [{ id: newId, label: trimmed, status: "running" }, ...prev]);
    setSteps([{ type: "user", id: "user-msg", text: trimmed }]);
    const [runSteps, delays] = stepsForPrompt(trimmed);
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
        setSteps((prev) => [...prev, step]);
        if (i === pending.steps.length - 1) {
          setRunStatus("done");
          setThreads((prev) => prev.map((t) => t.id === pending.threadId ? { ...t, status: "attention" as ThreadStatus } : t));
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
}: {
  text: string;
  onTextChange: (v: string) => void;
  onSubmit: () => void;
  size?: "compact" | "full";
}) {
  const iconSize = size === "full" ? 64 : 40;
  const gap = size === "full" ? "gap-4" : "gap-3";
  const maxW = size === "full" ? "max-w-[560px]" : "max-w-[400px]";

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
      <div className={cx("w-full", maxW)}>
        <div className={cx("mb-6 flex flex-col items-center", gap)}>
          <GenieChatIcon size={iconSize} />
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-heading-m font-semibold text-text-primary">Genie Code</h2>
            <p className="text-paragraph text-text-secondary">Run multi-step data and AI tasks</p>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {GENIE_EXAMPLE_PROMPTS.map((prompt) => (
            <DefaultButton key={prompt} radius="full" onClick={() => { onTextChange(prompt); onSubmit(); }}>
              {prompt}
            </DefaultButton>
          ))}
        </div>
        <PromptBar value={text} onValueChange={onTextChange} onSubmit={onSubmit} />
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
    return <Icon name="threadAttentionIcon" size={14} className="shrink-0 text-text-secondary" />;
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
            const hasIcon = t.status === "running" || t.status === "attention" || t.status === "input";
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t.id)}
                className={cx(
                  "flex w-full items-center gap-1 rounded-md py-2 pr-2 text-left text-paragraph leading-5 text-text-primary hover:bg-background-secondary",
                  hasIcon ? "pl-2" : "pl-[26px]",
                  activeThreadId === t.id && "bg-background-secondary",
                )}
              >
                {hasIcon && <ThreadStatusIcon status={t.status} />}
                <span className="min-w-0 flex-1 truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function GenieChatThreadSidebar({
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
        <span className="flex-1 text-paragraph font-medium text-text-primary">Chat</span>
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
          <Icon name="newChatIcon" size={14} className="shrink-0 text-text-secondary" />
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
};

export function GenieChatBody({
  state,
  size = "compact",
  hideThreadToggle = false,
  onFullScreen,
  onToggleNav,
  previewOpen = false,
  onAssetClick,
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
    hasAssets,
    timersRef: timers,
  } = state;

  const [threadSidebarOpen, setThreadSidebarOpen] = React.useState(false);

  const handleStop = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    // runStatus is set externally; parent exposes no setter — we just cancel pending steps.
  }, [timers]);

  const composerMaxW = size === "full" ? "max-w-[790px]" : undefined;

  return (
    <div className="flex min-w-0 flex-1 overflow-hidden">
      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className={cx("flex h-10 shrink-0 items-center gap-xs px-3", size === "compact" && "border-b border-border")}>
          {(size === "compact" || activeThreadTitle) && (
            <span className="min-w-0 flex-1 truncate text-paragraph font-medium text-text-primary">
              {activeThreadTitle ?? "Genie Code"}
            </span>
          )}
          {size === "full" && !activeThreadTitle && <div className="flex-1" />}
          {!previewOpen && (
            <IconButton
              aria-label="Status"
              icon={<span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />}
              size="small"
              tone="neutral"
            />
          )}
          {size === "compact" && (
            <IconButton
              aria-label="New chat"
              icon={<Icon name="newChatIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={handleNewChat}
            />
          )}
          {!hideThreadToggle && !threadSidebarOpen && (
            <IconButton
              aria-label="Open chat history"
              icon={<Icon name="historyIcon" size={14} />}
              size="small"
              tone="neutral"
              onClick={() => setThreadSidebarOpen(true)}
            />
          )}
          {!previewOpen && (
            <IconButton
              aria-label="More options"
              icon={<Icon name="overflowIcon" size={14} />}
              size="small"
              tone="neutral"
            />
          )}
          {size === "full" && onToggleNav && !previewOpen && (
            <IconButton
              aria-label="Toggle preview panel"
              icon={
                <span className="inline-flex rotate-180">
                  <Icon name={previewOpen ? "sidebarOpenIcon" : "sidebarClosedIcon"} size={16} />
                </span>
              }
              size="small"
              tone="neutral"
              className={cx(previewOpen && "!bg-background-tertiary")}
              onClick={onToggleNav}
            />
          )}
          {onFullScreen && (
            <IconButton
              aria-label="Open full screen"
              icon={<Icon name="fullscreenIcon" size={14} />}
              tone="neutral"
              size="small"
              className="border border-border"
              onClick={onFullScreen}
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
                  reviewAssets={hasAssets && runStatus === "done"
                    ? (steps.find((s) => s.type === "assets-summary") as any)?.assets as ReviewAsset[]
                    : undefined}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thread sidebar (compact mode only — full-screen uses the left nav) */}
      {!hideThreadToggle && threadSidebarOpen && (
        <GenieChatThreadSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          onSelect={handleSelectThread}
          onNewChat={handleNewChat}
          onClose={() => setThreadSidebarOpen(false)}
        />
      )}
    </div>
  );
}
