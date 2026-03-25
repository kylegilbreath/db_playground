"use client";

import * as React from "react";

import { CardThumbnail } from "./CardThumbnail";
import type { TagColor } from "@/components/Tag";

const TAG_COLOR_EXAMPLES: TagColor[] = ["Indigo", "Teal", "Turquoise", "Purple", "Pink", "Coral"];

function ColorGrid({
  title,
  render,
}: {
  title: string;
  render: (color: TagColor) => React.ReactNode;
}) {
  return (
    <div className="col-span-2 flex flex-col gap-xs">
      <div className="text-paragraph text-text-secondary">{title}</div>
      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
        {TAG_COLOR_EXAMPLES.map((c) => (
          <div key={c} className="flex flex-col gap-xs">
            {render(c)}
            <div className="text-hint text-text-secondary">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardThumbnailShowcase() {
  return (
    <div className="grid grid-cols-2 gap-sm">
      <div className="flex flex-col gap-xs">
        <div className="text-paragraph text-text-secondary">Placeholder</div>
        <CardThumbnail variant="placeholder" />
      </div>

      <ColorGrid
        title="Placeholder (Tag colors)"
        render={(c) => <CardThumbnail variant="placeholder" tagColor={c} />}
      />

      <div className="flex flex-col gap-xs">
        <div className="text-paragraph text-text-secondary">Text snippet</div>
        <CardThumbnail
          variant="textSnippet"
          text="Which campaigns are driving the most high-quality, qualified leads?"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <div className="text-paragraph text-text-secondary">Image thumbnail</div>
        <CardThumbnail variant="image" dashboardIndex={7} alt="Dashboard preview" />
      </div>

      <div className="flex flex-col gap-xs">
        <div className="text-paragraph text-text-secondary">Text snippet (Tag color)</div>
        <CardThumbnail
          variant="textSnippet"
          tagColor="Indigo"
          text="Which campaigns are driving the most high-quality, qualified leads?"
        />
      </div>

      <ColorGrid
        title="Text snippet (Tag colors)"
        render={(c) => (
          <CardThumbnail
            variant="textSnippet"
            tagColor={c}
            text="Which campaigns are driving the most high-quality, qualified leads?"
          />
        )}
      />

      <div className="col-span-2 flex flex-col gap-xs">
        <div className="text-paragraph text-text-secondary">Code snippet</div>
        <CardThumbnail
          variant="code"
          language="sql"
          highlightedTokens={["difference", "select"]}
          code={[
            "with selected_fairness_difference as (",
            "  select",
            "    explode({{ fairness_metric }}.difference) as (grp, difference),",
            "    window,",
            "    granularity",
            "  from my_table",
            ")",
          ].join("\n")}
        />
      </div>
    </div>
  );
}

