"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BlobGradient } from "@/components/BlobGradient";
import { DropdownMenu } from "@/components/DropdownMenu";
import { IconButton } from "@/components/IconButton";
import { ResponsiveProvider, useResponsive } from "@/components/Responsive";
import { Icon } from "@/components/icons";
import { GenieCodeSidePanel } from "@/components/GenieCodePanel/GenieCodeSidePanel";
import { GenieCodeContext } from "@/components/GenieCodePanel/GenieCodeContext";

import { Avatar } from "./Avatar";
import { DatabricksLockup } from "./DatabricksLockup";
import { LeftNav } from "./LeftNav";
import { NavDrawer } from "./NavDrawer";
import { resolveAppConfig } from "./appConfig";
import { getAppSwitcherItems, getAvatarMenuItems } from "./menuItems";
import { TopNav } from "./TopNav";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type AppChromeProps = {
  className?: string;
  children: React.ReactNode;
};

const DEFAULT_SEARCH_TEMPLATE_ID = "tables";
const SEARCH_TEMPLATE_IDS = new Set<string>([
  "tables",
  "notebooks",
  "dashboards",
  "legacy_dashboards",
  "models",
  "genie-spaces",
  "domains",
  "discover",
]);

const DEFAULT_PANEL_WIDTH = 352;
const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 600;

