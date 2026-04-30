"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { DefaultButton } from "@/components/DefaultButton";
import { DropdownMenu } from "@/components/DropdownMenu";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/** Row switch — primary blue when on (matches chat / connections UX). */
export function McpToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-full transition-colors",
        checked
          ? "bg-action-primary-background-default hover:bg-action-primary-background-hover"
          : "bg-background-tertiary",
      )}
    >
      <span
        className={cx(
          "absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[16px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

export type McpTool = { id: string; name: string; description: string; enabled: boolean };
export type McpServer = { id: string; name: string; tools: McpTool[]; iconBg: string; icon: string };

export const MCP_SERVERS: McpServer[] = [
  {
    id: "uc-fn",
    name: "UC Function: chloe-chan.mcp-function-with-long-name",
    iconBg: "bg-[#f0f9f6]",
    icon: "AppsIcon",
    tools: [
      { id: "execute_sql", name: "execute_sql", description: "Run a SQL query against a catalog", enabled: true },
      { id: "list_tables", name: "list_tables", description: "List tables in a schema", enabled: true },
      { id: "describe_table", name: "describe_table", description: "Get schema details for a table", enabled: true },
      { id: "get_row_count", name: "get_row_count", description: "Return approximate row count", enabled: false },
      { id: "sample_rows", name: "sample_rows", description: "Return a sample of rows from a table", enabled: true },
    ],
  },
  {
    id: "gdrive",
    name: "Google Drive search",
    iconBg: "bg-[#f1f3f4]",
    icon: "driveIcon",
    tools: [
      { id: "search_files", name: "search_files", description: "Search for files across Google Drive", enabled: true },
      { id: "read_file", name: "read_file", description: "Read the contents of a Drive file", enabled: true },
      { id: "list_folder", name: "list_folder", description: "List files in a Drive folder", enabled: true },
      { id: "create_doc", name: "create_doc", description: "Create a new Google Doc", enabled: false },
      { id: "share_file", name: "share_file", description: "Share a file with specified users", enabled: false },
    ],
  },
];

function McpServerOverflowMenu({
  server,
  enabledToolCount,
  onConfigureTools,
}: {
  server: McpServer;
  enabledToolCount: number;
  onConfigureTools: () => void;
}) {
  const items = [
    {
      id: "configure-tools",
      label: (
        <span className="flex w-full min-w-0 items-center justify-between gap-mid">
          <span className="truncate font-medium">Configure tools</span>
          <span className="shrink-0 font-normal text-hint text-text-secondary">
            {enabledToolCount}/{server.tools.length} enabled
          </span>
        </span>
      ),
      leadingIcon: <Icon name="WrenchIcon" size={16} className="text-text-secondary" />,
      onSelect: onConfigureTools,
    },
    {
      id: "refresh-tools",
      label: "Refresh tools",
      leadingIcon: <Icon name="refreshIcon" size={16} className="text-text-secondary" />,
      onSelect: () => {
        /* prototype */
      },
    },
    {
      id: "remove-server",
      label: "Remove server",
      leadingIcon: <Icon name="trashIcon" size={16} />,
      separatorAbove: true,
      danger: true,
      onSelect: () => {
        /* prototype */
      },
    },
  ];

  return (
    <DropdownMenu
      width={260}
      align="end"
      side="bottom"
      sideOffset={4}
      items={items}
      trigger={({ triggerRef, triggerProps }) => (
        <span ref={triggerRef} className="inline-flex">
          <IconButton
            {...triggerProps}
            aria-label="More"
            icon={<Icon name="overflowIcon" size={14} />}
            size="small"
            tone="neutral"
          />
        </span>
      )}
    />
  );
}

export function ConnectionsMainView({
  selectedServerId,
  onServerClick,
  onConfigureMcpTools,
  layout = "page",
}: {
  selectedServerId: string | null;
  onServerClick: (id: string) => void;
  onConfigureMcpTools: (id: string) => void;
  /** `drawer`: no outer padding (parent already insets). `page`: full customizations padding. */
  layout?: "page" | "drawer";
}) {
  const [serverEnabled, setServerEnabled] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(MCP_SERVERS.map((s) => [s.id, true])),
  );

  const AVAILABLE_CONNECTORS = [
    {
      id: "sharepoint",
      name: "SharePoint",
      description: "Access and search files across SharePoint sites and libraries",
      icon: "SharePointIcon",
    },
    {
      id: "github",
      name: "GitHub",
      description: "Read and write code, issues, and pull requests",
      icon: "githubIcon",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Search messages, channels, and send updates",
      icon: "slackIcon",
    },
    {
      id: "jira",
      name: "Jira",
      description: "Manage issues, projects, and team workflows",
      icon: "JiraIcon",
    },
    {
      id: "gdrive",
      name: "Google Drive",
      description: "Access and search files across Drive and Docs",
      icon: "driveIcon",
    },
    {
      id: "glean",
      name: "Glean",
      description: "Search and surface knowledge across your company's tools",
      icon: "gleanIcon",
    },
    {
      id: "linear",
      name: "Linear",
      description: "Manage issues, projects, and team workflows in Linear",
      icon: "linearIcon",
    },
    {
      id: "confluence",
      name: "Confluence",
      description: "Search and read documentation from Confluence spaces",
      icon: "ConfluenceIcon",
    },
  ] as const;

  return (
    <div
      className={cx(
        "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto",
        layout === "drawer" ? "p-0" : "px-8 py-6",
      )}
    >
      <div
        className={cx(
          "gap-sm",
          layout === "drawer"
            ? "flex flex-row items-center justify-between"
            : "flex flex-col sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <span
          className={cx(
            "text-title3 font-semibold text-text-primary",
            layout === "drawer" ? "min-w-0 flex-1" : "sm:min-w-0 sm:flex-1",
          )}
        >
          MCP servers
        </span>
        <DefaultButton size="small" leadingIcon={<Icon name="plusIcon" size={12} />} className="w-fit shrink-0">
          Add
        </DefaultButton>
      </div>
      <div className="flex flex-col gap-3">
        {MCP_SERVERS.map((server) => {
          const enabledCount = server.tools.filter((t) => t.enabled).length;
          const isSelected = selectedServerId === server.id;
          const isServerOn = serverEnabled[server.id] ?? true;
          return (
            <div
              key={server.id}
              role="button"
              tabIndex={0}
              onClick={() => onServerClick(server.id)}
              onKeyDown={(e) => e.key === "Enter" && onServerClick(server.id)}
              className={cx(
                "flex w-full cursor-pointer items-center gap-sm rounded-md border px-3 py-3 transition-colors",
                isSelected
                  ? "border-action-default-border-focus ring-1 ring-action-default-border-focus"
                  : "border-border hover:border-action-default-border-hover",
              )}
            >
              <div
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded",
                  isServerOn ? server.iconBg : "bg-background-secondary",
                )}
              >
                <Icon name={server.icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-paragraph font-medium text-text-primary">{server.name}</p>
                <p className="text-hint text-action-default-text">{enabledCount} tools enabled</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <McpToggle
                  checked={serverEnabled[server.id] ?? true}
                  onChange={(v) => setServerEnabled((prev) => ({ ...prev, [server.id]: v }))}
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <McpServerOverflowMenu
                  server={server}
                  enabledToolCount={enabledCount}
                  onConfigureTools={() => onConfigureMcpTools(server.id)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px w-full bg-border" />

      <div className="flex flex-col gap-3">
        <p className="text-title4 font-semibold text-text-primary">Additional connectors</p>
        <div className={layout === "drawer" ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 xl:grid-cols-2"}>
          {AVAILABLE_CONNECTORS.map((connector) => (
            <div
              key={connector.id}
              className="flex items-start gap-sm rounded-md border border-border bg-background-primary p-3 transition-colors hover:border-action-default-border-hover"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-background-secondary">
                <Icon name={connector.icon as Parameters<typeof Icon>[0]["name"]} size={14} className="text-text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-paragraph font-medium text-text-primary">{connector.name}</p>
                <p className="mt-0.5 text-hint text-text-secondary">{connector.description}</p>
              </div>
              <button
                type="button"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-background-secondary hover:text-text-primary"
              >
                <Icon name="plusIcon" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function McpToolsConfigDialog({ server, onClose }: { server: McpServer; onClose: () => void }) {
  const [mcpSearch, setMcpSearch] = React.useState("");
  const [mcpToolEnabled, setMcpToolEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(server.tools.map((t) => [t.id, t.enabled])),
  );

  React.useEffect(() => {
    setMcpSearch("");
    setMcpToolEnabled(Object.fromEntries(server.tools.map((t) => [t.id, t.enabled])));
  }, [server.id]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleRefreshToolsList = () => {
    setMcpSearch("");
    setMcpToolEnabled(Object.fromEntries(server.tools.map((t) => [t.id, t.enabled])));
  };

  const filteredTools = server.tools.filter(
    (t) =>
      !mcpSearch ||
      t.name.toLowerCase().includes(mcpSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(mcpSearch.toLowerCase()),
  );

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(640px,85vh)] w-full max-w-[520px] flex-col overflow-hidden rounded-md border border-border bg-background-primary shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mcp-tools-dialog-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-sm border-b border-border px-lg py-md">
          <h2 id="mcp-tools-dialog-title" className="min-w-0 flex-1 pr-sm text-title3 font-semibold text-text-primary">
            {server.name}
          </h2>
          <IconButton aria-label="Close" icon={<Icon name="closeIcon" size={16} />} size="small" tone="neutral" onClick={onClose} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-sm overflow-hidden px-lg py-md">
          <p className="text-title4 font-semibold text-text-primary">Available tools</p>
          <div className="flex shrink-0 items-center gap-xs rounded-sm border border-border px-2 py-1.5">
            <Icon name="searchIcon" size={14} className="shrink-0 text-text-secondary" />
            <input
              type="search"
              placeholder="Search tools"
              value={mcpSearch}
              onChange={(e) => setMcpSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-paragraph text-text-primary placeholder:text-text-placeholder outline-none"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-sm border border-border">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-start gap-sm border-b border-border px-3 py-3 last:border-b-0"
              >
                <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <McpToggle
                    checked={mcpToolEnabled[tool.id] ?? tool.enabled}
                    onChange={(v) => setMcpToolEnabled((prev) => ({ ...prev, [tool.id]: v }))}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-paragraph font-medium text-text-primary" style={{ fontFamily: "monospace" }}>
                    {tool.name}
                  </p>
                  {tool.description ? (
                    <p className="mt-0.5 text-hint text-text-secondary">{tool.description}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-sm border-t border-border px-lg py-md">
          <DefaultButton size="small" leadingIcon={<Icon name="refreshIcon" size={14} />} onClick={handleRefreshToolsList}>
            Refresh tools list
          </DefaultButton>
          <PrimaryButton size="small" onClick={onClose}>
            Close
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
