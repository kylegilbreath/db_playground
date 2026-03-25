"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type AlertTone = "danger" | "warning" | "info" | "success";
export type AlertSize = "default" | "small";
export type AlertActionsPlacement = "inline" | "stacked";

export type AlertAction = {
  id: string;
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

export type AlertProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  tone?: AlertTone;
  size?: AlertSize;

  title: React.ReactNode;
  description?: React.ReactNode;

  actions?: AlertAction[];
  actionsPlacement?: AlertActionsPlacement;

  /** When provided, a close icon button is shown. */
  onClose?: () => void;
};

function getToneConfig(tone: AlertTone) {
  switch (tone) {
    case "danger":
      return {
        iconName: "DangerFillIcon",
        container: "bg-background-danger border-border-danger",
        text: "text-text-validation-danger",
        icon: "text-text-validation-danger",
      } as const;
    case "warning":
      return {
        iconName: "warningFilledIcon",
        container: "bg-background-warning border-border-warning",
        text: "text-text-validation-warning",
        icon: "text-text-validation-warning",
      } as const;
    case "success":
      return {
        iconName: "checkCircleFilledIcon",
        container: "bg-background-success border-border-success",
        text: "text-text-validation-success",
        icon: "text-text-validation-success",
      } as const;
    case "info":
      return {
        iconName: "infoFilledIcon",
        container: "bg-background-secondary border-border",
        text: "text-text-primary",
        icon: "text-text-secondary",
      } as const;
  }
}

export function Alert({
  tone = "info",
  size = "default",
  title,
  description,
  actions,
  actionsPlacement = "inline",
  onClose,
  className,
  ...rest
}: AlertProps) {
  const cfg = getToneConfig(tone);
  const isSmall = size === "small";
  const hasDescription = description !== undefined && description !== null;
  const actionItems = (actions ?? []).slice(0, 3);
  const hasActions = actionItems.length > 0;

  const padding = isSmall ? "px-sm py-xs" : "pl-mid pr-sm py-sm";
  const iconGap = isSmall ? "gap-sm" : "gap-sm";
  const textSize = isSmall ? "text-hint leading-4" : "text-paragraph leading-5";

  const centerSmallInlineNoDesc = isSmall && actionsPlacement === "inline" && !hasDescription;

  const actionsRow = hasActions ? (
    <div className={cx("flex flex-wrap items-center gap-xs", actionsPlacement === "inline" && "shrink-0")}>
      {actionItems.map((a) => (
        <DefaultButton
          key={a.id}
          size="small"
          disabled={a.disabled}
          onClick={() => a.onClick?.()}
        >
          {a.label}
        </DefaultButton>
      ))}
    </div>
  ) : null;

  return (
    <div
      {...rest}
      className={cx(
        "flex w-full rounded-sm border",
        centerSmallInlineNoDesc ? "items-center" : "items-start",
        cfg.container,
        padding,
        className,
      )}
    >
      <div className={cx("flex min-w-0 flex-1", centerSmallInlineNoDesc ? "items-center" : "items-start", iconGap)}>
        <span
          className={cx(
            "inline-flex size-4 shrink-0 items-center justify-center",
            cfg.icon,
            // Nudge icon down to align with title cap height (Figma).
            centerSmallInlineNoDesc ? undefined : isSmall ? "mt-px" : "mt-[2px]",
          )}
          aria-hidden="true"
        >
          <Icon name={cfg.iconName} size={16} />
        </span>

        <div
          className={cx(
            "flex min-w-0 flex-1",
            actionsPlacement === "stacked" ? "flex-col" : "items-center",
            actionsPlacement === "stacked"
              ? isSmall
                ? "gap-0"
                : "gap-xs"
              : "gap-sm",
          )}
        >
          <div className={cx("min-w-0 flex-1", cfg.text)}>
            <div className={cx("font-semibold", textSize)}>{title}</div>
            {hasDescription ? (
              <div className={cx(textSize, !isSmall && "py-[2px]")}>{description}</div>
            ) : null}
          </div>

          {hasActions && actionsPlacement === "inline" ? (
            <div className={cx("self-center", centerSmallInlineNoDesc ? "py-0" : isSmall ? "py-xs" : "py-0")}>
              {actionsRow}
            </div>
          ) : null}

          {hasActions && actionsPlacement === "stacked" ? (
            <div className={cx(isSmall ? "pt-xs pb-xs" : "pb-xs")}>{actionsRow}</div>
          ) : null}
        </div>
      </div>

      {onClose ? (
        <div className={cx("shrink-0", isSmall ? "pt-0" : "pt-[2px]")}>
          <IconButton
            aria-label="Close"
            size="small"
            icon={<Icon name="closeSmallIcon" size={16} />}
            onClick={() => onClose()}
          />
        </div>
      ) : null}
    </div>
  );
}

