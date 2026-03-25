"use client";

import * as React from "react";

import { Alert, type AlertAction, type AlertActionsPlacement, type AlertSize, type AlertTone } from "./Alert";

function buildActions(count: number): AlertAction[] {
  const base: AlertAction[] = [
    { id: "a1", label: "Button" },
    { id: "a2", label: "Button" },
    { id: "a3", label: "Button" },
  ];
  return base.slice(0, Math.max(0, Math.min(3, count)));
}

function Example({
  tone,
  size,
  actionsPlacement,
  actionCount,
  description,
  closable,
}: {
  tone: AlertTone;
  size: AlertSize;
  actionsPlacement: AlertActionsPlacement;
  actionCount: number;
  description: boolean;
  closable: boolean;
}) {
  const actions = buildActions(actionCount);

  return (
    <Alert
      tone={tone}
      size={size}
      title="Alert title"
      description={description ? "Optional description to clarify what the user needs to do." : undefined}
      actions={actions}
      actionsPlacement={actionsPlacement}
      onClose={closable ? () => {} : undefined}
      className="w-full max-w-[620px]"
    />
  );
}

export function AlertShowcase() {
  const tones: AlertTone[] = ["danger", "warning", "info", "success"];

  return (
    <div className="flex w-full flex-col gap-sm">
      {/* Default size: inline actions + close + description */}
      <div className="flex w-full flex-col gap-sm">
        {tones.map((tone) => (
          <Example
            key={`default-inline-${tone}`}
            tone={tone}
            size="default"
            actionsPlacement="inline"
            actionCount={1}
            description
            closable
          />
        ))}
      </div>

      {/* Default size: stacked actions + close + description */}
      <div className="flex w-full flex-col gap-sm">
        {tones.map((tone) => (
          <Example
            key={`default-stacked-${tone}`}
            tone={tone}
            size="default"
            actionsPlacement="stacked"
            actionCount={2}
            description
            closable
          />
        ))}
      </div>

      {/* Small size: inline actions, no close, no description */}
      <div className="flex w-full flex-col gap-sm">
        {tones.map((tone) => (
          <Example
            key={`small-inline-${tone}`}
            tone={tone}
            size="small"
            actionsPlacement="inline"
            actionCount={1}
            description={false}
            closable={false}
          />
        ))}
      </div>
    </div>
  );
}

