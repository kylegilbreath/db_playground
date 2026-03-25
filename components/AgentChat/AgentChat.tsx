import * as React from "react";
import type { ChatStep, ReviewAsset } from "./types";
import { UserMessage } from "./messages/UserMessage";
import { AssistantText } from "./messages/AssistantText";
import { ThinkingBlock } from "./messages/ThinkingBlock";
import { ActionGroup } from "./messages/ActionGroup";
import { ToolConfirmationCard } from "./messages/ToolConfirmationCard";
import { AssetsSummary } from "./messages/AssetsSummary";
import { SuggestionChips } from "./messages/SuggestionChips";
import { FeedbackRow } from "./messages/FeedbackRow";

export function AgentChat({
  steps,
  onSuggestionSelect,
  onToolAllow,
  onAssetClick,
}: {
  steps: ChatStep[];
  onSuggestionSelect?: (text: string) => void;
  onToolAllow?: (stepId: string) => void;
  onAssetClick?: (asset: ReviewAsset) => void;
}) {
  return (
    <div className="flex flex-col gap-md">
      {steps.map((step) => {
        switch (step.type) {
          case "user":
            return <UserMessage key={step.id} step={step} />;
          case "assistant-text":
            return <AssistantText key={step.id} step={step} />;
          case "thinking":
            return <ThinkingBlock key={step.id} step={step} />;
          case "action-group":
            return <ActionGroup key={step.id} step={step} onAssetClick={onAssetClick} />;
          case "tool-confirmation":
            return (
              <ToolConfirmationCard
                key={step.id}
                step={step}
                onAllow={onToolAllow ? () => onToolAllow(step.id) : undefined}
                onAssetClick={onAssetClick}
              />
            );
          case "assets-summary":
            return <AssetsSummary key={step.id} step={step} onAssetClick={onAssetClick} />;
          case "suggestion-chips":
            return <SuggestionChips key={step.id} step={step} onSelect={onSuggestionSelect} />;
          case "feedback":
            return <FeedbackRow key={step.id} step={step} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
