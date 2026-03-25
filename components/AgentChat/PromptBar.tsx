"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AssetRow } from "./messages/AssetRow";
import type { ReviewAsset, RunStatus } from "./types";

// ---------------------------------------------------------------------------
// Pinned review panel — shown above the input when assets need review
// ---------------------------------------------------------------------------

function ReviewPanel({
  assets,
  onRejectAll,
  onAcceptAll,
  onAssetClick,
}: {
  assets: ReviewAsset[];
  onRejectAll?: () => void;
  onAcceptAll?: () => void;
  onAssetClick?: (asset: ReviewAsset) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const label = `${assets.length} asset${assets.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col rounded-t-lg border-x border-t border-border bg-background-secondary">
      {/* Header */}
      <div className="flex items-center gap-sm px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-xs text-paragraph font-medium text-text-primary"
        >
          <Icon
            name={open ? "chevronDownIcon" : "chevronRightIcon"}
            size={12}
            className="text-text-secondary"
          />
          {label}
        </button>
        <div className="flex-1" />
        <DefaultButton size="small" onClick={onRejectAll}>Reject All</DefaultButton>
        <PrimaryButton size="small" onClick={onAcceptAll}>Accept All</PrimaryButton>
      </div>

      {/* Asset list */}
      {open && (
        <div className="flex flex-col border-t border-border pb-1">
          {assets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} onAssetClick={onAssetClick} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PromptBar
// ---------------------------------------------------------------------------

export type PromptBarProps = {
  value: string;
  onValueChange: (v: string) => void;
  onSubmit?: () => void;
  onStop?: () => void;
  runStatus?: RunStatus;
  /** Assets pending review — when present, review panel is pinned above input */
  reviewAssets?: ReviewAsset[];
  onRejectAll?: () => void;
  onAcceptAll?: () => void;
  onAssetClick?: (asset: ReviewAsset) => void;
};

export function PromptBar({
  value,
  onValueChange,
  onSubmit,
  onStop,
  runStatus = "idle",
  reviewAssets,
  onRejectAll,
  onAcceptAll,
  onAssetClick,
}: PromptBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isRunning = runStatus === "running";
  const hasReview = reviewAssets && reviewAssets.length > 0;

  const placeholder = isRunning
    ? "Send follow-up messages to guide the Agent"
    : "@ for objects, / for commands, ↑↓ for history";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
    if ((e as any).isComposing) return;
    e.preventDefault();
    if (value.trim() && !isRunning) onSubmit?.();
  };

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex flex-col">
        {/* Pinned review panel */}
        {hasReview && (
          <ReviewPanel
            assets={reviewAssets}
            onRejectAll={onRejectAll}
            onAcceptAll={onAcceptAll}
            onAssetClick={onAssetClick}
          />
        )}

        {/* Input box */}
        <div
          className={`flex flex-col gap-sm border border-border bg-background-primary p-sm shadow-[0px_1px_0px_0px_rgba(0,0,0,0.02),0px_2px_3px_-1px_rgba(0,0,0,0.05)] ${hasReview ? "rounded-b-lg border-t-0" : "rounded-lg"}`}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest("button,input")) return;
            e.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {/* Text input */}
          <input
            ref={inputRef}
            className="w-full bg-transparent text-paragraph leading-5 text-text-primary outline-none placeholder:text-text-secondary"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Action bar */}
          <div className="flex items-center justify-between">
            {/* Left: + @ */}
            <div className="flex items-center gap-xs">
              <button
                type="button"
                aria-label="Add"
                className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
              >
                <Icon name="plusIcon" size={14} />
              </button>
              <button
                type="button"
                aria-label="Mention"
                className="flex h-6 w-6 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
              >
                <Icon name="AtIcon" size={14} />
              </button>
            </div>

            {/* Right: Agent mode + send/stop */}
            <div className="flex items-center gap-sm">
              <button
                type="button"
                className="flex items-center gap-xs text-paragraph text-text-secondary hover:text-text-primary"
              >
                Agent
                <Icon name="chevronDownIcon" size={12} />
              </button>

              {isRunning ? (
                <button
                  type="button"
                  aria-label="Stop"
                  onClick={onStop}
                  className="flex h-6 w-6 items-center justify-center rounded-sm bg-red-500 text-white hover:bg-red-600"
                >
                  <Icon name="stopIcon" size={12} className="text-white" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label="Send"
                  onClick={() => { if (value.trim()) onSubmit?.(); }}
                  disabled={!value.trim()}
                  className="flex h-6 w-6 items-center justify-center rounded-sm bg-action-default-background-press text-action-default-text disabled:opacity-40 hover:bg-action-default-background-hover"
                >
                  <Icon name="SendIcon" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-hint text-text-secondary">
        Always review the accuracy of responses.
      </p>
    </div>
  );
}
