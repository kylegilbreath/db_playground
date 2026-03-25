"use client";

import { LeftNav } from "@/components/PlatformChrome/LeftNav";
import { DATABRICKS_ONE_EXPANDED_CONFIG } from "@/components/PlatformChrome/appConfig";

export default function ExpandedNavPreview() {
  const config = DATABRICKS_ONE_EXPANDED_CONFIG;

  return (
    <div className="flex min-h-dvh items-start gap-lg p-lg">
      <LeftNav
        className="h-[600px] border-r border-border"
        sections={config.sections}
        navVariant={config.navVariant}
        showNewButton={config.showNewButton}
        showSectionHeaders={config.showSectionHeaders}
        defaultSelectedId="apps"
      />
      <div className="flex-1 p-md">
        <h1 className="text-title2 font-semibold text-text-primary">
          Expanded Nav Preview
        </h1>
        <p className="mt-sm text-paragraph text-text-secondary">
          This is the expanded Databricks One left nav rendered in isolation.
        </p>
      </div>
    </div>
  );
}
