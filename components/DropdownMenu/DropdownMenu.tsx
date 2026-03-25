"use client";

import * as React from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type DropdownMenuItem = {
  id: string;
  label: React.ReactNode;
  /** Optional secondary text line (used in `variant="rich"`). */
  description?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  /** When true, render a divider line above this item. */
  separatorAbove?: boolean;
};

export type DropdownMenuAlign = "start" | "end";
export type DropdownMenuSide = "top" | "bottom" | "left" | "right";
export type DropdownMenuVariant = "default" | "rich";
export type DropdownMenuWidthMode = "fixed" | "content";

export type DropdownMenuProps = {
  className?: string;
  items: DropdownMenuItem[];
  /** Visual style variant. Default: "default". */
  variant?: DropdownMenuVariant;

  /** Menu width in px. Default: 240 (matches Figma). */
  width?: number;
  /**
   * Width behavior.
   * - fixed: use `width` (default)
   * - content: size to content (no explicit width styling)
   */
  widthMode?: DropdownMenuWidthMode;
  /** Which side of the trigger the menu appears on. Default: "bottom". */
  side?: DropdownMenuSide;
  /** Alignment relative to trigger. Default: start. */
  align?: DropdownMenuAlign;
  /** Gap between trigger and menu. Default: 4. */
  sideOffset?: number;

  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (next: boolean) => void;

  /**
   * Trigger renderer. Attach `triggerRef` to an element that should anchor positioning.
   * Note: many button components in this codebase don't forward refs, so a wrapping <span>
   * is a good place to attach the ref.
   */
  trigger: (args: {
    open: boolean;
    triggerRef: React.RefCallback<HTMLElement>;
    triggerProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">;
  }) => React.ReactNode;
};

export function DropdownMenu({
  className,
  items,
  variant = "default",
  width = 240,
  widthMode = "fixed",
  side = "bottom",
  align = "start",
  sideOffset = 4,
  open,
  onOpenChange,
  trigger,
}: DropdownMenuProps) {
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isOpen = isControlled ? Boolean(open) : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const placement = `${side}-${align}` as const;

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement,
    strategy: "fixed",
    middleware: [offset(sideOffset), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const menuId = React.useId();
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const focusTrigger = React.useCallback(() => {
    const el = refs.domReference.current;
    if (!el || !(el instanceof HTMLElement)) return;
    if (el instanceof HTMLButtonElement) {
      el.focus();
      return;
    }
    const btn = el.querySelector("button");
    if (btn && btn instanceof HTMLButtonElement) btn.focus();
  }, [refs.domReference]);

  // Close on outside click.
  React.useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (refs.floating.current?.contains(t)) return;
      const ref = refs.domReference.current;
      if (ref instanceof HTMLElement && ref.contains(t)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen, setOpen, refs.floating, refs.domReference]);

  // Close on Escape and handle arrow navigation.
  React.useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        focusTrigger();
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const enabledIndices = items
          .map((it, idx) => ({ it, idx }))
          .filter(({ it }) => !it.disabled)
          .map(({ idx }) => idx);
        if (enabledIndices.length === 0) return;

        const current = activeIndex >= 0 ? activeIndex : enabledIndices[0]!;
        const currentPos = enabledIndices.indexOf(current);
        const nextPos = Math.max(0, Math.min(currentPos + dir, enabledIndices.length - 1));
        const nextIdx = enabledIndices[nextPos]!;
        setActiveIndex(nextIdx);
        itemRefs.current[nextIdx]?.focus();
        return;
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [activeIndex, focusTrigger, isOpen, items, setOpen]);

  // When opening, focus first enabled item.
  React.useEffect(() => {
    if (!isOpen) return;
    const first = items.findIndex((it) => !it.disabled);
    setActiveIndex(first);
    // Wait for menu to mount.
    requestAnimationFrame(() => {
      if (first >= 0) itemRefs.current[first]?.focus();
    });
  }, [isOpen, items]);

  const triggerProps: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref"> = {
    "aria-haspopup": "menu",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? menuId : undefined,
    onClick: (e) => {
      e.preventDefault();
      setOpen(!isOpen);
    },
    onKeyDown: (e) => {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
    },
  };

  return (
    <>
      {trigger({
        open: isOpen,
        triggerRef: refs.setReference as React.RefCallback<HTMLElement>,
        triggerProps,
      })}

      {isOpen ? (
        <div
          ref={refs.setFloating}
          id={menuId}
          role="menu"
          aria-label="Menu"
          className={cx(
            "z-50",
            variant === "rich"
              ? "rounded-md border border-border bg-background-primary p-2"
              : "rounded-sm border border-border bg-background-primary py-xs",
            "shadow-[var(--elevation-shadow-lg)]",
            className,
          )}
          style={{
            ...floatingStyles,
            ...(widthMode === "fixed" ? { width: `${width}px` } : null),
          }}
        >
          {items.map((it, idx) => {
            const disabled = Boolean(it.disabled);
            return (
              <React.Fragment key={it.id}>
              {it.separatorAbove ? (
                <div className="my-xs mx-sm h-px bg-border" role="separator" />
              ) : null}
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                tabIndex={idx === activeIndex ? 0 : -1}
                ref={(node) => {
                  itemRefs.current[idx] = node;
                }}
                className={cx(
                  "flex w-full items-center",
                  variant === "rich" ? "gap-md rounded-sm px-md py-sm" : "gap-sm pl-sm pr-mid py-xs",
                  "text-left",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
                  disabled
                    ? "cursor-not-allowed text-action-disabled-text"
                    : "text-text-primary hover:bg-background-secondary active:bg-action-default-background-press",
                )}
                onMouseEnter={() => {
                  if (disabled) return;
                  setActiveIndex(idx);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (disabled) return;
                  it.onSelect?.();
                  setOpen(false);
                  focusTrigger();
                }}
              >
                {it.leadingIcon ? (
                  <span
                    className={cx(
                      "inline-flex shrink-0 items-center justify-center",
                      variant === "rich" ? "size-8" : "size-4",
                    )}
                    aria-hidden="true"
                  >
                    {it.leadingIcon}
                  </span>
                ) : null}
                {variant === "rich" ? (
                  <span className="flex min-w-0 flex-1 flex-col items-start gap-[2px]">
                    <span className="w-full min-w-0 truncate text-paragraph font-semibold leading-5 text-text-primary">
                      {it.label}
                    </span>
                    {it.description ? (
                      <span className="w-full min-w-0 truncate text-paragraph leading-5 text-text-secondary">
                        {it.description}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="min-w-0 flex-1 text-paragraph leading-5">
                    {it.label}
                  </span>
                )}
              </button>
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

