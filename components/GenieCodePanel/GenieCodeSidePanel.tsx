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
  { id: "chat", icon: "speechBubbleIcon", label: "Chat" },
  { id: "outline", icon: "fileDocumentIcon", label: "Outline" },
  { id: "history", icon: "historyIcon", label: "History" },
  { id: "connections", icon: "ArrowsConnectIcon", label: "Connections" },
  { id: "settings", icon: "gearOutlinedIcon", label: "Settings" },
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
      />
      {threadSidebarOpen && (
        <GenieChatThreadSidebar
          threads={state.threads}
          activeThreadId={state.activeThreadId}
          onSelect={state.handleSelectThread}
          onNewChat={state.handleNewChat}
          onClose={() => setThreadSidebarOpen(false)}
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
