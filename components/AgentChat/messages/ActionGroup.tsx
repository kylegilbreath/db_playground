import * as React from "react";
import { CollapsibleSection } from "../primitives/CollapsibleSection";
import { ActionRow } from "./ActionRow";
import type { ActionGroupMessage } from "../types";

export function ActionGroup({ step }: { step: ActionGroupMessage }) {
  const label = `${step.actions.length} action${step.actions.length !== 1 ? "s" : ""}`;
  return (
    <CollapsibleSection label={label} defaultOpen={step.defaultOpen ?? false}>
      {step.actions.map((action) => (
        <ActionRow key={action.id} action={action} />
      ))}
    </CollapsibleSection>
  );
}
