import type { ChatStep, ReviewAsset } from "../types";

export const ASSISTANT_DASHBOARD_STEPS: ChatStep[] = [
  {
    type: "user",
    id: "user-1",
    text: "I want to build a dashboard for Assistant usage that refreshes daily. Start by just analyzing the data, focusing on data from the last 3 months. I care about DAU, WAU, engagement, and any other key metrics you think we should include. After we've reviewed the metrics, create a notebook that can run daily and the dashboard will read from those tables and set them to run daily.",
  },
  {
    type: "assistant-text",
    id: "text-1",
    text: "I'll help you build a dashboard for Assistant usage with daily refresh. Let me start by finding the relevant data tables for Assistant usage metrics.",
  },
  {
    type: "action-group",
    id: "actions-1",
    defaultOpen: false,
    actions: [
      {
        id: "a1",
        verb: "Ran",
        asset: { id: "t1", name: "system.access.audit", kind: "table" },
        status: "done",
      },
    ],
  },
  {
    type: "assistant-text",
    id: "text-2",
    text: "Starting with analyzing DAU and WAU from the activity logs table. I'll calculate daily active users, weekly active users, and total interactions for the last 3 months.",
  },
  {
    type: "tool-confirmation",
    id: "confirm-1",
    verb: "Ran",
    asset: { id: "q1", name: "Executing SQL query", kind: "table" },
    permissionLabel: "Always allow for this thread",
    initialStatus: "done",
  },
  {
    type: "assistant-text",
    id: "text-3",
    text: "I retrieved an initial summary and want to create a notebook to continue the analysis",
  },
  {
    type: "tool-confirmation",
    id: "confirm-2",
    verb: "Created",
    asset: { id: "nb1", name: "Assistant Usage Analysis", kind: "notebook" },
    permissionLabel: "Ask every time",
    initialStatus: "done",
  },
  {
    type: "action-group",
    id: "actions-2",
    defaultOpen: false,
    actions: [
      { id: "a2", verb: "Edited", asset: { id: "nb1", name: "Assistant Usage Analysis", kind: "notebook" }, status: "done" },
      { id: "a3", verb: "Ran", asset: { id: "q2", name: "dau_query.sql", kind: "file" }, status: "done" },
      { id: "a4", verb: "Ran", asset: { id: "q3", name: "wau_query.sql", kind: "file" }, status: "done" },
      { id: "a5", verb: "Created", asset: { id: "t2", name: "assistant_metrics.dau", kind: "table" }, status: "done" },
      { id: "a6", verb: "Created", asset: { id: "t3", name: "assistant_metrics.wau", kind: "table" }, status: "done" },
      { id: "a7", verb: "Created", asset: { id: "t4", name: "assistant_metrics.engagement", kind: "table" }, status: "done" },
    ],
  },
  {
    type: "assistant-text",
    id: "text-4",
    text: "I've finished writing the new Assistant analysis tables to your schema. Now let's create a dashboard to track this.",
  },
  {
    type: "tool-confirmation",
    id: "confirm-3",
    verb: "Created",
    asset: { id: "dash1", name: "Assistant Usage Dashboard", kind: "dashboard" },
    permissionLabel: "Ask every time",
    initialStatus: "done",
  },
  {
    type: "assistant-text",
    id: "text-5",
    text: "I'm all finished! Check out the plots and let me know if you wanted to analyze this by property type instead.",
  },
];

export const ASSISTANT_DASHBOARD_REVIEW_ASSETS: ReviewAsset[] = [
  { id: "nb1", name: "Assistant Usage Analysis", kind: "notebook", diffCount: 27 },
  { id: "dash1", name: "Assistant Usage Dashboard", kind: "dashboard", diffCount: 13 },
];

export const ASSISTANT_DASHBOARD_DELAYS: number[] = [
  0, 600, 1200, 1800, 2400, 3000, 3600, 4200, 5000, 5600, 6200, 6800,
];
