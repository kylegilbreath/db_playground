"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { DropdownMenu } from "@/components/DropdownMenu";
import { IconButton } from "@/components/IconButton";
import { TertiaryButton } from "@/components/TertiaryButton";
import { Icon } from "@/components/icons";

import { Avatar } from "./Avatar";
import { DatabricksLockup } from "./DatabricksLockup";
import { getAppSwitcherItems, getAvatarMenuItems, getWorkspaceSelectorItems } from "./menuItems";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function GradientMaskIcon({ name, size }: { name: string; size: number }) {
  const url = `/icons/${name}.svg`;
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        // Use the icon SVG as a mask, but fill the masked area with the AI gradient.
        backgroundImage:
          "var(--ai-gradient, linear-gradient(45deg, #4299e0 24%, #ca42e0 47%, #ff5f46 76%))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
        WebkitMaskImage: `url("${url}")`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        WebkitMaskSize: "contain",
        maskImage: `url("${url}")`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
        maskMode: "alpha",
      }}
    />
  );
}

export type TopNavProps = {
  className?: string;
  /** Initials shown in the avatar (demo-only). */
  avatarInitial?: string;
  /** When true, remove the header background color. */
  transparentBackground?: boolean;
  /** Controlled collapsed state for the sidebar (left nav). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  /** Optional floating sidebar card rendered on hover when collapsed. */
  sidebarHoverCard?: React.ReactNode;
  /** When true, hide the sidebar toggle (and any hover sidebar). */
  hideSidebarToggle?: boolean;
  /** When true, show a menu-style toggle icon (responsive behavior). */
  useMenuIcon?: boolean;
  /** When true, hide the Genie Code icon button (e.g. when on the Genie Chat page). */
  hideGenieCodeButton?: boolean;
  /** When true, show the Genie Code button in its active/pressed state. */
  genieCodeActive?: boolean;
  /** Called when the Genie Code icon button is clicked. */
  onGenieCodeClick?: () => void;
};

