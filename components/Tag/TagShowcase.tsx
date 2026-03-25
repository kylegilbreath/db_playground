"use client";

import * as React from "react";

import { Icon } from "@/components/icons";
import { IMAGE_PLACEHOLDER_SRC } from "@/components/ImagePlaceholder";

import { Tag, type TagColor, type TagLeftElement } from "./Tag";

const COLORS: TagColor[] = [
  "Default",
  "Charcoal",
  "Lemon",
  "Lime",
  "Teal",
  "Turquoise",
  "Indigo",
  "Purple",
  "Pink",
  "Coral",
  "Brown",
];

function ExampleRow({
  title,
  leftElement,
  interactive,
  closable,
}: {
  title: string;
  leftElement?: TagLeftElement;
  interactive?: boolean;
  closable?: boolean;
}) {
  const [closedColors, setClosedColors] = React.useState<Set<TagColor>>(() => new Set());

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <span className="w-[160px] text-paragraph text-text-secondary">{title}</span>
      {COLORS.filter((c) => !closedColors.has(c)).map((c) => (
        <Tag
          key={c}
          color={c}
          leftElement={leftElement}
          interactive={interactive}
          closable={closable}
          onClick={
            interactive
              ? () => {
                  // no-op (demo only)
                }
              : undefined
          }
          onClose={
            closable
              ? () =>
                  setClosedColors((prev) => {
                    const next = new Set(prev);
                    next.add(c);
                    return next;
                  })
              : undefined
          }
        >
          Tag
        </Tag>
      ))}
    </div>
  );
}

export function TagShowcase() {
  return (
    <div className="flex flex-col gap-md">
      <ExampleRow title="None" />
      <ExampleRow title="None (interactive)" interactive />
      <ExampleRow title="None (closable)" closable />

      <ExampleRow
        title="Icon"
        leftElement={{ type: "Icon", icon: <Icon name="gridDashIcon" size={16} /> }}
      />
      <ExampleRow
        title="Icon (interactive)"
        interactive
        leftElement={{ type: "Icon", icon: <Icon name="gridDashIcon" size={16} /> }}
      />
      <ExampleRow
        title="Icon (closable)"
        closable
        leftElement={{ type: "Icon", icon: <Icon name="gridDashIcon" size={16} /> }}
      />

      <ExampleRow
        title="Image"
        leftElement={{ type: "Image", src: IMAGE_PLACEHOLDER_SRC, alt: "" }}
      />
      <ExampleRow
        title="Image (interactive)"
        interactive
        leftElement={{ type: "Image", src: IMAGE_PLACEHOLDER_SRC, alt: "" }}
      />
      <ExampleRow
        title="Image (closable)"
        closable
        leftElement={{ type: "Image", src: IMAGE_PLACEHOLDER_SRC, alt: "" }}
      />
    </div>
  );
}

