import { SearchLayout } from "../../search/SearchLayout";
import { SEARCH_LAYOUT_TEMPLATES } from "../../search/model";

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function recordId(v: unknown): string | undefined {
  if (!isRecord(v)) return undefined;
  const id = v.id;
  return typeof id === "string" ? id : undefined;
}

function rewriteSearchDiscoverHrefs<T>(value: T): T {
  const from = "/search?template=discover";
  const to = "/one/discover";

  if (typeof value === "string") {
    return value.includes(from) ? (value.replaceAll(from, to) as T) : value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => rewriteSearchDiscoverHrefs(v)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = rewriteSearchDiscoverHrefs(v);
    }
    return out as T;
  }
  return value;
}

function filterToOneDiscoverModel<T>(value: T): T {
  if (!isRecord(value)) return value;

  const sections = value.sections;
  if (!Array.isArray(sections)) return value;

  const keepSectionIds = new Set([
    "domains",
    "certified",
    "types",
    "genie_spaces",
    "dashboards",
    "apps",
  ]);
  const keepTypeItemIds = new Set(["type_dashboards", "type_apps", "type_genie"]);

  const nextSections = sections
    .filter((s) => {
      const id = recordId(s);
      return Boolean(id) && keepSectionIds.has(id!);
    })
    .map((s) => {
      if (!isRecord(s)) return s;
      const id = s.id;
      const content = isRecord(s.content) ? s.content : null;

      if (id === "types" && content?.kind === "cardsGrid" && Array.isArray(content.items)) {
        return {
          ...s,
          content: {
            ...content,
            items: content.items.filter((it) => {
              const itId = recordId(it);
              return Boolean(itId) && keepTypeItemIds.has(itId!);
            }),
          },
        };
      }

      if (id === "certified" && content?.kind === "cardsGrid" && Array.isArray(content.items)) {
        const filtered = content.items.filter((it) => {
          if (!isRecord(it)) return false;
          const title = isRecord(it.title) ? it.title : null;
          const icon = title && isRecord(title.icon) ? title.icon : null;
          const iconKind = icon?.kind;
          // Keep Dashboards and GenieSpaces (Apps are `kind:"icon"` and will be re-added below).
          return (
            iconKind === "assetType" &&
            (icon?.value === "Dashboards" || icon?.value === "GenieSpaces")
          );
        });

        const appsCard = [
          {
            kind: "thumbnail",
            id: "cert_app_1",
            title: {
              label: "Customer success hub",
              icon: { kind: "icon", name: "AppsAssetIcon" },
            },
            thumbnail: { kind: "placeholder" },
          },
        ];

        return {
          ...s,
          content: {
            ...content,
            items: [...filtered, ...appsCard],
          },
        };
      }

      return s;
    });

  return { ...value, sections: nextSections } as T;
}

export default function OneDiscoverPage() {
  const discover = SEARCH_LAYOUT_TEMPLATES.find((t) => t.id === "discover");
  const model = discover
    ? filterToOneDiscoverModel(rewriteSearchDiscoverHrefs(discover.model))
    : SEARCH_LAYOUT_TEMPLATES[0]!.model;

  return <SearchLayout model={model} pageTitle="Discover" />;
}

