"use client";

import * as React from "react";

import { CodeBlock } from "./CodeBlock";

const SAMPLE_SQL = `with selected_fairness_difference as (
  select
    explode({{ fairness_metric }}.difference) as (grp, difference),
    window,
    granularity,
    slice_key
  from ml.vish_mm_db.master_alex_inference_log_classification_v2_analysis_metrics
  where
    window.start >= \"{{ Time range.start }}\"
    AND window.end <= \"{{ Time range.end }}\"
    AND column_name = \":table\"
    AND log_type = \"INPUT\"
    AND slice_value = true
)
select
  grp as \`Protected group\`,
  difference,
  abs(difference) as distance
from selected_fairness_difference`;

const SAMPLE_SQL_5 = SAMPLE_SQL.split("\n").slice(0, 5).join("\n");

export function CodeBlockShowcase() {
  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Search result (card-like, 5 lines, no footer)</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL_5}
            showMenu={false}
            actionsPlacement="floating"
            language="sql"
            highlight
            highlightedTokens={["difference"]}
            maxVisibleLines={5}
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Default (menu on, wrap off)</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            label="Example"
            languageLabel="SQL"
            language="sql"
            highlight
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Card mode (menu off)</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            showMenu={false}
            wrap
            language="sql"
            highlight
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Line numbers off</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            showLineNumbers={false}
            language="sql"
            highlight
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Snippet highlighting</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            language="sql"
            highlight
            highlightedLines={[2, 3, 4]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">Token highlighting (word)</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            language="sql"
            highlight
            highlightedTokens={["difference"]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="text-paragraph text-text-secondary">No collapsing (show all)</div>
        <div className="max-w-[735px]">
          <CodeBlock
            code={SAMPLE_SQL}
            language="sql"
            highlight
            maxVisibleLines={null}
          />
        </div>
      </div>
    </div>
  );
}

