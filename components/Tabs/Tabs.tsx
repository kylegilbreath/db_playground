"use client";

import * as React from "react";

import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

export type TabsType = "lined" | "contained";
export type TabsActivationMode = "automatic" | "manual";

type TabsContextValue = {
  type: TabsType;
  activationMode: TabsActivationMode;
  value: string;
  setValue: (next: string) => void;
  focusedValue: string | null;
  setFocusedValue: (next: string | null) => void;
  registerTab: (tab: {
    value: string;
    ref: React.RefObject<HTMLElement | null>;
    disabled: boolean;
  }) => void;
  unregisterTab: (value: string) => void;
  getEnabledTabValues: () => string[];
  focusTab: (value: string) => void;
  getTabId: (value: string) => string;
  getPanelId: (value: string) => string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <TabsCollection>.");
  return ctx;
}

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
}) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const current = isControlled ? (value as T) : uncontrolled;
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );
  return [current, set] as const;
}

export type TabsCollectionProps = {
  /** Selected tab value (controlled). */
  value?: string;
  /** Initial selected tab value (uncontrolled). */
  defaultValue: string;
  /** Called when the selected tab changes. */
  onValueChange?: (nextValue: string) => void;
  /** Visual style. */
  type?: TabsType;
  /**
   * Activation behavior:
   * - `automatic`: moving focus with arrow keys selects the focused tab
   * - `manual`: arrow keys move focus; Enter/Space selects
   */
  activationMode?: TabsActivationMode;
  /** Content. Typically a `TabsList` + `TabsContent` panels. */
  children: React.ReactNode;
};

export function TabsCollection({
  value,
  defaultValue,
  onValueChange,
  type = "lined",
  activationMode = "automatic",
  children,
}: TabsCollectionProps) {
  const reactId = React.useId();
  const idBase = React.useMemo(() => `tabs-${reactId.replaceAll(":", "")}`, [reactId]);

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

  const tabsRef = React.useRef(
    new Map<string, { ref: React.RefObject<HTMLElement | null>; disabled: boolean }>(),
  );

  const registerTab = React.useCallback<TabsContextValue["registerTab"]>(
    ({ value: v, ref, disabled }) => {
      tabsRef.current.set(v, { ref, disabled });
    },
    [],
  );

  const unregisterTab = React.useCallback<TabsContextValue["unregisterTab"]>((v) => {
    tabsRef.current.delete(v);
  }, []);

  const getEnabledTabValues = React.useCallback(() => {
    return Array.from(tabsRef.current.entries())
      .filter(([, entry]) => !entry.disabled)
      .map(([v]) => v);
  }, []);

  const focusTab = React.useCallback<TabsContextValue["focusTab"]>((v) => {
    const ref = tabsRef.current.get(v)?.ref;
    ref?.current?.focus();
  }, []);

  const getTabId = React.useCallback((v: string) => `${idBase}-tab-${v}`, [idBase]);
  const getPanelId = React.useCallback((v: string) => `${idBase}-panel-${v}`, [idBase]);

  const ctx = React.useMemo<TabsContextValue>(
    () => ({
      type,
      activationMode,
      value: selectedValue,
      setValue: (next) => {
        setSelectedValue(next);
        setFocusedValue(next);
      },
      focusedValue,
      setFocusedValue,
      registerTab,
      unregisterTab,
      getEnabledTabValues,
      focusTab,
      getTabId,
      getPanelId,
    }),
    [
      type,
      activationMode,
      selectedValue,
      setSelectedValue,
      focusedValue,
      registerTab,
      unregisterTab,
      getEnabledTabValues,
      focusTab,
      getTabId,
      getPanelId,
    ],
  );

  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>;
}

