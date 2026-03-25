import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

export default function OneAppsPage() {
  const apps = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "apps");
  const model = apps ? apps.model : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Apps" />;
}
