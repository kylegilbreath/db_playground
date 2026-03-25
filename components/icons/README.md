# Icons

This project supports two icon sources:

- **Local SVG files** stored in `public/icons/` (Finder-friendly)
- **Phosphor Icons** via `@phosphor-icons/react` ([docs](https://github.com/phosphor-icons/homepage#phosphor-icons))

## Add an icon (Finder workflow)

1. Drop your SVG into `public/icons/`
2. Name it using kebab-case, e.g. `close.svg`, `chevron-down.svg`

## Use an icon

### Local SVG

```tsx
import { Icon } from "@/components/icons";

export function Example() {
  return <Icon name="close" className="text-action-default-icon-default" />;
}
```

### Phosphor

```tsx
import { X } from "@phosphor-icons/react";
import { PhIcon } from "@/components/icons";

export function Example() {
  return <PhIcon icon={X} className="text-action-default-icon-default" />;
}
```

## Notes

- `Icon` renders the SVG as a **CSS mask**, so it inherits `currentColor` and is ideal for **single-color UI icons**.
- For multi-color artwork/illustrations, prefer an `<img src="/icons/..." />` or inline SVG.

