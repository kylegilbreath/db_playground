"use client";

import * as React from "react";

import { AnythingBox } from "@/components/AnythingBox";
import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function useControllableString({
  value,
  defaultValue,
  onChange,
}: {
  value: string | undefined;
  defaultValue: string;
  onChange?: (next: string) => void;
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = isControlled ? String(value) : uncontrolled;
  const set = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set] as const;
}

export type AiFollowUpMode = "input" | "button";

export type AiFollowUpSuggestion = {
  id: string;
  label: string;
  highlighted?: boolean;
};

export type AiFollowUpProps =
  | {
      className?: string;
      mode: "input";
      value?: string;
      defaultValue?: string;
      onValueChange?: (v: string) => void;
      placeholder?: string;
      suggestions?: AiFollowUpSuggestion[];
      onSelectSuggestion?: (id: string) => void;
      onSubmit?: () => void;
    }
  | {
      className?: string;
      mode: "button";
      buttonLabel?: string;
      onButtonClick?: () => void;
    };

function AiFollowUpButton({
  className,
  buttonLabel = "Ask a follow-up",
  onButtonClick,
}: {
  className?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
}) {
  return (
    <div className={cx("flex w-full items-center justify-center", className)}>
      <DefaultButton
        leadingIcon={<Icon name="speechBubbleIcon" size={16} />}
        onClick={onButtonClick}
        radius="full"
      >
        {buttonLabel}
      </DefaultButton>
    </div>
  );
}

function AiFollowUpInput({
  className,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Ask a follow-up question",
  suggestions,
  onSelectSuggestion,
  onSubmit,
}: {
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  suggestions?: AiFollowUpSuggestion[];
  onSelectSuggestion?: (id: string) => void;
  onSubmit?: () => void;
}) {
  const [text, setText] = useControllableString({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <div className={cx("flex w-full flex-col items-stretch", className)}>
      <AnythingBox
        className="max-w-none"
        phase="followup"
        placeholder={placeholder}
        value={text}
        onValueChange={setText}
        onSubmit={onSubmit}
      />

      {suggestions && suggestions.length ? (
        <div className="mt-sm w-full">
          {suggestions.map((s, idx) => {
            const isLast = idx === suggestions.length - 1;
            return (
              <button
                key={s.id}
                className={cx(
                  "flex w-full items-center gap-sm px-sm py-mid text-left",
                  "transition-colors",
                  s.highlighted && "bg-background-secondary",
                  "hover:bg-background-secondary",
                  "active:bg-background-secondary",
                  !isLast && "border-b border-border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
                )}
                onClick={() => onSelectSuggestion?.(s.id)}
                type="button"
              >
                <span className="text-paragraph leading-5 text-text-primary">{s.label}</span>
                <span className="flex-1" />
                <IconButton
                  aria-label="Send"
                  icon={<Icon name="SendIcon" size={16} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectSuggestion?.(s.id);
                    onSubmit?.();
                  }}
                  size="small"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AiFollowUp(props: AiFollowUpProps) {
  if (props.mode === "button") {
    return <AiFollowUpButton {...props} />;
  }

  return <AiFollowUpInput {...props} />;
}