export type TabsListProps = Omit<React.HTMLAttributes<HTMLDivElement>, "role"> & {
  /** Accessible label for the tab list. Provide `aria-label` or `aria-labelledby`. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export function TabsList({ className, onKeyDown, ...rest }: TabsListProps) {
  const ctx = useTabsContext();

  const focusTab = React.useCallback(
    (v: string) => {
      ctx.setFocusedValue(v);
      ctx.focusTab(v);
    },
    [ctx],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      const key = e.key;
      if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") {
        return;
      }

      const entries = ctx.getEnabledTabValues();

      if (entries.length === 0) return;

      const current = ctx.focusedValue ?? ctx.value;
      const currentIndex = Math.max(0, entries.indexOf(current));

      let nextIndex = currentIndex;
      if (key === "Home") nextIndex = 0;
      if (key === "End") nextIndex = entries.length - 1;
      if (key === "ArrowLeft") nextIndex = (currentIndex - 1 + entries.length) % entries.length;
      if (key === "ArrowRight") nextIndex = (currentIndex + 1) % entries.length;

      const nextValue = entries[nextIndex]!;
      e.preventDefault();
      focusTab(nextValue);
      if (ctx.activationMode === "automatic") ctx.setValue(nextValue);
    },
    [ctx, focusTab, onKeyDown],
  );

  if (ctx.type === "contained") {
    return (
      <div
        {...rest}
        className={cx(
          "inline-flex items-center",
          // Soft-tabs strip is 32px tall in Figma.
          "h-8",
          "bg-background-secondary",
          "overflow-x-auto",
          className,
        )}
        onKeyDown={handleKeyDown}
        role="tablist"
      />
    );
  }

  // Figma (e.g. 1778:4020, 3196:1303): row of tabs + 1px border below spanning full width.
  return (
    <div className="flex w-full flex-col items-start">
      <div
        {...rest}
        className={cx("flex items-start gap-md", className)}
        onKeyDown={handleKeyDown}
        role="tablist"
      />
      <div className="h-px w-full shrink-0 bg-border" aria-hidden="true" />
    </div>
  );
}

export type TabsLabelProps = React.HTMLAttributes<HTMLSpanElement> & {
  children: React.ReactNode;
};

export function TabsLabel({ className, children, ...rest }: TabsLabelProps) {
  return (
    <span
      {...rest}
      className={cx("text-paragraph leading-5", className)}
    >
      {children}
    </span>
  );
}

export type TabsSelectionProps = React.HTMLAttributes<HTMLDivElement> & {
  selected?: boolean;
};

export function TabsSelection({ selected = false, className, ...rest }: TabsSelectionProps) {
  return (
    <div
      {...rest}
      className={cx(
        "h-[3px] w-full shrink-0",
        selected ? "bg-action-primary-background-default" : "bg-transparent",
        className,
      )}
    />
  );
}

export type TabsItemProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "role" | "children"
> & {
  value: string;
  /** Visible label. */
  children: React.ReactNode;
  /** Disable the tab (non-interactive). */
  disabled?: boolean;
  /** Optional leading icon (16x16). Used mainly by `type="contained"`. */
  leadingIcon?: React.ReactNode;
  /** Show a close affordance. */
  closable?: boolean;
  /** Called when the close affordance is clicked. */
  onClose?: () => void;
};

