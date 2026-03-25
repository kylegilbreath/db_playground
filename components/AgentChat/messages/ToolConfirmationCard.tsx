"use client";
import * as React from "react";
import { Icon } from "@/components/icons";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AssetChip } from "../primitives/AssetChip";
import type { ToolConfirmationMessage, ReviewAsset } from "../types";

type CardStatus = "asking" | "running" | "done" | "declined";

function Spinner() {
  return (
    <svg
      className="animate-spin text-text-secondary"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ToolConfirmationCard({
  step,
  onAllow,
  onAssetClick,
}: {
  step: ToolConfirmationMessage;
  onAllow?: () => void;
  onAssetClick?: (asset: ReviewAsset) => void;
}) {
  const [status, setStatus] = React.useState<CardStatus>("asking");
  const [expanded, setExpanded] = React.useState(false);

  const label = `${step.verb} ${step.asset.name}`;

  const handleAllow = () => { setStatus("running"); onAllow?.(); };
  const handleDecline = () => setStatus("declined");
  const handleCancel = () => setStatus("asking");

  React.useEffect(() => {
    if (status !== "running") return;
    const t = setTimeout(() => setStatus("done"), 2400);
    return () => clearTimeout(t);
  }, [status]);

  const isAsking = status === "asking";

  return (
    <div
      className={
        isAsking
          ? "overflow-clip rounded-md border border-action-default-border-focus bg-background-primary shadow-[0_0_0_3px_#dde8f3]"
          : "overflow-clip rounded-md border border-border bg-background-primary"
      }
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => isAsking && setExpanded((e) => !e)}
        className="flex w-full cursor-pointer items-center px-3 py-2 text-left"
        disabled={!isAsking}
      >
        {/* Left: expand chevron + label */}
        <div className="flex min-w-0 flex-1 items-center">
          {isAsking && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-text-secondary">
              <Icon
                name={expanded ? "chevronDownIcon" : "chevronRightIcon"}
                size={12}
              />
            </span>
          )}
          {!isAsking && <span className="w-1" />}
          <span className="truncate text-paragraph text-text-primary">{label}</span>
        </div>

        {/* Right: status indicator */}
        <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center">
          {status === "running" && <Spinner />}
          {status === "done" && (
            <Icon name="checkIcon" size={14} className="text-green-500" />
          )}
          {status === "declined" && (
            <Icon name="closeIcon" size={14} className="text-text-secondary" />
          )}
        </span>
      </button>

      {/* Footer */}
      {isAsking && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          {/* Permission dropdown */}
          <button
            type="button"
            className="flex items-center gap-xs rounded-sm px-1 py-0.5 text-paragraph text-text-secondary hover:bg-background-secondary hover:text-text-primary"
          >
            {step.permissionLabel ?? "Ask every time"}
            <Icon name="chevronDownIcon" size={12} />
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-xs">
            <DefaultButton size="small" onClick={handleDecline}>
              Decline
            </DefaultButton>
            <PrimaryButton size="small" onClick={handleAllow}>
              Allow
              <span className="ml-1 text-[color:#c0cdd8]">⌘↵</span>
            </PrimaryButton>
          </div>
        </div>
      )}

      {status === "running" && (
        <div className="flex items-center justify-end border-t border-border px-3 py-2">
          <DefaultButton size="small" onClick={handleCancel}>
            Cancel
          </DefaultButton>
        </div>
      )}
    </div>
  );
}
