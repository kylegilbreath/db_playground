import * as React from "react";
import { CollapsibleSection } from "../primitives/CollapsibleSection";
import { ActionRow } from "./ActionRow";
import type { ActionGroupMessage, ReviewAsset } from "../types";

export function ActionGroup({ step, onAssetClick }: { step: ActionGroupMessage; onAssetClick?: (asset: ReviewAsset) => void }) {
  const label = `${step.actions.length} action${step.actions.length !== 1 ? "s" : ""}`;
  return (
    <CollapsibleSection label={label} defaultOpen={step.defaultOpen ?? false}>
      {step.actions.map((action) => (
        <ActionRow key={action.id} action={action} onAssetClick={onAssetClick} />
      ))}
    </CollapsibleSection>
  );
}
