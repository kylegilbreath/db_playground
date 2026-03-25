import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

export default function OneDashboardsPage() {
  const dashboards = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "dashboards");
  const model = dashboards ? dashboards.model : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Dashboards" />;
}
