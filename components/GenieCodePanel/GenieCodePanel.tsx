"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { GenieChatIcon } from "@/components/GenieChatIcon";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import { TertiaryButton } from "@/components/TertiaryButton";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const SUGGESTIONS = [
  {
    id: "eda",
    text: (
      <>
        Perform basic exploratory data analysis on the properties in{" "}
        <code className="font-mono text-text-primary">@ski_resorts</code>
      </>
    ),
    plainText: "Perform basic exploratory data analysis on the properties in @ski_resorts",
  },
  {
    id: "top-bottom",
    text: "Show top and bottom 10 resorts by each key metric.",
    plainText: "Show top and bottom 10 resorts by each key metric.",
  },
  {
    id: "cluster",
    text: "Cluster resorts into groups based on price, size, and snowfall.",
    plainText: "Cluster resorts into groups based on price, size, and snowfall.",
  },
];

export type GenieCodePanelProps = {
  onClose?: () => void;
};

export function GenieCodePanel({ onClose }: GenieCodePanelProps) {
  const [inputValue, setInputValue] = React.useState("");
  const router = useRouter();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-tr-xl rounded-br-xl border border-border bg-background-primary">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-sm border-b border-border px-sm py-sm">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
          Genie Code
        </span>
        <div className="flex items-center">
          <IconButton
            aria-label="New chat"
            icon={<Icon name="plusIcon" size={16} />}
            tone="neutral"
          />
          <IconButton
            aria-label="History"
            icon={<Icon name="historyIcon" size={16} />}
            tone="neutral"
          />
          <IconButton
            aria-label="More options"
            icon={<Icon name="overflowIcon" size={16} />}
            tone="neutral"
          />
          <IconButton
            aria-label="Open Genie Chat"
            icon={<Icon name="fullscreenIcon" size={16} />}
            tone="neutral"
            className="border border-border"
            onClick={() => { onClose?.(); router.push("/chat"); }}
          />
        </div>
      </div>

      {/* Body — empty state */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-lg overflow-y-auto p-md">
        <div className="flex w-full max-w-[336px] flex-col items-center gap-lg">
          {/* Icon */}
          <div className="flex flex-col items-center gap-md px-6">
            <GenieChatIcon size={64} />
            <div className="flex flex-col items-center gap-sm text-center">
              <p className="text-[22px] font-semibold leading-7 text-text-primary">
                Genie Code
              </p>
              <p className="text-sm text-text-secondary">
                Genie Code is an autonomous AI partner for modern data teams
              </p>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="flex w-full flex-col gap-sm px-5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setInputValue(s.plainText)}
                className={cx(
                  "flex w-full items-start gap-xs overflow-hidden",
                  "rounded-tl-none rounded-tr-md rounded-br-md rounded-bl-md",
                  "bg-background-secondary px-3 py-[6px]",
                  "text-left text-sm text-text-primary",
                  "hover:bg-background-hover transition-colors",
                )}
              >
                {/* Arrow icon */}
                <span className="mt-[2px] shrink-0 text-[color:var(--ai-gradient-mid,#ca42e0)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h8M8 5l3 3-3 3" stroke="url(#gc-arrow-grad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="gc-arrow-grad" x1="3" y1="8" x2="11" y2="8" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4299e0" />
                        <stop offset="0.5" stopColor="#ca42e0" />
                        <stop offset="1" stopColor="#ff5f46" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <span className="min-w-0">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compose footer */}
      <div className="shrink-0 px-3 pb-sm pt-0">
        {/* gradient fade */}
        <div className="pointer-events-none -mt-8 h-8 bg-gradient-to-t from-background-primary to-transparent" />

        <div className="flex flex-col gap-sm rounded-md border border-border bg-background-primary shadow-sm">
          {/* Text input row */}
          <div className="flex items-center gap-xs px-sm pt-sm">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="@ for objects or '/' for commands, ↑↓ for history"
              rows={1}
              className={cx(
                "min-h-0 flex-1 resize-none bg-transparent text-sm text-text-primary outline-none",
                "placeholder:text-text-secondary",
                "leading-5",
              )}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }}
            />
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between px-sm pb-sm">
            {/* Left actions */}
            <div className="flex items-center gap-xs">
              <IconButton
                aria-label="Attach image"
                icon={<Icon name="imageIcon" size={16} />}
                tone="neutral"
                size="small"
              />
              <IconButton
                aria-label="Mention"
                icon={<Icon name="AtIcon" size={16} />}
                tone="neutral"
                size="small"
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-sm">
              <TertiaryButton
                tone="neutral"
                size="small"
                menu
              >
                Agent
              </TertiaryButton>
              <IconButton
                aria-label="Send"
                icon={<Icon name="SendIcon" size={16} />}
                tone="neutral"
                size="small"
              />
            </div>
          </div>
        </div>

        <p className="mt-xs text-center text-xs text-text-secondary">
          Always review the accuracy of responses.
        </p>
      </div>
    </div>
  );
}
