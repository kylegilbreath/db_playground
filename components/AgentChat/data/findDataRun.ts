import type { ChatStep } from "../types";

export const FIND_DATA_STEPS: ChatStep[] = [
  {
    type: "thinking",
    id: "think-1",
    text: "I'll search the catalog for relevant datasets connected to this notebook's context.",
  },
  {
    type: "action-group",
    id: "actions-1",
    defaultOpen: true,
    actions: [
      {
        id: "a1",
        verb: "Opened",
        asset: { id: "t1", name: "wbschema1.properties", kind: "table" },
        status: "done",
      },
      {
        id: "a2",
        verb: "Opened",
        asset: { id: "t2", name: "wbschema1.bookings", kind: "table" },
        status: "done",
      },
      {
        id: "a3",
        verb: "Opened",
        asset: { id: "t3", name: "wbschema1.guests", kind: "table" },
        status: "done",
      },
    ],
  },
  {
    type: "assistant-text",
    id: "text-1",
    text: "I found 3 relevant tables in wanderbricks-bugbash-1:\n\n- wbschema1.properties — 387 rows, 14 columns. Contains property listings with location, price, and bedroom count.\n- wbschema1.bookings — 2,841 rows, 9 columns. Contains booking status, revenue, and guest info.\n- wbschema1.guests — 1,203 rows, 6 columns. Guest demographics and booking history.",
  },
  {
    type: "suggestion-chips",
    id: "suggestions-1",
    suggestions: [
      "Run EDA on the bookings table",
      "Join properties with bookings",
      "Show me the schema for all three tables",
    ],
  },
  {
    type: "feedback",
    id: "feedback-1",
  },
];

export const FIND_DATA_DELAYS: number[] = [400, 1000, 3200, 3800, 4400];
