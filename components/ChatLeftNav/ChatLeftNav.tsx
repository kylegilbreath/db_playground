"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { LeftNavItem } from "@/components/PlatformChrome/LeftNavItem";
import { LeftNavSectionHeader } from "@/components/PlatformChrome/LeftNavSectionHeader";
import { TextInput } from "@/components/TextInput";
import { Icon } from "@/components/icons";

const DEFAULT_WIDTH = 220;
const MIN_WIDTH = 180;
const MAX_WIDTH = 480;

type ChatThreadItem = {
  id: string;
  title: string;
};

type ChatHistorySection = {
  label: string;
  items: ChatThreadItem[];
};

type ChatLeftNavProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const CHAT_HISTORY: ChatHistorySection[] = [
  {
    label: "Today",
    items: [
      { id: "t1", title: "Sev0 Bug report" },
      { id: "t2", title: "Revenue drop analysis" },
    ],
  },
  {
    label: "Recent",
    items: [
      { id: "t3", title: "Customer churn drivers" },
      { id: "t4", title: "Inventory discrepancy check" },
      { id: "t5", title: "Campaign performance comparison" },
      { id: "t6", title: "Dashboard performance issue" },
      { id: "t7", title: "Churn model insights" },
      { id: "t8", title: "Transaction anomaly review" },
    ],
  },
];

export function ChatLeftNav({ selectedId, onSelect }: ChatLeftNavProps) {
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const [openSections, setOpenSections] = React.useState<Set<string>>(
    () => new Set(CHAT_HISTORY.map((s) => s.label)),
  );
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startWidth = React.useRef(DEFAULT_WIDTH);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = moveEvent.clientX - startX.current;
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
        setWidth(next);
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  return (
    <aside
      className="relative flex shrink-0 flex-col border-r border-border"
      style={{
        width,
        "--one-accent-bg": "var(--background-tertiary)",
        "--one-accent-bg-hover": "var(--background-tertiary)",
      } as React.CSSProperties}
    >
      <div className="flex shrink-0 items-center gap-sm px-md pt-md">
        <span className="min-w-0 flex-1 truncate text-paragraph font-semibold leading-5 text-text-primary">
          Chat
        </span>
        <div className="flex shrink-0 items-center gap-xs">
          <Icon name="circleIcon" size={16} className="text-green-600" />
          <IconButton
            aria-label="Toggle sidebar"
            icon={<Icon name="sidebarOpenIcon" size={16} />}
            size="small"
            tone="neutral"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-md overflow-y-auto pt-md">
        <div className="flex shrink-0 flex-col gap-sm px-md">
          <DefaultButton
            className="w-full !rounded-md"
            leadingIcon={<Icon name="pencilIcon" size={16} />}
            onClick={() => onSelect(null)}
          >
            New chat
          </DefaultButton>
          <TextInput
            iconPrefix={<Icon name="searchIcon" size={16} />}
            placeholder="Search chats"
            className="!rounded-md"
          />
        </div>

        <div className="flex flex-col px-mid">
          {CHAT_HISTORY.map((section, sectionIndex) => (
            <div key={section.label} className={`flex flex-col gap-[2px] ${sectionIndex > 0 ? "mt-sm" : ""}`}>
              <LeftNavSectionHeader
                className="!px-sm"
                label={section.label}
                open={openSections.has(section.label)}
                onToggle={() =>
                  setOpenSections((prev) => {
                    const next = new Set(prev);
                    if (next.has(section.label)) next.delete(section.label);
                    else next.add(section.label);
                    return next;
                  })
                }
              />
              {openSections.has(section.label) && section.items.map((item) => (
                <LeftNavItem
                  key={item.id}
                  className="!h-8 !rounded-md !px-sm"
                  label={item.title}
                  selected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                  trailingAction={{
                    iconName: "overflowHorizontalIcon",
                    ariaLabel: `Actions for ${item.title}`,
                    onClick: () => {},
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize chat sidebar"
        className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-action-default-border-hover active:bg-action-default-border-hover"
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}
