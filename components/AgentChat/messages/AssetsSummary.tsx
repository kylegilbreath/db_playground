"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AssetRow } from "./AssetRow";
import type { AssetsSummaryMessage, ReviewAsset } from "../types";

export function AssetsSummary({ step, onAssetClick }: { step: AssetsSummaryMessage; onAssetClick?: (asset: ReviewAsset) => void }) {
  const [open, setOpen] = React.useState(step.defaultOpen ?? true);
  const label = `${step.assets.length} asset${step.assets.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-background-secondary">
      {/* Header */}
      <div className="flex items-center gap-sm px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-xs text-paragraph font-medium text-text-primary hover:text-text-primary"
        >
          <Icon
            name={open ? "chevronDownIcon" : "chevronRightIcon"}
            size={12}
            className="text-text-secondary"
          />
          {label}
        </button>
        <div className="flex-1" />
        <DefaultButton size="small">Reject All</DefaultButton>
        <PrimaryButton size="small">Accept All</PrimaryButton>
      </div>

      {/* Asset list */}
      {open && (
        <div className="flex flex-col border-t border-border pb-1">
          {step.assets.map((asset) => (
            <AssetRow key={asset.id} asset={asset} onAssetClick={onAssetClick} />
          ))}
        </div>
      )}
    </div>
  );
}
