import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

export default function OneGenieSpacesPage() {
  const genieSpaces = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "genie-spaces");
  const model = genieSpaces ? genieSpaces.model : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Genie Spaces" />;
}
