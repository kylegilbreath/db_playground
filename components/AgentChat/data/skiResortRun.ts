import type { ChatStep } from "../types";

// NOTE: user message is injected dynamically from the actual input text.
// This array contains only the assistant-side steps.

export const SKI_RESORT_STEPS: ChatStep[] = [
  {
    type: "thinking",
    id: "think-1",
    text: "I'll start by inspecting the ski_resorts table schema, then sample the data to find relevant columns before running EDA.",
  },
  {
    type: "action-group",
    id: "actions-1",
    defaultOpen: true,
    actions: [
      {
        id: "a1",
        verb: "Created",
        asset: { id: "nb1", name: "Ski Resort EDA", kind: "notebook" },
        status: "done",
      },
      {
        id: "a2",
        verb: "Ran",
        asset: { id: "nb1", name: "Ski Resort EDA", kind: "notebook" },
        status: "done",
      },
      {
        id: "a1-dash",
        verb: "Created",
        asset: { id: "dash1", name: "Ski Resort Dashboard", kind: "dashboard" },
        status: "done",
      },
    ],
  },
  {
    type: "tool-confirmation",
    id: "confirm-1",
    verb: "Edited",
    asset: { id: "f1", name: "ski_resort_eda.py", kind: "file" },
    permissionLabel: "Ask every time",
  },
  {
    type: "action-group",
    id: "actions-2",
    defaultOpen: false,
    actions: [
      {
        id: "a3",
        verb: "Edited",
        asset: { id: "f1", name: "ski_resort_eda.py", kind: "file" },
        status: "done",
      },
      {
        id: "a4",
        verb: "Ran",
        asset: { id: "f1", name: "ski_resort_eda.py", kind: "file" },
        status: "done",
      },
      {
        id: "a5",
        verb: "Opened",
        asset: { id: "nb1", name: "Ski Resort EDA", kind: "notebook" },
        status: "done",
      },
      {
        id: "a6",
        verb: "Created",
        asset: { id: "dash1", name: "Ski Resort Dashboard", kind: "dashboard" },
        status: "done",
      },
    ],
  },
  {
    type: "assistant-text",
    id: "text-1",
    text: "Key Booking Statistics for Ski Resorts\n\nOverall Booking Status:\n- Pending: 183 bookings ($101,800 total, $556 avg)\n- Confirmed: 95 bookings ($50,592 total, $533 avg)\n- Cancelled: 56 bookings ($29,204 total, $522 avg)\n- Completed: 53 bookings ($28,901 total, $545 avg)\n\nTop Destinations:\n- Lake Tahoe leads with 90 properties (avg $259)\n- Banff: 24 properties (avg $305)\n- Whistler: 18 properties (avg $323)\n- St. Moritz: 17 properties (avg $261)\n- Chamonix: 15 properties (avg $271)\n\nAverage booking: 1.7 guests, ~$540 revenue across all statuses.",
  },
  {
    type: "assets-summary",
    id: "assets-1",
    defaultOpen: true,
    assets: [
      {
        id: "nb1",
        name: "Ski Resort EDA",
        kind: "notebook",
        diffCount: 40,
        subItems: [
          { id: "cell-1", name: "Schema inspection & table sample", diffCount: 12 },
          { id: "cell-2", name: "Booking status breakdown by country", diffCount: 14 },
          { id: "cell-3", name: "Revenue forecast — next 6 months", diffCount: 14 },
        ],
      },
      { id: "f1", name: "ski_resort_eda.py", kind: "file", diffCount: 10 },
      { id: "dash1", name: "Ski Resort Dashboard 2026-03-10", kind: "dashboard" },
    ],
  },
  {
    type: "suggestion-chips",
    id: "suggestions-1",
    suggestions: [
      "Forecast revenue for the next 6 months",
      "Show properties with the highest cancellation rate",
      "Compare weekend vs weekday booking patterns",
    ],
  },
  {
    type: "feedback",
    id: "feedback-1",
  },
];

export const SKI_RESORT_DELAYS: number[] = [
  500,   // thinking
  1200,  // action-group 1
  2400,  // tool-confirmation
  3200,  // action-group 2
  5000,  // assistant-text
  5600,  // assets-summary
  6200,  // suggestion-chips
  6800,  // feedback
];
