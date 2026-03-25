export type AppNavItem = {
  id: string;
  label: string;
  iconName?: string;
  /** Icon to show when the item is selected (e.g. a filled variant). Falls back to iconName. */
  selectedIconName?: string;
  /** Override the icon color (Tailwind `text-*` class). Defaults to `text-text-primary`. */
  iconColorClass?: string;
  disabled?: boolean;
  /** Trailing action button (horizontal variant only). `true` uses the default overflow icon; a string specifies a custom icon. */
  trailingActionIcon?: string | true;
  /** When true, clicking this item replaces it with a search TextInput. */
  expandAsSearch?: boolean;
};

export type AppNavSection = {
  id: string;
  label?: string;
  items: AppNavItem[];
  defaultOpen?: boolean;
  /** When true, this section remains visible in the collapsed icon-only nav. */
  showWhenCollapsed?: boolean;
};

export type AppConfig = {
  id: string;
  navVariant: "horizontal" | "stacked";
  sections: AppNavSection[];
  showNewButton: boolean;
  showSectionHeaders: boolean;
  transparentTopNav: boolean;
  /** "card" wraps content in a rounded shadow card; "full-bleed" renders edge-to-edge. */
  contentStyle: "card" | "full-bleed";
  /** CSS class added to the root shell element (e.g. for theme overrides). */
  shellClassName?: string;
  /** When true, the top navigation bar is hidden entirely. */
  hideTopNav?: boolean;
};

const LAKEHOUSE_CONFIG: AppConfig = {
  id: "lakehouse",
  navVariant: "horizontal",
  showNewButton: true,
  showSectionHeaders: true,
  transparentTopNav: false,
  contentStyle: "card",
  sections: [
    {
      id: "top",
      items: [
        { id: "home", label: "Home", iconName: "homeIcon", selectedIconName: "HomeFilledIcon" },
        { id: "chat", label: "Genie Chat", iconName: "genieIcon" },
        { id: "editor", label: "Editor", iconName: "QueryEditorIcon" },
        { id: "discover", label: "Discover", iconName: "discoverIcon" },
        { id: "workspace", label: "Workspace", iconName: "workspacesIcon", disabled: true },
        { id: "catalog", label: "Catalog", iconName: "catalogIcon", disabled: true },
        { id: "workflows", label: "Workflows", iconName: "WorkflowsIcon", disabled: true },
        { id: "compute", label: "Compute", iconName: "cloudIcon", disabled: true },
      ],
    },
    {
      id: "quick-access",
      label: "Quick access",
      defaultOpen: true,
      items: [
        { id: "tables", label: "Tables", iconName: "tableIcon", trailingActionIcon: true },
        { id: "notebooks", label: "Notebooks", iconName: "notebookIcon", trailingActionIcon: true },
        { id: "dashboards", label: "Dashboards", iconName: "dashboardIcon", trailingActionIcon: true },
        { id: "genie", label: "Genie", iconName: "SparkleRectangleIcon", trailingActionIcon: true },
        { id: "models", label: "Models", iconName: "modelsIcon", trailingActionIcon: true },
      ],
    },
    {
      id: "sql",
      label: "SQL",
      defaultOpen: false,
      items: [
        { id: "sql-editor", label: "SQL Editor", iconName: "QueryEditorIcon", disabled: true },
        { id: "queries", label: "Queries", iconName: "queryListViewIcon", disabled: true },
        { id: "dashboards", label: "Dashboards", iconName: "dashboardIcon" },
        { id: "genie", label: "Genie", iconName: "SparkleRectangleIcon" },
        { id: "alerts", label: "Alerts", iconName: "notificationIcon", disabled: true },
        { id: "query-history", label: "Query History", iconName: "historyIcon", disabled: true },
        { id: "sql-warehouses", label: "SQL Warehouses", iconName: "databaseOutlinedIcon", disabled: true },
      ],
    },
    {
      id: "data-engineering",
      label: "Data Engineering",
      defaultOpen: false,
      items: [
        { id: "job-runs", label: "Job Runs", iconName: "WorkflowsIcon", disabled: true },
        { id: "data-ingestion", label: "Data Ingestion", iconName: "streamIcon", disabled: true },
        { id: "pipelines", label: "Pipelines", iconName: "PipelineIcon", disabled: true },
      ],
    },
    {
      id: "machine-learning",
      label: "AI/ML",
      defaultOpen: false,
      items: [
        { id: "playground", label: "Playground", iconName: "RobotIcon", disabled: true },
        { id: "experiments", label: "Experiments", iconName: "beakerIcon", disabled: true },
        { id: "features", label: "Features", iconName: "layerIcon", disabled: true },
        { id: "models", label: "Models", iconName: "modelsIcon" },
        { id: "agents", label: "Agents", iconName: "UserSparkleIcon" },
        { id: "ai-gateway", label: "AI Gateway", iconName: "SparkleIcon" },
        { id: "serving", label: "Serving", iconName: "CloudModelIcon", disabled: true },
      ],
    },
  ],
};

