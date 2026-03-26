"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { AssetChip } from "../primitives/AssetChip";
import type { ReviewAsset } from "../types";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function RowActions({ onReject, onAccept }: { onReject?: () => void; onAccept?: () => void }) {
  return (
    <div className="ml-auto flex items-center gap-xs opacity-0 group-hover:opacity-100">
      <button
        type="button"
        aria-label="Reject"
        onClick={onReject}
        className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
      >
        <Icon name="closeIcon" size={12} />
      </button>
      <button
        type="button"
        aria-label="Accept"
        onClick={onAccept}
        className="flex h-5 w-5 items-center justify-center rounded-sm text-text-secondary hover:bg-background-tertiary hover:text-green-600"
      >
        <Icon name="checkIcon" size={12} />
      </button>
    </div>
  );
}

export function AssetRow({ asset, onAssetClick }: { asset: ReviewAsset; onAssetClick?: (asset: ReviewAsset) => void }) {
  const [open, setOpen] = React.useState(false);
  const hasSubItems = asset.subItems && asset.subItems.length > 0;

  return (
    <div className="flex flex-col">
      {/* Main asset row */}
      <div className="group flex items-center gap-xs py-1 pl-1 pr-2">
        {hasSubItems && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="shrink-0 text-text-secondary hover:text-text-primary"
          >
            <Icon name={open ? "chevronDownIcon" : "chevronRightIcon"} size={12} />
          </button>
        )}

        <AssetChip asset={asset} onClick={onAssetClick} />

        {asset.diffCount !== undefined && (
          <span className="text-paragraph font-medium text-green-600">+{asset.diffCount}</span>
        )}

        <RowActions />
      </div>

      {/* Sub-items */}
      {open && asset.subItems && (
        <div className="flex flex-col">
          {asset.subItems.map((sub) => (
            <div key={sub.id} className="group flex items-center gap-xs py-1 pl-10 pr-2">
              <span className="min-w-0 flex-1 truncate text-paragraph text-text-secondary">
                {sub.name}
              </span>
              {sub.diffCount !== undefined && (
                <span className="shrink-0 text-paragraph font-medium text-green-600">
                  +{sub.diffCount}
                </span>
              )}
              <RowActions />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