export function TabsItem({
  value,
  children,
  leadingIcon,
  closable = false,
  onClose,
  className,
  disabled = false,
  onClick,
  ...rest
}: TabsItemProps) {
  const ctx = useTabsContext();
  const selected = ctx.value === value;
  const focused = (ctx.focusedValue ?? ctx.value) === value;
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ctx.registerTab({ value, ref, disabled: Boolean(disabled) });
    return () => ctx.unregisterTab(value);
  }, [ctx, value, disabled]);

  const onClickInternal = React.useCallback(() => {
    if (disabled) return;
    ctx.setValue(value);
  }, [ctx, value, disabled]);

  const onFocus = React.useCallback(() => {
    if (disabled) return;
    ctx.setFocusedValue(value);
    if (ctx.activationMode === "automatic") ctx.setValue(value);
  }, [ctx, value, disabled]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (ctx.activationMode !== "manual") return;
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ctx.setValue(value);
      }
    },
    [ctx, value, disabled],
  );

  const labelClasses = selected
    ? "text-text-primary"
    : cx(
        "text-text-secondary",
        !disabled && "hover:text-action-tertiary-text-hover active:text-action-tertiary-text-press",
        disabled && "text-action-disabled-text",
      );

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus";

  if (ctx.type === "contained") {
    return (
      <div
        {...rest}
        ref={ref}
        aria-controls={ctx.getPanelId(value)}
        aria-selected={selected}
        className={cx(
          "inline-flex items-center gap-sm px-sm py-xs",
          "border-border border-l border-solid last:border-r",
          selected ? "bg-background-primary" : "bg-action-icon-background-default",
          !disabled && !selected && "hover:bg-action-icon-background-hover active:bg-action-icon-background-press",
          disabled && "cursor-not-allowed opacity-60",
          focusRing,
          className,
        )}
        id={ctx.getTabId(value)}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          onClickInternal();
        }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-disabled={disabled || undefined}
        role="tab"
        tabIndex={focused ? 0 : -1}
      >
        <span className="inline-flex min-w-0 flex-1 items-center gap-xs">
          {leadingIcon ? (
            <span className="inline-flex h-6 items-center justify-center rounded-sm px-xs" aria-hidden="true">
              {leadingIcon}
            </span>
          ) : null}
          <TabsLabel className={cx("min-w-0 truncate font-normal", labelClasses)}>
            {children}
          </TabsLabel>
        </span>

        {closable ? (
          <IconButton
            aria-label="Close tab"
            disabled={disabled}
            icon={<Icon name="closeIcon" size={16} />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            onMouseDown={(e) => {
              // Don't move focus or trigger parent "active" styles.
              e.preventDefault();
              e.stopPropagation();
            }}
            size="small"
            tabIndex={-1}
          />
        ) : (
          // Keep spacing consistent with the closable pattern (Figma "Contained" tabs always
          // have a trailing 24px affordance region). This prevents non-closable tabs from
          // looking like they have "less right padding".
          <span className="inline-flex size-6 shrink-0" aria-hidden="true" />
        )}
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col items-start justify-end gap-px", className)}>
      <div
        {...rest}
        ref={ref}
        aria-controls={ctx.getPanelId(value)}
        aria-selected={selected}
        className={cx(
          // Lined tabs: 28px tall to match Figma content height.
          // Don't use vertical padding here, or closable tabs inflate:
          // 24px icon button + 8px padding = 32px.
          "inline-flex h-7 items-center gap-xs rounded-sm",
          labelClasses,
          disabled ? "cursor-not-allowed" : "cursor-pointer",
          focusRing,
        )}
        id={ctx.getTabId(value)}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          onClickInternal();
        }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-disabled={disabled || undefined}
        role="tab"
        tabIndex={focused ? 0 : -1}
      >
        <TabsLabel className="font-semibold">{children}</TabsLabel>
        {closable ? (
          <IconButton
            aria-label="Close tab"
            disabled={disabled}
            icon={<Icon name="closeIcon" size={16} />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            size="small"
            tabIndex={-1}
          />
        ) : null}
      </div>
      <TabsSelection selected={selected} />
    </div>
  );
}

export type TabsAddProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "children"
> & {
  /** Accessible label for the add button (required). */
  "aria-label": string;
};

export function TabsAdd({ className, ...rest }: TabsAddProps) {
  const ctx = useTabsContext();

  if (ctx.type === "contained") {
    return (
      <div
        className={cx(
          "inline-flex items-center border-border border-l border-solid",
          // Add a small gap so the + affordance doesn't feel like it's touching the last tab.
          "ml-xs",
          className,
        )}
      >
        <IconButton {...rest} icon={<Icon name="plusIcon" size={16} />} size="small" />
      </div>
    );
  }

  // Figma: `_🧱Tabs-add` (lined) is a 24px icon button inside a wrapper with `pt-[2px]`,
  // and the whole row aligns to the top (`items-start`).
  return (
    <div className={cx("flex flex-col items-center justify-end overflow-clip pt-[2px]", className)}>
      <IconButton {...rest} icon={<Icon name="plusIcon" size={16} />} size="small" />
    </div>
  );
}

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: React.ReactNode;
  /** Whether to keep inactive content mounted (hidden) instead of unmounting. */
  keepMounted?: boolean;
};

export function TabsContent({
  value,
  keepMounted = false,
  className,
  children,
  ...rest
}: TabsContentProps) {
  const ctx = useTabsContext();
  const selected = ctx.value === value;

  if (!selected && !keepMounted) return null;

  return (
    <div
      {...rest}
      aria-labelledby={ctx.getTabId(value)}
      className={cx(!selected && "hidden", className)}
      id={ctx.getPanelId(value)}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

