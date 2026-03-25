import * as React from "react";

import { Icon, type IconProps } from "@/components/icons";

/**
 * AssetType
 *
 * Constrained set of asset types used across non-chat surfaces.
 * Use `AssetTypes.*` to avoid ad-hoc strings.
 */
export const AssetTypes = {
  Tables: "tables",
  Notebooks: "notebooks",
  Jobs: "jobs",
  Pipelines: "pipelines",
  Queries: "queries",
  Dashboards: "dashboards",
  GenieSpaces: "genie_spaces",
  MetricViews: "metric_views",
  Folders: "folders",
  GitFolders: "git_folders",
  Endpoints: "endpoints",
  Files: "files",
  Libraries: "libraries",
  Alerts: "alerts",
  LegacyAlerts: "legacy_alerts",
  Models: "models",
  Functions: "functions",
  Partners: "partners",
  Marketplace: "marketplace",
  Volumes: "volumes",
  Apps: "apps",
} as const;

export type AssetType = (typeof AssetTypes)[keyof typeof AssetTypes];

/**
 * AssetTypeIconName
 *
 * These strings correspond to SVG filenames in `public/icons/` (without `.svg`).
 */
export type AssetTypeIconName = string;

export const ASSET_TYPE_ICON_NAME: Record<AssetType, AssetTypeIconName> = {
  [AssetTypes.Tables]: "tableIcon",
  [AssetTypes.Notebooks]: "notebookIcon",
  [AssetTypes.Jobs]: "WorkflowsIcon",
  [AssetTypes.Pipelines]: "PipelineIcon",
  [AssetTypes.Queries]: "queryListViewIcon",
  [AssetTypes.Dashboards]: "dashboardIcon",
  [AssetTypes.GenieSpaces]: "SparkleRectangleIcon",
  [AssetTypes.MetricViews]: "TableMeasureIcon",
  [AssetTypes.Folders]: "folderOutlinedIcon",
  [AssetTypes.GitFolders]: "FolderBranchIcon",
  [AssetTypes.Endpoints]: "CloudModelIcon",
  [AssetTypes.Files]: "fileIcon",
  [AssetTypes.Libraries]: "LibrariesIcon",
  [AssetTypes.Alerts]: "notificationIcon",
  [AssetTypes.LegacyAlerts]: "notificationIcon",
  [AssetTypes.Models]: "modelsIcon",
  [AssetTypes.Functions]: "FunctionIcon",
  [AssetTypes.Partners]: "ConnectIcon",
  [AssetTypes.Marketplace]: "dataMarketplaceIcon",
  [AssetTypes.Volumes]: "FolderCloudIcon",
  [AssetTypes.Apps]: "AppsAssetIcon",
};

export function getAssetTypeIconName(assetType: AssetType): AssetTypeIconName {
  return ASSET_TYPE_ICON_NAME[assetType];
}

/**
 * getAssetTypeIcon
 *
 * Thin helper for rendering the right `Icon` for a given asset type.
 */
export function getAssetTypeIcon(
  assetType: AssetType,
  props?: Omit<IconProps, "name">,
): React.ReactElement {
  return <Icon name={getAssetTypeIconName(assetType)} {...props} />;
}

