import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

export default function OneInsightsPage() {
  const insights = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "insights");
  const model = insights ? insights.model : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Insights" />;
}
