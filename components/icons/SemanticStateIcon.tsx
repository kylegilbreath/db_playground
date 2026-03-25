"use client";

import * as React from "react";

import { Icon, type IconProps } from "./Icon";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type SemanticStateIconKind = "favorite" | "certified" | "folder";

export type SemanticStateIconProps = Omit<IconProps, "name"> & {
  kind: SemanticStateIconKind;
  selected: boolean;
};

/**
 * SemanticStateIcon
 *
 * Presentational mapping for a few design-system “semantic” icons that:
 * - keep a special color (do not follow `currentColor`)
 * - swap assets between selected/unselected states (outline vs filled)
 *
 * This is intentionally not “business logic”: callers decide `kind` and `selected`.
 */
export function SemanticStateIcon({
  kind,
  selected,
  className,
  ...rest
}: SemanticStateIconProps) {
  const { iconName, colorClass } = (() => {
    if (kind === "favorite") {
      return {
        iconName: selected ? "starFillIcon" : "starIcon",
        colorClass: "text-signal-icon-favorited",
      };
    }

    if (kind === "certified") {
      return {
        iconName: selected ? "CertifiedFillIcon" : "CertifiedIcon",
        colorClass: "text-signal-icon-certified",
      };
    }

    return {
      iconName: selected ? "folderFilledIcon" : "folderOutlinedIcon",
      // Primitive per requirements: lighter blue in both light and dark.
      colorClass: "text-blue-400",
    };
  })();

  return <Icon {...rest} name={iconName} className={cx(colorClass, className)} />;
}

