"use client";
import * as React from "react";
import { Icon } from "@/components/icons";
import type { Asset } from "../types";

function iconForKind(kind: Asset["kind"]): string {
  switch (kind) {
    case "notebook": return "notebookIcon";
    case "file": return "fileCodeIcon";
    case "model": return "fileDocumentIcon";
    case "table": return "tableIcon";
  }
}

export function AssetChip({ asset, onClick }: { asset: Asset; onClick?: (asset: Asset) => void }) {
  const inner = (
    <>
      <Icon name={iconForKind(asset.kind)} size={12} className="text-text-secondary" />
      {asset.name}
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(asset)}
        className="inline-flex items-center gap-xs rounded-sm border border-border px-xs py-0 text-paragraph leading-5 text-text-primary hover:bg-background-secondary"
      >
        {inner}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-xs rounded-sm border border-border px-xs py-0 text-paragraph leading-5 text-text-primary">
      {inner}
    </span>
  );
}
