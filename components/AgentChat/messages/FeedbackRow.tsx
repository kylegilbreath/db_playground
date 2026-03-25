"use client";
import * as React from "react";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import type { FeedbackMessage } from "../types";

export function FeedbackRow({ step }: { step: FeedbackMessage }) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  void step;
  return (
    <div className="flex items-center gap-xs">
      <IconButton
        aria-label="Helpful"
        icon={<Icon name="ThumbsUpIcon" size={14} />}
        size="small"
        tone="neutral"
        onClick={() => setVote((v) => (v === "up" ? null : "up"))}
        className={vote === "up" ? "text-action-default-text" : undefined}
      />
      <IconButton
        aria-label="Not helpful"
        icon={<Icon name="ThumbsDownIcon" size={14} />}
        size="small"
        tone="neutral"
        onClick={() => setVote((v) => (v === "down" ? null : "down"))}
        className={vote === "down" ? "text-action-default-text" : undefined}
      />
      <IconButton
        aria-label="Report issue"
        icon={<Icon name="DangerIcon" size={14} />}
        size="small"
        tone="neutral"
      />
    </div>
  );
}
