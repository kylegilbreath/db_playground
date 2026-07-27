/**
 * Prototype registry — the single source of truth for the playground switcher.
 *
 * Each entry is one exploration that lives at a real route. The switcher in the
 * top-left of the app chrome reads this list to (a) show the current prototype's
 * friendly name and (b) let you jump between explorations.
 *
 * To add a prototype: add one entry below. To rename or regroup: edit it here.
 * The `path` is the real route we navigate to, so the URL itself is the deep link.
 */

export type Prototype = {
  /** Stable key. */
  id: string;
  /** Friendly label shown in the trigger and the menu. */
  name: string;
  /** Group heading the prototype appears under in the menu. */
  group: string;
  /** Real route used to detect the active prototype (matched against the pathname). */
  path: string;
  /** Optional navigation target (may include a query string). Defaults to `path`. */
  href?: string;
  /** Optional secondary line shown in the rich menu. */
  description?: string;
};

export const PROTOTYPES: Prototype[] = [
  // Genie
  {
    id: "genie-inbox",
    name: "Genie Code Full Screen",
    group: "Genie",
    path: "/chat",
    href: "/chat?new=1",
    description: "Unified inbox, threads & automation runs",
  },
  {
    id: "geniecode-onboarding",
    name: "Genie Code Onboarding",
    group: "Genie",
    path: "/geniecode-onboarding",
    description: "Onboarding variant of Genie Code",
  },
];

/**
 * Resolve the current prototype from a pathname using longest-prefix matching,
 * so nested routes (e.g. `/databricks-one-m2/chat`) resolve to their parent.
 * The exact-root prototype (`/`) only matches the exact root path.
 */
export function resolvePrototype(pathname: string): Prototype | undefined {
  let best: Prototype | undefined;
  let bestLength = -1;
  for (const proto of PROTOTYPES) {
    const matches =
      proto.path === "/"
        ? pathname === "/"
        : pathname === proto.path || pathname.startsWith(`${proto.path}/`);
    if (matches && proto.path.length > bestLength) {
      best = proto;
      bestLength = proto.path.length;
    }
  }
  return best;
}

/** Prototypes grouped by their `group`, preserving registry order. */
export function getPrototypeGroups(): { group: string; items: Prototype[] }[] {
  const groups: { group: string; items: Prototype[] }[] = [];
  for (const proto of PROTOTYPES) {
    let bucket = groups.find((g) => g.group === proto.group);
    if (!bucket) {
      bucket = { group: proto.group, items: [] };
      groups.push(bucket);
    }
    bucket.items.push(proto);
  }
  return groups;
}