const DATABRICKS_ONE_CONFIG: AppConfig = {
  id: "databricks-one",
  navVariant: "stacked",
  showNewButton: false,
  showSectionHeaders: false,
  transparentTopNav: true,
  contentStyle: "full-bleed",
  shellClassName: "databricks-one",
  hideTopNav: true,
  sections: [
    {
      id: "main",
      items: [
        { id: "home", label: "Home", iconName: "homeIcon", selectedIconName: "HomeFilledIcon" },
        { id: "dashboards", label: "Dashboards", iconName: "dashboardIcon" },
        { id: "genie-spaces", label: "Genie Spaces", iconName: "SparkleRectangleIcon" },
        { id: "apps", label: "Apps", iconName: "AppsAssetIcon" },
        { id: "insights", label: "Insights", iconName: "LightbulbIcon", selectedIconName: "LightbulbFilledIcon" },
        { id: "domains", label: "Domains", iconName: "DomainsIcon" },
      ],
    },
  ],
};

const CHATGPT_NAV_ITEMS: AppNavItem[] = [
  { id: "home", label: "Home", iconName: "homeIcon", selectedIconName: "HomeFilledIcon" },
  { id: "dashboards", label: "Dashboards", iconName: "dashboardIcon" },
  { id: "genie-spaces", label: "Genie Spaces", iconName: "SparkleRectangleIcon" },
  { id: "apps", label: "Apps", iconName: "AppsAssetIcon" },
  { id: "insights", label: "Insights", iconName: "LightbulbIcon" },
  { id: "domains", label: "Domains", iconName: "DomainsIcon" },
];

const CHATGPT_SECTIONS: AppNavSection[] = [
  {
    id: "nav",
    showWhenCollapsed: true,
    items: CHATGPT_NAV_ITEMS,
  },
  {
    id: "actions",
    showWhenCollapsed: true,
    items: [
      { id: "new-chat", label: "New chat", iconName: "pencilIcon" },
      { id: "search-chats", label: "Search chats", iconName: "searchIcon", expandAsSearch: true },
    ],
  },
  {
    id: "chats",
    label: "Chats",
    defaultOpen: true,
    items: [
      { id: "chat-1", label: "Sev0 Bug report", trailingActionIcon: true },
      { id: "chat-2", label: "Revenue drop analysis", trailingActionIcon: true },
      { id: "chat-3", label: "Customer churn drivers", trailingActionIcon: true },
      { id: "chat-4", label: "Inventory discrepancy check", trailingActionIcon: true },
      { id: "chat-5", label: "Campaign performance comparison", trailingActionIcon: true },
      { id: "chat-6", label: "Dashboard performance issue", trailingActionIcon: true },
      { id: "chat-7", label: "Churn model insights", trailingActionIcon: true },
      { id: "chat-8", label: "Transaction anomaly review", trailingActionIcon: true },
      { id: "chat-9", label: "Quarterly forecast refresh", trailingActionIcon: true },
      { id: "chat-10", label: "Warehouse cost spike", trailingActionIcon: true },
      { id: "chat-11", label: "ETL pipeline failure root cause", trailingActionIcon: true },
      { id: "chat-12", label: "User retention by cohort", trailingActionIcon: true },
      { id: "chat-13", label: "Shipping delay trends", trailingActionIcon: true },
      { id: "chat-14", label: "Ad spend ROI breakdown", trailingActionIcon: true },
      { id: "chat-15", label: "New market sizing model", trailingActionIcon: true },
    ],
  },
];

const DATABRICKS_ONE_EXPANDED_CONFIG: AppConfig = {
  id: "databricks-one-expanded",
  navVariant: "horizontal",
  showNewButton: false,
  showSectionHeaders: true,
  transparentTopNav: true,
  contentStyle: "full-bleed",
  shellClassName: "databricks-one",
  sections: CHATGPT_SECTIONS,
};

const DATABRICKS_ONE_NO_TOPBAR_CONFIG: AppConfig = {
  ...DATABRICKS_ONE_EXPANDED_CONFIG,
  id: "databricks-one-no-topbar",
  hideTopNav: true,
};

const DATABRICKS_ONE_M2_CONFIG: AppConfig = {
  ...DATABRICKS_ONE_NO_TOPBAR_CONFIG,
  id: "databricks-one-m2",
};

const APP_CONFIGS: AppConfig[] = [LAKEHOUSE_CONFIG, DATABRICKS_ONE_CONFIG, DATABRICKS_ONE_EXPANDED_CONFIG, DATABRICKS_ONE_NO_TOPBAR_CONFIG, DATABRICKS_ONE_M2_CONFIG];

export function resolveAppConfig(pathname: string): AppConfig {
  if (pathname.startsWith("/databricks-one-m2")) {
    return DATABRICKS_ONE_M2_CONFIG;
  }
  if (pathname.startsWith("/databricks-one-chat-nav-no-top-bar")) {
    return DATABRICKS_ONE_NO_TOPBAR_CONFIG;
  }
  if (pathname.startsWith("/databricks-one-chat-nav-with-top-bar")) {
    return DATABRICKS_ONE_EXPANDED_CONFIG;
  }
  if (pathname.startsWith("/one") || pathname.startsWith("/databricks-one")) {
    return DATABRICKS_ONE_CONFIG;
  }
  return LAKEHOUSE_CONFIG;
}

export { APP_CONFIGS, DATABRICKS_ONE_CONFIG, DATABRICKS_ONE_EXPANDED_CONFIG, DATABRICKS_ONE_NO_TOPBAR_CONFIG, DATABRICKS_ONE_M2_CONFIG, LAKEHOUSE_CONFIG };
