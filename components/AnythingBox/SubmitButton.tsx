"use client";

import * as React from "react";

import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

export type AnythingBoxSubmitButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** `right` matches search submit; `up` matches chat submit. */
  direction?: "right" | "up";
  ariaLabel?: string;
  className?: string;
};

export function AnythingBoxSubmitButton({
  onClick,
  disabled = false,
  loading = false,
  direction = "right",
  ariaLabel,
  className,
}: AnythingBoxSubmitButtonProps) {
  const iconName =
    direction === "up" ? "arrowUpIcon" : "arrowRightIcon";

  return (
    <IconButton
      aria-label={ariaLabel || (direction === "up" ? "Send" : "Search")}
      className={className}
      disabled={disabled || loading}
      icon={
        loading ? (
          <Icon name="syncSmallIcon" size={16} />
        ) : (
          <Icon name={iconName} size={16} />
        )
      }
      radius="full"
      onClick={onClick}
      title={ariaLabel}
    />
  );
}

