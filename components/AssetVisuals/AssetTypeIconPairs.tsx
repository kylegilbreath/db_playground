import * as React from "react";

import { Icon } from "@/components/icons";

import { ASSET_TYPE_ICON_NAME, AssetTypes } from "./assetTypeIcons";

export function AssetTypeIconPairs() {
  return (
    <div className="flex w-full flex-col gap-sm">
      <ul className="flex w-full flex-col gap-xs">
        {Object.entries(AssetTypes).map(([typeKey, typeValue]) => {
          const iconName = ASSET_TYPE_ICON_NAME[typeValue];
          return (
            <li
              key={typeValue}
              className="flex items-center gap-sm rounded-md border border-border bg-background-primary px-sm py-xs"
            >
              <Icon name={iconName} size={16} className="text-text-primary" />
              <span className="min-w-0 flex-1 truncate font-mono text-paragraph text-text-primary">
                {typeKey}
              </span>
              <span className="shrink-0 font-mono text-paragraph text-text-secondary">
                {iconName}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

