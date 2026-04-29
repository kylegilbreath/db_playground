"use client";

import * as React from "react";

import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type TabBarTab = { id: string; label: string; modified?: boolean; icon?: string };

export type TabBarProps = {
  tabs: TabBarTab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
  onNewTab?: () => void;
};

export function TabBar({ tabs, activeId, onSelect, onClose, onNewTab }: TabBarProps) {
  return (
    <div className="flex h-10 shrink-0 items-center border-b border-border bg-background-primary pl-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeId}
          tabIndex={0}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(tab.id); }}
          className={cx(
            "flex h-full min-w-0 max-w-[min(240px,32vw)] cursor-pointer items-center gap-xs border-r border-border px-3 text-paragraph leading-5 select-none",
            tab.id === activeId
              ? "bg-background-primary font-medium text-text-primary"
              : "bg-background-secondary text-text-secondary hover:bg-background-primary",
          )}
        >
          <Icon
            name={tab.icon ?? (tab.label.endsWith(".py") ? "fileCodeIcon" : tab.label.endsWith(".md") ? "fileDocumentIcon" : "notebookIcon")}
            size={14}
            className={cx("shrink-0", tab.id === activeId ? "text-text-primary" : "text-text-secondary")}
          />
          <span className="min-w-0 flex-1 truncate" title={tab.label}>
            {tab.label}
          </span>
          <IconButton
            aria-label="Close tab"
            icon={<Icon name="closeSmallIcon" size={12} />}
            size="small"
            tone="neutral"
            onClick={(e) => { e.stopPropagation(); onClose?.(tab.id); }}
            className="shrink-0"
          />
        </div>
      ))}
      <IconButton
        aria-label="New tab"
        icon={<Icon name="plusIcon" size={14} />}
        size="small"
        tone="neutral"
        className="ml-1"
        onClick={() => onNewTab?.()}
      />
    </div>
  );
}
