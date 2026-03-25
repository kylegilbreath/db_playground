"use client";

import * as React from "react";

import { Icon } from "@/components/icons";

import { NameLabel, type NameLabelDecorator } from "./NameLabel";

function Row({
  title,
  decorators,
}: {
  title: string;
  decorators?: NameLabelDecorator[];
}) {
  return (
    <div className="flex items-center gap-md">
      <div className="w-[180px] text-paragraph text-text-secondary">{title}</div>
      <div className="w-full max-w-[520px] rounded-md border border-border bg-background-primary p-sm">
        <NameLabel
          leadingIcon={<Icon name="tableIcon" size={16} />}
          label="asset.name.with.a.very.long.label.that.should.truncate"
          decorators={decorators}
        />
      </div>
    </div>
  );
}

export function NameLabelShowcase() {
  return (
    <div className="flex flex-col gap-sm">
      <Row title="No decorators" />
      <Row title="Certified" decorators={[{ kind: "certified" }]} />
      <Row title="Favorited" decorators={[{ kind: "favorited" }]} />
      <Row title="Trending" decorators={[{ kind: "trending" }]} />
      <Row title="Shared" decorators={[{ kind: "shared" }]} />
      <Row title="Pinned" decorators={[{ kind: "pinned" }]} />

      <Row
        title="Trending + Favorited"
        decorators={[{ kind: "trending" }, { kind: "favorited" }]}
      />
      <Row title="Pinned + Shared" decorators={[{ kind: "pinned" }, { kind: "shared" }]} />
      <Row
        title="All signals"
        decorators={[
          { kind: "certified" },
          { kind: "trending" },
          { kind: "favorited" },
          { kind: "shared" },
          { kind: "pinned" },
        ]}
      />
      <Row
        title="Tooltip overrides"
        decorators={[
          { kind: "certified", tooltip: "Verified by admins" },
          { kind: "trending", tooltip: "Trending this week" },
          { kind: "favorited", tooltip: "Saved to favorites" },
        ]}
      />
      <Row
        title="Custom"
        decorators={[
          {
            kind: "custom",
            icon: <Icon name="warningFilledIcon" size={16} />,
            tooltip: "Custom signal",
          },
        ]}
      />
      <Row
        title="Custom (x2)"
        decorators={[
          { kind: "custom", icon: <Icon name="warningFilledIcon" size={16} />, tooltip: "Warning" },
          { kind: "custom", icon: <Icon name="infoFilledIcon" size={16} />, tooltip: "Info" },
        ]}
      />
    </div>
  );
}

