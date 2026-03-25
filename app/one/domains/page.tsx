import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

export default function OneDomainsPage() {
  const domains = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "domains");
  const model = domains ? domains.model : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Domains" />;
}
