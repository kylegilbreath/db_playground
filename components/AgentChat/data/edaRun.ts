import type { ChatStep } from "../types";

export const EDA_STEPS: ChatStep[] = [
  {
    type: "user",
    id: "user-1",
    text: "Do EDA on my ski_resort data",
  },
  {
    type: "thinking",
    id: "think-1",
    text: "The user wants to run EDA on the available data. I'll query the properties table and summarize the key metrics.",
  },
  {
    type: "action-group",
    id: "actions-1",
    defaultOpen: true,
    actions: [
      {
        id: "a1",
        verb: "Ran",
        asset: { id: "t1", name: "wbschema1.properties", kind: "table" },
        status: "done",
      },
    ],
  },
  {
    type: "assistant-text",
    id: "text-1",
    text: "Here's what I found in the properties table:\n\n- 387 total properties across 12 countries\n- Average price: $268/night\n- Average bedrooms: 2.4\n- Top property types: Chalet (42%), Condo (31%), Cabin (18%)\n- Highest avg price: Switzerland ($412), Canada ($338), USA ($241)\n\nThe data looks clean — no nulls in key columns.",
  },
  {
    type: "suggestion-chips",
    id: "suggestions-1",
    suggestions: [
      "Forecast revenue for the next 6 months",
      "Show me outliers in the pricing data",
      "Break down by property type",
    ],
  },
  {
    type: "feedback",
    id: "feedback-1",
  },
];

export const EDA_DELAYS: number[] = [400, 1000, 3500, 4200, 4800];
