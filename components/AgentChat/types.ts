export type AssetKind = "notebook" | "file" | "model" | "table" | "dashboard";

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
}

export type ActionVerb = "Created" | "Edited" | "Opened" | "Ran" | "Deleted";
export type ActionStatus = "pending" | "running" | "done" | "error";

export interface AgentAction {
  id: string;
  verb: ActionVerb;
  asset: Asset;
  status: ActionStatus;
}

export interface UserMessage {
  type: "user";
  id: string;
  text: string;
}

export interface AssistantTextMessage {
  type: "assistant-text";
  id: string;
  text: string;
}

export interface ThinkingMessage {
  type: "thinking";
  id: string;
  text: string;
}

export interface ActionGroupMessage {
  type: "action-group";
  id: string;
  actions: AgentAction[];
  defaultOpen?: boolean;
}

export interface ToolConfirmationMessage {
  type: "tool-confirmation";
  id: string;
  verb: ActionVerb;
  asset: Asset;
  permissionLabel?: string;
  initialStatus?: "asking" | "done" | "declined";
}

export interface AssetSubItem {
  id: string;
  name: string;
  diffCount?: number;
}

export interface ReviewAsset extends Asset {
  diffCount?: number;
  /** Expandable sub-items, e.g. cells within a notebook */
  subItems?: AssetSubItem[];
}

export interface AssetsSummaryMessage {
  type: "assets-summary";
  id: string;
  assets: ReviewAsset[];
  defaultOpen?: boolean;
}

export interface SuggestionChipsMessage {
  type: "suggestion-chips";
  id: string;
  suggestions: string[];
}

export interface FeedbackMessage {
  type: "feedback";
  id: string;
}

export type ChatStep =
  | UserMessage
  | AssistantTextMessage
  | ThinkingMessage
  | ActionGroupMessage
  | ToolConfirmationMessage
  | AssetsSummaryMessage
  | SuggestionChipsMessage
  | FeedbackMessage;

export type RunStatus = "idle" | "running" | "done" | "error";
