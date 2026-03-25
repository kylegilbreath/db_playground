"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SEARCH_LAYOUT_TEMPLATES, buildSearchDemoModel } from "./model";
import { SearchLayout } from "./SearchLayout";

const GOLDEN_DEMO_QUERY = "customer churn";

/**
 * TEMP: pseudo-navigation to preview multiple layout templates.
 *
 * Easy removal:
 * - Delete this file
 * - Update `app/search/page.tsx` to render a single `<SearchLayout model={...} />`
 */
export function TemplatePreview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParam = searchParams.get("q") ?? "";
  const qTrimmed = qParam.trim();
  const isSearchDemo = qTrimmed.length > 0;

  const query = GOLDEN_DEMO_QUERY;

  const visibleTemplates = React.useMemo(
    () => SEARCH_LAYOUT_TEMPLATES.filter((t) => !t.hiddenInPreview),
    [],
  );

  const templateParam = searchParams.get("template");
  const selected =
    (templateParam
      ? SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === templateParam)
      : null) ?? visibleTemplates[0]!;

  const tabGroupId = selected.tab?.groupId;
  const tabbedTemplates = React.useMemo(() => {
    if (!tabGroupId) return null;
    return SEARCH_LAYOUT_TEMPLATES.filter((t) => t.tab?.groupId === tabGroupId);
  }, [tabGroupId]);

  const menuTabs =
    tabbedTemplates?.map((t) => ({
      value: t.tab!.value,
      label: t.tab!.label,
      disabled: false,
    })) ?? undefined;

  const tabValue = selected.tab?.value;
  const onTabValueChange = tabbedTemplates
    ? (next: string) => {
        const nextTemplate = tabbedTemplates.find((t) => t.tab?.value === next);
        if (!nextTemplate) return;
        router.push(`/search?template=${encodeURIComponent(nextTemplate.id)}`);
      }
    : undefined;

  const pageTitle = selected.id === "legacy_dashboards" ? "Dashboards" : selected.label;

  return (
    <SearchLayout
      model={isSearchDemo ? buildSearchDemoModel(query) : selected.model}
      pageTitle={isSearchDemo ? undefined : pageTitle}
      menuTabs={isSearchDemo ? undefined : menuTabs}
      tabValue={isSearchDemo ? undefined : tabValue}
      onTabValueChange={isSearchDemo ? undefined : onTabValueChange}
      menuAnythingBoxProps={
        isSearchDemo
          ? {
              value: query,
              onSubmit: () => {
                router.push(`/search?q=${encodeURIComponent(GOLDEN_DEMO_QUERY)}`);
              },
              onClearSearch: () => {
                router.push("/search");
              },
            }
          : undefined
      }
    />
  );
}

