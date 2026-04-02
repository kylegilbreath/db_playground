"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/icons";

import { useGenieChatState, GenieChatBody, GenieChatThreadSidebar } from "./GenieChatCore";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Right rail data
// ---------------------------------------------------------------------------

const RIGHT_RAIL_ITEMS = [
  { id: "sparkle", icon: "genieIcon", label: "Agent", accent: true },
  { id: "variables", icon: "bracketsIcon", label: "Variables" },
  { id: "revisions", icon: "historyIcon", label: "Revision History" },
  { id: "config", icon: "gearOutlinedIcon", label: "Configuration" },
  { id: "info", icon: "InfoIcon", label: "Info" },
];

// ---------------------------------------------------------------------------
// GenieCodeRightRail (standalone, for when no panel is open)
// ---------------------------------------------------------------------------

export function GenieCodeRightRail({
  activeItem,
  onToggle,
}: {
  activeItem: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-9 shrink-0 flex-col items-center border-l border-border bg-background-primary py-2">
      <div className="flex flex-col items-center gap-xs">
        {RIGHT_RAIL_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            onClick={() => onToggle(item.id)}
            className={cx(
              "flex h-7 w-7 items-center justify-center rounded-sm",
              activeItem === item.id && item.accent
                ? "bg-action-default-background-press text-action-default-text"
                : activeItem === item.id
                  ? "bg-background-tertiary text-text-primary"
                  : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary",
            )}
          >
            <Icon name={item.icon} size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenieCodeSidePanel
// ---------------------------------------------------------------------------

export type GenieCodeSidePanelProps = {
  onClose: () => void;
  /** When provided, renders a resize handle and uses this width. */
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  /** When true, renders the right rail of icons. */
  showRightRail?: boolean;
  /** Active rail item (controlled by parent when showRightRail=true). */
  activeRailItem?: string | null;
  onRailItemToggle?: (id: string) => void;
  /** When true, removes border radius and drop shadow (e.g. when flush with editor chrome). */
  flat?: boolean;
};

// ---------------------------------------------------------------------------
// Right-rail panel content components
// ---------------------------------------------------------------------------

export function VariablesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-paragraph font-semibold text-text-primary">Variables</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
          <Icon name="closeIcon" size={14} />
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-paragraph text-text-secondary">
        <Icon name="bracketsIcon" size={24} className="text-text-placeholder" />
        <p>Run a cell to initialize the execution context and view variables</p>
      </div>
    </div>
  );
}

export function RevisionsPanel({ onClose }: { onClose: () => void }) {
  const revisions = [
    { label: "Auto-saved", time: "Just now", author: "kyle.gilbreath" },
    { label: "Auto-saved", time: "2 hours ago", author: "kyle.gilbreath" },
    { label: "Auto-saved", time: "Yesterday 3:42 PM", author: "kyle.gilbreath" },
    { label: "Auto-saved", time: "Mar 31, 9:01 AM", author: "kyle.gilbreath" },
    { label: "Auto-saved", time: "Mar 30, 2:15 PM", author: "kyle.gilbreath" },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-paragraph font-semibold text-text-primary">Revision History</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
          <Icon name="closeIcon" size={14} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {revisions.map((r, i) => (
          <button key={i} type="button" className="flex w-full flex-col gap-xs px-4 py-2 text-left hover:bg-background-secondary">
            <span className="text-paragraph text-text-primary">{r.label}</span>
            <span className="text-hint text-text-secondary">{r.time} · {r.author}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ConfigPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-paragraph font-semibold text-text-primary">Configuration</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
          <Icon name="closeIcon" size={14} />
        </button>
      </div>
      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-paragraph text-text-primary">Language</span>
          <span className="text-paragraph text-text-secondary">Python</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-paragraph text-text-primary">Compute</span>
          <span className="text-paragraph text-text-secondary">Serverless</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-paragraph text-text-primary">Auto-save</span>
          <span className="text-paragraph text-text-secondary">On</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-paragraph text-text-primary">Git sync</span>
          <span className="text-paragraph text-text-secondary">Off</span>
        </div>
      </div>
    </div>
  );
}

export function InfoPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border px-4">
        <span className="text-paragraph font-semibold text-text-primary">Info</span>
        <button type="button" onClick={onClose} className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary">
          <Icon name="closeIcon" size={14} />
        </button>
      </div>
      <div className="flex flex-col divide-y divide-border">
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Name</span>
          <span className="text-paragraph text-text-primary">Ski Resort EDA</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Owner</span>
          <span className="text-paragraph text-text-primary">kyle.gilbreath@databricks.com</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Last modified</span>
          <span className="text-paragraph text-text-primary">Today at 9:01 AM</span>
        </div>
        <div className="flex flex-col gap-xs px-4 py-3">
          <span className="text-hint text-text-secondary">Location</span>
          <span className="text-paragraph text-text-primary">/Users/kyle.gilbreath/Drafts</span>
        </div>
      </div>
    </div>
  );
}

export function GenieCodeSidePanel({
  onClose,
  width,
  onResizeStart,
  showRightRail = false,
  activeRailItem = "sparkle",
  onRailItemToggle,
  flat = false,
}: GenieCodeSidePanelProps) {
  const router = useRouter();
  const state = useGenieChatState();
  const [threadSidebarOpen, setThreadSidebarOpen] = React.useState(false);
  const focusTitleInputRef = React.useRef<(() => void) | null>(null);
  const handleFocusTitleInputReady = React.useCallback((fn: () => void) => { focusTitleInputRef.current = fn; }, []);

  const SIDEBAR_WIDTH = 180;
  const containerStyle = width !== undefined
    ? { width: width + (threadSidebarOpen ? SIDEBAR_WIDTH : 0) }
    : undefined;

  return (
    <div
      className={cx("relative flex h-full shrink-0 overflow-hidden bg-background-primary", flat ? "border-b border-l border-r border-border" : "rounded-md border border-border shadow-[var(--elevation-shadow-md)]")}
      style={containerStyle}
    >
      {/* Resize handle */}
      {onResizeStart && (
        <div
          onMouseDown={onResizeStart}
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-action-default-border-hover"
        />
      )}

      <GenieChatBody
        state={state}
        size="compact"
        onFullScreen={() => { onClose(); router.push("/chat"); }}
        threadSidebarOpen={threadSidebarOpen}
        onThreadSidebarChange={setThreadSidebarOpen}
        onClosePanel={onClose}
        onFocusTitleInputReady={handleFocusTitleInputReady}
      />
      {threadSidebarOpen && (
        <GenieChatThreadSidebar
          threads={state.threads}
          activeThreadId={state.activeThreadId}
          onSelect={state.handleSelectThread}
          onNewChat={state.handleNewChat}
          onClose={() => setThreadSidebarOpen(false)}
          onRenameActiveThread={() => setTimeout(() => focusTitleInputRef.current?.(), 50)}
        />
      )}

      {/* Right rail */}
      {showRightRail && (
        <div className="flex h-full w-9 shrink-0 flex-col items-center border-l border-border bg-background-primary py-2">
          <div className="flex flex-col items-center gap-xs">
            {RIGHT_RAIL_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                onClick={() => onRailItemToggle?.(item.id)}
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-sm",
                  activeRailItem === item.id && item.accent
                    ? "bg-action-default-background-press text-action-default-text"
                    : activeRailItem === item.id
                      ? "bg-background-tertiary text-text-primary"
                      : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary",
                )}
              >
                <Icon name={item.icon} size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
