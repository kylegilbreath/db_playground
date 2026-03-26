"use client";

import * as React from "react";
import { AgentChat } from "./AgentChat";
import { AssetChip } from "./primitives/AssetChip";
import { CollapsibleSection } from "./primitives/CollapsibleSection";
import type { ChatStep } from "./types";
import { SKI_RESORT_STEPS, SKI_RESORT_DELAYS } from "./data/skiResortRun";

const STATIC_STEPS: ChatStep[] = [
  { type: "user", id: "u1", text: "Perform EDA on the ski resort properties" },
  {
    type: "thinking",
    id: "t1",
    text: "I'll inspect the table schema first, then sample the data to find relevant columns.",
  },
  {
    type: "action-group",
    id: "ag1",
    defaultOpen: true,
    actions: [
      { id: "a1", verb: "Created", asset: { id: "nb1", name: "Ski Resort EDA", kind: "notebook" }, status: "done" },
      { id: "a2", verb: "Ran", asset: { id: "nb1", name: "Ski Resort EDA", kind: "notebook" }, status: "done" },
    ],
  },
  {
    type: "tool-confirmation",
    id: "tc1",
    verb: "Edited",
    asset: { id: "f1", name: "ski_resort_eda.py", kind: "file" },
    permissionLabel: "Ask every time",
  },
  {
    type: "assistant-text",
    id: "at1",
    text: "Lake Tahoe leads with 90 properties (avg $259). Average booking: 1.7 guests, ~$540 revenue.",
  },
  {
    type: "suggestion-chips",
    id: "sc1",
    suggestions: ["Forecast revenue for 6 months", "Show cancellation rate by resort"],
  },
  { type: "feedback", id: "fb1" },
];

function StreamingDemo() {
  const [steps, setSteps] = React.useState<ChatStep[]>([]);
  const [running, setRunning] = React.useState(false);
  const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const start = () => {
    if (running) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSteps([{ type: "user", id: "user-msg", text: "Perform EDA on the ski resort properties with a 6 month forecast" }]);
    setRunning(true);
    SKI_RESORT_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (i === SKI_RESORT_STEPS.length - 1) setRunning(false);
      }, SKI_RESORT_DELAYS[i]);
      timersRef.current.push(t);
    });
  };

  const reset = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSteps([]);
    setRunning(false);
  };

  React.useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <div className="flex flex-col gap-md">
      <div className="flex gap-sm">
        <button
          type="button"
          onClick={start}
          disabled={running}
          className="rounded-sm border border-border px-3 py-1.5 text-paragraph text-text-primary hover:bg-background-secondary disabled:opacity-50"
        >
          {running ? "Running…" : "Play agent run"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-sm border border-border px-3 py-1.5 text-paragraph text-text-primary hover:bg-background-secondary"
        >
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-md rounded-md border border-border p-4">
        <AgentChat steps={steps} />
      </div>
    </div>
  );
}

export function AgentChatShowcase() {
  return (
    <div className="flex flex-col gap-xl">
      {/* Primitives */}
      <div className="flex flex-col gap-sm">
        <p className="text-paragraph font-medium text-text-primary">AssetChip</p>
        <div className="flex flex-wrap gap-sm">
          <AssetChip asset={{ id: "1", name: "Ski Resort EDA", kind: "notebook" }} />
          <AssetChip asset={{ id: "2", name: "ski_resort_eda.py", kind: "file" }} />
          <AssetChip asset={{ id: "3", name: "wbschema1.properties", kind: "table" }} />
          <AssetChip asset={{ id: "4", name: "revenue_model", kind: "model" }} />
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-paragraph font-medium text-text-primary">CollapsibleSection</p>
        <div className="flex flex-col gap-sm">
          <CollapsibleSection label="3 actions" defaultOpen>
            <span className="text-paragraph text-text-secondary">Created notebook</span>
            <span className="text-paragraph text-text-secondary">Edited ski_resort_eda.py</span>
            <span className="text-paragraph text-text-secondary">Ran Ski Resort EDA</span>
          </CollapsibleSection>
          <CollapsibleSection label="2 assets">
            <span className="text-paragraph text-text-secondary">Ski Resort EDA +10</span>
            <span className="text-paragraph text-text-secondary">ski_resort_eda.py +3</span>
          </CollapsibleSection>
        </div>
      </div>

      {/* Full static message feed */}
      <div className="flex flex-col gap-sm">
        <p className="text-paragraph font-medium text-text-primary">Full message feed (static)</p>
        <div className="flex flex-col gap-md rounded-md border border-border p-4">
          <AgentChat steps={STATIC_STEPS} />
        </div>
      </div>

      {/* Streaming demo */}
      <div className="flex flex-col gap-sm">
        <p className="text-paragraph font-medium text-text-primary">Streaming demo</p>
        <StreamingDemo />
      </div>
    </div>
  );
}
