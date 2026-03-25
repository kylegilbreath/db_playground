"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import { AnythingBoxMode, AnythingBoxModeToggle } from "./ModeToggle";
import { AnythingBoxSubmitButton } from "./SubmitButton";

export type AnythingBoxPhase =
  | "pre" // user can toggle between Search and Ask
  | "search" // focused in search
  | "chat" // focused in ask/chat
  | "followup" // lightweight follow-up input (AI overview)
  | "editing"; // composing an ask prompt

export type AnythingBoxProps = {
  className?: string;
  /**
   * Optional styling overrides for the inner surface element.
   * Intended for lightweight, local tweaks (e.g. a top-nav search bar).
   */
  surfaceClassName?: string;

  /** Current mode (search vs ask). */
  mode?: AnythingBoxMode;
  defaultMode?: AnythingBoxMode;
  onModeChange?: (mode: AnythingBoxMode) => void;

  /**
   * Optional actions rendered on the right side of the input bar in `phase="search"`.
   * Purely presentational: these callbacks should be wired to business logic elsewhere.
   */
  searchActions?: AnythingBoxSearchAction[];

  /**
   * Called when the clear (close) button is clicked in `phase="search"`.
   * Note: `AnythingBox` does not clear its value internally; delegate to the parent.
   */
  onClearSearch?: () => void;

  /**
   * Phase controls which sub-layout is visible.
   * - In `pre`, mode is toggleable
   * - In other phases, mode is treated as locked (focused)
   */
  phase?: AnythingBoxPhase;

  /** Placeholder text shown in the input bar. */
  placeholder?: string;

  /** Optional value for the main input. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;

  /**
   * Optional reference tags row (Chat only).
   * Only rendered when provided to avoid inventing UI not present in your design state.
   */
  references?: string[];

  /** Called when the submit button is clicked. */
  onSubmit?: () => void;
  loading?: boolean;
};