function AppChromeInner({ className, children }: AppChromeProps) {
  const [userCollapsed, setUserCollapsed] = React.useState(false);
  const [genieCodeOpen, setGenieCodeOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_PANEL_WIDTH);
  const { isNarrowNav, isSmallScreen } = useResponsive();

  const handlePanelResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMouseMove = (mv: MouseEvent) => {
      // Panel is on the right, so dragging left increases width
      const next = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth - (mv.clientX - startX)));
      setPanelWidth(next);
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  React.useEffect(() => {
    if (!isSmallScreen) setDrawerOpen(false);
  }, [isSmallScreen]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (pathname === "/chat") {
      setGenieCodeOpen(false);
    } else if (sessionStorage.getItem("openGeniePanel") === "1") {
      sessionStorage.removeItem("openGeniePanel");
      setGenieCodeOpen(true);
    }
  }, [pathname]);

  const appConfig = resolveAppConfig(pathname);

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

  // Chat has an in-content sidebar; start collapsed for maximum workspace,
  // but allow users to expand the global nav if they want.
  const prevPathnameRef = React.useRef<string | null>(null);
  const chatFrom = searchParams.get("from");
  React.useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (pathname !== "/chat") return;
    if (isNarrowNav) return;
    if (chatFrom !== "search") return;
    if (prev !== "/chat") setUserCollapsed(true);
  }, [chatFrom, isNarrowNav, pathname]);

  React.useEffect(() => {
    if (pathname === "/databricks-one-chat-nav-no-top-bar/asset-matrix" && !isNarrowNav) {
      setUserCollapsed(true);
    }
  }, [pathname, isNarrowNav]);

  const collapsed = isNarrowNav ? true : userCollapsed;

  const templateParam = searchParams.get("template");
  const selectedTemplateId =
    templateParam && SEARCH_TEMPLATE_IDS.has(templateParam)
      ? templateParam
      : DEFAULT_SEARCH_TEMPLATE_ID;

  const selectedNavId =
    pathname === "/search"
      ? (searchParams.get("q") ?? "").trim().length > 0
        ? ""
        : selectedTemplateId === "legacy_dashboards"
          ? "dashboards"
          : selectedTemplateId === "genie-spaces"
            ? "genie"
            : selectedTemplateId
      : pathname === "/"
        ? "home"
      : pathname === "/chat"
        ? "chat"
      : pathname === "/discover"
        ? "discover"
      : pathname === "/agents"
        ? "agents"
      : pathname === "/ai-gateway"
        ? "ai-gateway"
      : pathname === "/editor"
        ? "editor"
      : pathname === "/one" || pathname === "/one/"
        ? "home"
      : pathname === "/one/chat" || pathname.startsWith("/one/chat/")
        ? "chat"
      : pathname.startsWith("/one/discover")
        ? "discover"
      : pathname.startsWith("/one/dashboards")
        ? "dashboards"
      : pathname.startsWith("/one/apps")
        ? "apps"
      : pathname.startsWith("/one/genie-spaces")
        ? "genie-spaces"
      : pathname.startsWith("/one/domains")
        ? "domains"
      : pathname === "/databricks-one-chat-nav-with-top-bar" || pathname === "/databricks-one-chat-nav-with-top-bar/"
        ? "home"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/chat")
        ? "chat"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/dashboards")
        ? "dashboards"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/apps")
        ? "apps"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/genie-spaces")
        ? "genie-spaces"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/domains")
        ? "domains"
      : pathname.startsWith("/databricks-one-chat-nav-with-top-bar/insights")
        ? "insights"
      : pathname === "/databricks-one-chat-nav-no-top-bar" || pathname === "/databricks-one-chat-nav-no-top-bar/"
        ? "home"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/chat")
        ? "chat"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/dashboards")
        ? "dashboards"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/apps")
        ? "apps"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/genie-spaces")
        ? "genie-spaces"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/domains")
        ? "domains"
      : pathname.startsWith("/databricks-one-chat-nav-no-top-bar/insights")
        ? "insights"
      : pathname === "/databricks-one-m2" || pathname === "/databricks-one-m2/"
        ? "home"
      : pathname.startsWith("/databricks-one-m2/chat")
        ? "chat"
      : pathname.startsWith("/databricks-one-m2/dashboards")
        ? "dashboards"
      : pathname.startsWith("/databricks-one-m2/apps")
        ? "apps"
      : pathname.startsWith("/databricks-one-m2/genie-spaces")
        ? "genie-spaces"
      : pathname.startsWith("/databricks-one-m2/domains")
        ? "domains"
      : pathname.startsWith("/databricks-one-m2/insights")
        ? "insights"
      : "";

  const isExpanded = appConfig.id === "databricks-one-expanded";
  const isNoTopbar = appConfig.id === "databricks-one-no-topbar";
  const isM2 = appConfig.id === "databricks-one-m2";
  const isOne = appConfig.id === "databricks-one";
  const basePrefix = isM2
    ? "/databricks-one-m2"
    : isNoTopbar
      ? "/databricks-one-chat-nav-no-top-bar"
      : isExpanded
        ? "/databricks-one-chat-nav-with-top-bar"
        : isOne
          ? "/one"
          : "";

  const onSelectedIdChange = React.useCallback(
    (next: string) => {
      if (next === "dashboards") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/dashboards` : `/search?template=dashboards`);
        return;
      }
      if (next === "apps") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/apps` : "/");
        return;
      }
      if (next === "tables" || next === "notebooks" || next === "models") {
        router.push(`/search?template=${encodeURIComponent(next)}`);
      }
      if (next === "chat" || next === "new-chat" || next.startsWith("chat-")) {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/chat` : "/chat");
      }
      if (next === "agents") {
        router.push("/agents");
      }
      if (next === "ai-gateway") {
        router.push("/ai-gateway");
      }
      if (next === "home") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? basePrefix || "/" : "/");
      }
      if (next === "discover") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/discover` : "/search?template=discover");
      }
      if (next === "genie" || next === "genie-spaces") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/genie-spaces` : "/search?template=genie-spaces");
      }
      if (next === "domains") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/domains` : "/search?template=domains");
      }
      if (next === "editor") {
        router.push("/editor");
      }
      if (next === "insights") {
        router.push(isOne || isExpanded || isNoTopbar || isM2 ? `${basePrefix}/insights` : "/one/insights");
      }
    },
    [router, isOne, isExpanded, isNoTopbar, isM2, basePrefix],
  );

  const isEditorRoute = pathname === "/editor";
  const isDatabricksOneRoute = appConfig.id !== "lakehouse";

  const genieCodeContextValue = React.useMemo(() => ({
    isOpen: genieCodeOpen,
    toggle: () => setGenieCodeOpen((v) => !v),
    open: () => setGenieCodeOpen(true),
    close: () => setGenieCodeOpen(false),
  }), [genieCodeOpen]);

  const isStackedNav = appConfig.navVariant === "stacked";
  const showLeftNav = (!collapsed || isStackedNav || isNoTopbar || isM2) && !((isNoTopbar || isM2) && isSmallScreen);
  const hideSidebarToggle = isStackedNav;

  const showBlob = appConfig.id === "databricks-one" || appConfig.id === "databricks-one-expanded" || appConfig.id === "databricks-one-no-topbar" || appConfig.id === "databricks-one-m2";


  return (
    <GenieCodeContext.Provider value={genieCodeContextValue}>
      <div
        className={cx(
          "flex h-dvh flex-col",
          "bg-background-shell",
          appConfig.shellClassName,
          className,
        )}
      >
        {showBlob ? <BlobGradient topAligned={showBlob && pathname !== basePrefix} /> : null}

        {appConfig.hideTopNav ? null : <TopNav
          className={isExpanded ? "!bg-[var(--one-leftnav-bg)]" : undefined}
          collapsed={collapsed}
          transparentBackground={appConfig.transparentTopNav}
          onCollapsedChange={(next) => {
            if (isNarrowNav) return;
            setUserCollapsed(next);
          }}
          useMenuIcon={isNarrowNav}
          hideSidebarToggle={hideSidebarToggle}
          hideGenieCodeButton={pathname === "/chat" || isDatabricksOneRoute}
          genieCodeActive={genieCodeOpen}
          onGenieCodeClick={() => setGenieCodeOpen((v) => !v)}
          sidebarHoverCard={
            hideSidebarToggle
              ? undefined
              : collapsed
                ? (
              <LeftNav
                sections={appConfig.sections}
                navVariant={appConfig.navVariant}
                showNewButton={appConfig.showNewButton}
                showSectionHeaders={appConfig.showSectionHeaders}
                onSelectedIdChange={onSelectedIdChange}
                selectedId={selectedNavId}
                variant="floating"
                useOneAccent={isDatabricksOneRoute}
              />
                )
                : undefined
          }
        />}

        {(isNoTopbar || isM2) && isSmallScreen ? (
          <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <LeftNav
              className="h-full bg-background-secondary"
              sections={appConfig.sections}
              navVariant={appConfig.navVariant}
              collapsed={false}
              showNewButton={appConfig.showNewButton}
              showSectionHeaders={appConfig.showSectionHeaders}
              onSelectedIdChange={(id) => { onSelectedIdChange(id); setDrawerOpen(false); }}
              selectedId={selectedNavId}
              useOneAccent={isDatabricksOneRoute}
              header={
                <div className="flex w-full items-center gap-md pl-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={isM2 ? "/logos/Nike.png" : "/logos/Databricks.svg"} alt={isM2 ? "Nike" : "Databricks"} className={isM2 ? "block h-6 w-auto shrink-0 object-contain dark:invert" : "block size-4 shrink-0"} />
                  <div className="flex-1" />
                  <IconButton
                    aria-label="Close navigation"
                    icon={<Icon name="closeIcon" size={16} />}
                    onClick={() => setDrawerOpen(false)}
                    tone="neutral"
                  />
                </div>
              }
              footer={
                <div className="flex flex-col gap-sm pl-sm">
                  <DropdownMenu
                    side="right"
                    align="start"
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
                    side="right"
                    align="start"
                    width={220}
                    items={getAvatarMenuItems(theme, toggleTheme)}
                    trigger={({ triggerRef, triggerProps }) => (
                      <span ref={triggerRef} className="inline-flex">
                        <Avatar {...triggerProps} aria-label="Account menu" initial="D" />
                      </span>
                    )}
                  />
                </div>
              }
            />
          </NavDrawer>
        ) : null}

        <div className="relative flex min-h-0 flex-1">
          {(isNoTopbar || isM2) && isSmallScreen ? (
            <div className="absolute left-3 top-3 z-30">
              <IconButton
                aria-label="Menu"
                icon={<Icon name="menuIcon" size={16} />}
                onClick={() => setDrawerOpen(true)}
                tone="neutral"
              />
            </div>
          ) : null}

          {showLeftNav ? (
            <div className="relative h-full shrink-0 overflow-hidden">
              <LeftNav
                className={cx(
                  "h-full",
                  (appConfig.hideTopNav || isExpanded) && "bg-[var(--one-leftnav-bg)]",
                )}
                sections={appConfig.sections}
                navVariant={appConfig.navVariant}
                collapsed={(isNoTopbar || isM2) && collapsed}
                showNewButton={appConfig.showNewButton}
                showSectionHeaders={appConfig.showSectionHeaders}
                onSelectedIdChange={onSelectedIdChange}
                selectedId={selectedNavId}
                useOneAccent={isDatabricksOneRoute}
                header={
                  appConfig.hideTopNav ? (
                    isStackedNav ? (
                      <div className="flex w-full flex-col items-center gap-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logos/Databricks.svg" alt="Databricks" className="block size-4 shrink-0" />
                      </div>
                    ) : (isNoTopbar || isM2) && isNarrowNav ? (
                      <div className="flex w-full flex-col items-center gap-sm">
                        <div className="size-8" />
                      </div>
                    ) : (isNoTopbar || isM2) && collapsed ? (
                      <div className="flex w-full flex-col items-center gap-sm">
                        <IconButton
                          aria-label="Open sidebar"
                          icon={<Icon name="sidebarClosedIcon" size={16} />}
                          onClick={() => setUserCollapsed(false)}
                          tone="neutral"
                        />
                      </div>
                    ) : (
                      <div className="flex w-full items-center gap-md pl-mid">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={isM2 ? "/logos/Nike.png" : "/logos/Databricks.svg"} alt={isM2 ? "Nike" : "Databricks"} className={isM2 ? "block h-6 w-auto shrink-0 object-contain dark:invert" : "block size-4 shrink-0"} />
                        <div className="flex-1" />
                        <IconButton
                          aria-label="Close sidebar"
                          icon={<Icon name="sidebarOpenIcon" size={16} />}
                          onClick={() => setUserCollapsed(true)}
                          tone="neutral"
                        />
                      </div>
                    )
                  ) : undefined
                }
                footer={
                  appConfig.hideTopNav ? (
                    <div className={cx("flex flex-col gap-sm", (isStackedNav || ((isNoTopbar || isM2) && collapsed)) ? "items-center" : "pl-sm")}>
                      <DropdownMenu
                        side="right"
                        align="start"
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
                        side="right"
                        align="start"
                        width={220}
                        items={getAvatarMenuItems(theme, toggleTheme)}
                        trigger={({ triggerRef, triggerProps }) => (
                          <span ref={triggerRef} className="inline-flex">
                            <Avatar {...triggerProps} aria-label="Account menu" initial="D" />
                          </span>
                        )}
                      />
                    </div>
                  ) : undefined
                }
              />
            </div>
          ) : null}


          {appConfig.contentStyle === "full-bleed" ? (
            isExpanded ? (
              <div className="relative min-w-0 flex-1">
                <div className="app-scroll h-full overflow-y-auto overflow-x-hidden">{children}</div>
              </div>
            ) : (
              <div className="relative min-w-0 flex-1">
                <div className="app-scroll h-full overflow-y-auto overflow-x-hidden">{children}</div>
              </div>
            )
          ) : (
            <div className="min-w-0 flex-1 p-sm">
              <div className="h-full overflow-hidden rounded-md shadow-[var(--elevation-shadow-md)]">
                <div className={cx("h-full bg-background-primary", pathname === "/chat" ? "overflow-hidden" : "app-scroll overflow-y-auto")}>
                  {children}
                </div>
              </div>
            </div>
          )}

          {genieCodeOpen && !isEditorRoute && (
            <div className="h-full shrink-0 py-sm pr-sm">
              <GenieCodeSidePanel
                onClose={() => setGenieCodeOpen(false)}
                width={panelWidth}
                onResizeStart={handlePanelResizeStart}
              />
            </div>
          )}
        </div>
      </div>
    </GenieCodeContext.Provider>
  );
}

export function AppChrome(props: AppChromeProps) {
  const pathname = usePathname();
  const appConfig = resolveAppConfig(pathname);
  return (
    <ResponsiveProvider>
      <AppChromeInner key={appConfig.id} {...props} />
    </ResponsiveProvider>
  );
}