export function TopNav({
  className,
  avatarInitial = "D",
  transparentBackground = false,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  sidebarHoverCard,
  hideSidebarToggle = false,
  useMenuIcon = false,
  hideGenieCodeButton = false,
  genieCodeActive = false,
  onGenieCodeClick,
}: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const homeHref =
    pathname.startsWith("/one") || pathname.startsWith("/databricks-one") ? "/one" : "/";
  const isControlled = collapsedProp !== undefined;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState(defaultCollapsed);
  const collapsed = isControlled ? Boolean(collapsedProp) : uncontrolledCollapsed;

  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  React.useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light",
    );
  }, []);
  const toggleTheme = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }, [theme]);

  const [isHoverOpen, setIsHoverOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<number | null>(null);
  const hoverContainerRef = React.useRef<HTMLDivElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);

  const clearCloseTimeout = React.useCallback(() => {
    if (closeTimeoutRef.current === null) return;
    window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }, []);

  const getHoverUnionRect = React.useCallback((): DOMRect | null => {
    const a = hoverContainerRef.current?.getBoundingClientRect() ?? null;
    const b = popoverRef.current?.getBoundingClientRect() ?? null;
    if (!a && !b) return null;
    if (a && !b) return a;
    if (!a && b) return b;
    const left = Math.min(a!.left, b!.left);
    const top = Math.min(a!.top, b!.top);
    const right = Math.max(a!.right, b!.right);
    const bottom = Math.max(a!.bottom, b!.bottom);
    return new DOMRect(left, top, right - left, bottom - top);
  }, []);

  const distanceToRect = React.useCallback((x: number, y: number, r: DOMRect) => {
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.hypot(dx, dy);
  }, []);

  const openHover = React.useCallback(() => {
    clearCloseTimeout();
    setIsHoverOpen(true);
  }, [clearCloseTimeout]);

  const scheduleCloseHover = React.useCallback(() => {
    clearCloseTimeout();
    // Grace period so users can drift off the card briefly.
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsHoverOpen(false);
      closeTimeoutRef.current = null;
    }, 250);
  }, [clearCloseTimeout]);

  React.useEffect(() => {
    if (!collapsed) setIsHoverOpen(false);
  }, [collapsed]);
  React.useEffect(() => {
    return () => clearCloseTimeout();
  }, [clearCloseTimeout]);

  React.useEffect(() => {
    // If we're already counting down to close and the pointer moves far away,
    // close immediately (user intent likely moved on).
    if (closeTimeoutRef.current === null) return;

    const FAR_AWAY_PX = 160;

    const onPointerMove = (e: PointerEvent) => {
      const r = getHoverUnionRect();
      if (!r) return;
      const d = distanceToRect(e.clientX, e.clientY, r);
      if (d > FAR_AWAY_PX) {
        clearCloseTimeout();
        setIsHoverOpen(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [clearCloseTimeout, distanceToRect, getHoverUnionRect, isHoverOpen]);

  const setCollapsed = (next: boolean) => {
    if (!isControlled) setUncontrolledCollapsed(next);
    onCollapsedChange?.(next);
  };

  const sidebarToggleIconName = useMenuIcon
    ? "menuIcon"
    : collapsed
      ? "sidebarClosedIcon"
      : "sidebarOpenIcon";

  const sidebarToggleLabel = useMenuIcon
    ? "Menu"
    : collapsed
      ? "Open sidebar"
      : "Close sidebar";

  return (
    <header
      className={cx(
        "relative flex w-full items-center gap-sm pr-4 pt-2 pb-0",
        hideSidebarToggle ? "pl-[29px]" : "pl-4",
        transparentBackground ? "bg-transparent" : "bg-background-secondary",
        className,
      )}
    >
      {/* Left cluster */}
      <div className="flex shrink-0 items-center gap-mid">
        {!hideSidebarToggle ? (
          <div
            ref={hoverContainerRef}
            className="relative"
            onMouseEnter={() => {
              if (collapsed && sidebarHoverCard) openHover();
            }}
            onMouseLeave={() => scheduleCloseHover()}
          >
            <IconButton
              aria-label={sidebarToggleLabel}
              icon={<Icon name={sidebarToggleIconName} size={16} />}
              onClick={() => setCollapsed(!collapsed)}
              tone="neutral"
            />

            {collapsed && sidebarHoverCard && isHoverOpen ? (
              <div
                ref={popoverRef}
                className="absolute -left-sm top-full z-50"
                onMouseEnter={() => openHover()}
                onMouseLeave={() => scheduleCloseHover()}
              >
                {sidebarHoverCard}
              </div>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-default-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary"
          onClick={() => router.push(homeHref)}
          aria-label="Home"
        >
          <DatabricksLockup />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex min-w-0 flex-1 justify-center px-2">
        <div className="w-full max-w-[504px]">
          {/* Hidden for presentation-prep; keep center spacing. */}
          <div className="h-10 w-full" aria-hidden="true" />
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex shrink-0 items-center gap-xs">
        <DropdownMenu
          width={180}
          align="end"
          items={getWorkspaceSelectorItems()}
          trigger={({ triggerRef, triggerProps }) => (
            <span ref={triggerRef} className="inline-flex">
              <TertiaryButton
                {...triggerProps}
                tone="neutral"
                menu
                // Ensure it matches the top bar rhythm.
                size="default"
              >
                Production
              </TertiaryButton>
            </span>
          )}
        />

        <IconButton
          aria-label="Assistant"
          icon={<GradientMaskIcon name="SparkleIcon" size={16} />}
          tone="neutral"
          className="hidden"
          hidden
        />

        {!hideGenieCodeButton && (
          <IconButton
            aria-label="Open Genie Code"
            icon={<GradientMaskIcon name="genieIcon" size={16} />}
            tone="neutral"
            onClick={onGenieCodeClick}
            style={genieCodeActive ? { backgroundColor: "var(--background-tertiary)" } : undefined}
          />
        )}

        <DropdownMenu
          align="end"
          variant="rich"
          widthMode="content"
          items={getAppSwitcherItems(router)}
          trigger={({ triggerRef, triggerProps }) => (
            <span ref={triggerRef} className="inline-flex">
              <IconButton
                {...triggerProps}
                aria-label="Apps"
                icon={<Icon name="AppsIcon" size={16} />}
                tone="neutral"
              />
            </span>
          )}
        />

        <DropdownMenu
          align="end"
          width={220}
          items={getAvatarMenuItems(theme, toggleTheme)}
          trigger={({ triggerRef, triggerProps }) => (
            <span ref={triggerRef} className="inline-flex">
              <Avatar {...triggerProps} aria-label="User menu" initial={avatarInitial} />
            </span>
          )}
        />
      </div>
    </header>
  );
}