export type AnythingBoxSearchAction = {
  id: string;
  ariaLabel: string;
  /** Icon name in `public/icons/` (without extension). */
  iconName: string;
  onClick?: () => void;
  disabled?: boolean;
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function AnythingBox({
  className,
  surfaceClassName,
  mode: modeProp,
  defaultMode = "ask",
  onModeChange,
  searchActions,
  onClearSearch,
  phase = "pre",
  placeholder,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  references,
  onSubmit,
  loading = false,
}: AnythingBoxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isModeControlled = modeProp !== undefined;
  const [uncontrolledMode, setUncontrolledMode] =
    React.useState<AnythingBoxMode>(defaultMode);
  const mode = isModeControlled ? (modeProp as AnythingBoxMode) : uncontrolledMode;

  const actions: AnythingBoxSearchAction[] =
    searchActions ??
    [
      { id: "pin-list", ariaLabel: "Pinned list", iconName: "pinOutlinedIcon" },
      { id: "feedback", ariaLabel: "Provide feedback", iconName: "InfoIcon" },
    ];

  const isValueControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = isValueControlled ? String(valueProp) : uncontrolledValue;
  const hasText = value.length > 0;

  const locked = phase !== "pre";

  const setMode = (next: AnythingBoxMode) => {
    if (locked) return;
    if (!isModeControlled) setUncontrolledMode(next);
    onModeChange?.(next);
  };

  const setValue = (next: string) => {
    if (!isValueControlled) setUncontrolledValue(next);
    onValueChange?.(next);
  };

  const container = cx(
    "w-full",
    phase === "search" || phase === "followup" ? "rounded-[16px]" : "rounded-[24px]",
    phase === "editing" ? undefined : "shadow-[var(--elevation-shadow-md)]",
    className,
  );

  const hasButtonRow = phase === "pre" || phase === "chat" || phase === "editing";

  const handleSurfaceMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Don't steal focus when the user is interacting with controls inside the box.
    // (Buttons, inputs, links, etc. should keep their normal behavior.)
    if (target.closest("button,a,input,textarea,select,[role='button']")) return;

    // Focus the main input when clicking the background/padding.
    e.preventDefault();
    inputRef.current?.focus();
  };

  const surface = cx(
    phase === "editing"
      ? "bg-background-primary rounded-[24px] p-4"
      : phase === "search" || phase === "followup"
        ? "bg-background-primary border border-border rounded-[16px] px-4 py-3"
        : "bg-background-primary border border-border rounded-[24px] p-4",
    // Figma uses a tighter vertical rhythm between input + action row in these phases.
    hasButtonRow ? "flex flex-col gap-md" : "flex flex-col gap-lg",
    surfaceClassName,
  );

  const inputRow = (
    <div className="flex h-6 items-center gap-xs">
      {phase === "search" ? (
        <Icon name="searchIcon" size={16} className="text-action-default-icon-default" />
      ) : phase === "followup" ? (
        <Icon
          name="speechBubbleIcon"
          size={16}
          className="text-action-default-icon-default"
        />
      ) : null}

      <input
        ref={inputRef}
        className={cx(
          "w-full bg-transparent text-paragraph leading-5 outline-none placeholder:text-text-secondary",
          phase === "editing" || hasText ? "text-text-primary" : "text-text-secondary",
        )}
        onKeyDown={(e) => {
          // Enable "submit on Enter" for the search demo (and other uses).
          if (e.key !== "Enter" || e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
          if ((e as unknown as { isComposing?: boolean }).isComposing) return;
          if (!value.trim()) return;
          e.preventDefault();
          onSubmit?.();
        }}
        placeholder={
          placeholder ||
          (phase === "search"
            ? "Search anything..."
            : phase === "chat"
              ? "@ for references, / for commands"
            : mode === "search"
              ? "Search Dashboards, Genie spaces, and Apps"
              : "@ for references, / for commands")
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {phase === "search" ? (
        <div className="flex items-center gap-sm">
          {hasText ? (
            <IconButton
              aria-label="Clear"
              size="small"
              radius="default"
              icon={<Icon name="closeIcon" size={16} />}
              onClick={() => onClearSearch?.()}
            />
          ) : null}

          {hasText && actions.length ? <div className="h-6 w-px bg-border" /> : null}

          {actions.map((a) => (
            <IconButton
              key={a.id}
              aria-label={a.ariaLabel}
              disabled={a.disabled}
              size="small"
              radius="default"
              icon={<Icon name={a.iconName} size={16} />}
              onClick={() => a.onClick?.()}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const referencesRow =
    phase === "chat" && references && references.length ? (
      <div className="flex flex-wrap gap-sm">
        {references.map((r) => (
          <span
            key={r}
            className="inline-flex h-5 items-center rounded-sm bg-tag-background-default px-xs text-paragraph leading-5 text-tag-text-default"
          >
            {r}
          </span>
        ))}
      </div>
    ) : null;

  const actionRow =
    phase === "pre" ? (
      <div className="flex items-end gap-sm">
        <div className="flex h-8 items-center gap-sm">
          <AnythingBoxModeToggle mode={mode} locked={locked} onModeChange={setMode} />
          {mode === "ask" ? (
            <IconButton
              aria-label="Add"
              radius="full"
              icon={<Icon name="plusIcon" size={16} />}
            />
          ) : null}
        </div>
        <div className="flex-1" />
        <AnythingBoxSubmitButton
          direction={mode === "ask" ? "up" : "right"}
          disabled={!value.trim()}
          loading={loading}
          onClick={onSubmit}
        />
      </div>
    ) : phase === "chat" ? (
      <div className="flex items-end gap-sm">
        <div className="flex h-8 items-center gap-sm">
          <IconButton
            aria-label="Add"
            radius="full"
            icon={<Icon name="plusIcon" size={16} />}
          />
        </div>
        <div className="flex-1" />
        <AnythingBoxSubmitButton
          direction="up"
          disabled={!value.trim()}
          loading={loading}
          onClick={onSubmit}
        />
      </div>
    ) : phase === "editing" ? (
      <div className="flex items-end gap-sm">
        <div className="flex-1" />
        <div className="flex items-center gap-sm">
          <DefaultButton radius="full">Cancel</DefaultButton>
          <DefaultButton radius="full">Send</DefaultButton>
        </div>
      </div>
    ) : null;

  return (
    <div className={container}>
      <div className={surface} onMouseDown={handleSurfaceMouseDown}>
        {referencesRow}
        {inputRow}
        {actionRow}
      </div>
    </div>
  );
}

