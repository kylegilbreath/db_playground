import * as React from "react";
import { Icon } from "@/components/icons";
import { AssetChip } from "../primitives/AssetChip";
import type { AgentAction } from "../types";

export function ActionRow({ action }: { action: AgentAction }) {
  return (
    <div className="flex items-center gap-xs text-paragraph leading-5">
      <span className="text-text-secondary">{action.verb}</span>
      <AssetChip asset={action.asset} />
      {action.status === "done" && (
        <Icon name="checkIcon" size={14} className="ml-auto text-green-500" />
      )}
      {action.status === "running" && (
        <span className="ml-auto inline-block h-2 w-2 animate-pulse rounded-full bg-action-default-icon-default" />
      )}
      {action.status === "error" && (
        <Icon name="DangerIcon" size={14} className="ml-auto text-red-500" />
      )}
    </div>
  );
}
