# Scheduled Genie Code Tasks — Design Spec

**Date:** 2026-04-28  
**Author:** Kyle Gilbreath  
**Status:** Approved for implementation

---

## Overview

Users can schedule Genie Code to run automatically via a time-based schedule, job completion event, or file arrival trigger. Each run produces a Genie Code thread (identical to an interactive thread) and optionally sends an email notification. The feature lives in the existing Scheduled Tasks area of the full-screen Genie Code view.

**Source PRD:** [Scheduled Genie Code](https://docs.google.com/document/d/1d1QyL7VjtjZcxsI6g5QHfPEbaLkrMhECPGT83QHkJBA)  
**Related:** [Genie Code Auto Mode](https://docs.google.com/document/d/1-nj7eScf_rehOiyGw7yhWTT4rt4g3NfyCF-y8LfSd98)

---

## Scope

**In scope:**
- Create/edit scheduled task via sliding config panel
- Three trigger types: time-based, job completion, file arrival
- Task detail page with run history (list of triggered threads)
- "Schedule" button entry point on Genie Code thread responses
- Email notification config per task (always / on failure only / never)
- Auto Mode notice in task creation flow

**Out of scope (v2):**
- Asset attachment (notebooks, dashboards as agent context)
- Granular tool approval UI
- "Promote to recurring" flow from an existing conversation
- Functional backend scheduling / real email delivery

---

## Data Model

```typescript
type ScheduledTask = {
  id: string;
  title: string;           // auto-generated from prompt (~6 words), editable
  prompt: string;          // what the agent should do when triggered
  trigger: ScheduleTrigger;
  notification: "always" | "on_failure" | "never";
  lastRun: string;         // relative time: "2d ago", "14h ago", or null
  status: "success" | "failed" | "running" | "idle";
}

type ScheduleTrigger =
  | { type: "time"; schedule: string }                       // "Every Mon 8:00 AM"
  | { type: "job_completion"; jobId: string; jobName: string }
  | { type: "file_arrival"; path: string }
```

`"idle"` status is used for tasks that have never been triggered.  
`title` is auto-populated from the first ~6 words of the prompt when the user creates the task.

---

## Entry Points

### Entry Point A — "New" button in Scheduled Tasks list
- Opens the create config panel (slide-in from right)
- Prompt field is empty
- Trigger defaults to "Time-based"
- Notification defaults to "On failure only"

### Entry Point B — "Schedule" button on a thread response
- A "Schedule" button appears in the action row below any Genie Code response
- Icon: `clockIcon`
- Style: matches existing secondary thread action buttons (copy, thumbs up/down)
- On click: opens the same create config panel
- Prompt field is pre-filled: `"Repeat: [first line of the prompt that produced this response]"`
- A "View thread" link in the panel header anchors back to the source conversation

Both entry points open the same panel component. The only difference is whether the prompt arrives pre-filled.

---

## Config Panel (Create / Edit)

A right-side sliding drawer that opens over the current view. Single scrollable form — no steps.

### Header
- Title: "New scheduled task" (create) or task name (edit)
- X button to close
- "Save task" primary button (top right)

### Form Fields

1. **Task name** — text input, auto-populated from prompt, always editable
2. **Prompt** — multiline textarea, required  
   Placeholder: "What should Genie Code do when triggered?"
3. **Trigger** — segmented control: Time-based / Job completion / File arrival
   - **Time-based:** frequency selector (daily / weekly / monthly / custom) + time picker
   - **Job completion:** typeahead text input — "Search jobs..."
   - **File arrival:** text input — "Enter file path or pattern"
4. **Auto Mode notice** — info banner (non-blocking):  
   "This task runs unattended in Auto Mode — Genie Code will approve its own tool calls using an LLM judge." + "Learn more" link → Auto Mode settings  
   If Auto Mode is globally off, upgrades to a warning banner:  
   "Auto Mode is off. Unattended runs may stall waiting for tool approvals." + "Turn on Auto Mode" link
5. **Notifications** — segmented control or select: Always / On failure only / Never

### Footer (sticky)
- "Cancel" tertiary button
- "Save task" primary button
- On save: panel closes, task appears at top of list with `"idle"` status badge

---

## Scheduled Tasks List

Existing UI with the following updates:

- Status badge gains `"idle"` state (grey dot, label "Never run")
- Each row shows: status dot · task name · trigger summary · last run time  
  Trigger summary examples: "Daily 6:00 AM", "After job: forecast_pipeline", "On file: /mnt/data/..."
- Clicking a row navigates to the **Task Detail page** (not a panel)

---

## Task Detail Page

### Navigation
- Breadcrumb: `Scheduled tasks > [Task name]`
- Back chevron returns to the list

### Page Header
- Task name
- Trigger summary (e.g. "Daily 6:00 AM")
- "Edit task" button → opens config panel in edit mode
- "Run now" button → immediately triggers execution, status → `"running"`
- Kebab/overflow menu → "Delete task" (with confirmation)

### Body — Run History
- Flat list of Genie Code threads produced by this task, newest first
- Each row: status badge · timestamp · duration · first line of thread summary · "View thread →" link
- "Email sent" chip on rows where a notification email was dispatched
- Clicking a row navigates into the full thread view (same view as threads in the main left-nav thread list)
- **Empty state:** "No runs yet. This task hasn't been triggered."

Threads triggered by scheduled tasks are identical to interactive threads — no special treatment in the thread view itself.

---

## Notifications

- Email is sent when a run completes (or fails), per the task's notification setting
- Email contains: task name, trigger that fired, run status, thread summary (~2-3 sentences)
- "View thread →" CTA in the email opens the full thread
- In the prototype, email delivery is represented by an "Email sent" chip in the run history row

---

## Auto Mode Integration

Scheduled tasks always run in Auto Mode — there is no user present to approve tool calls. The config panel surfaces a notice (not a gate) so the user understands this before saving.

- If Auto Mode is globally on: info banner (blue, informational)
- If Auto Mode is globally off: warning banner (yellow) with a direct link to turn it on
- The user can save a task regardless of Auto Mode state — the warning is non-blocking

Granular per-task tool approval UI is out of scope for v1.

---

## Component Map

| Component | Location | Notes |
|---|---|---|
| `ScheduledTasksMainView` | `app/chat/page.tsx` | Add `"idle"` status, update row to show trigger summary, make rows navigate to detail |
| `ScheduledTaskConfigPanel` | `app/chat/page.tsx` | Replace static read-only display with full create/edit form |
| `ScheduledTaskDetailPage` | `app/chat/page.tsx` | New component — breadcrumb, header, run history list |
| `ScheduleButton` | `app/chat/page.tsx` | New — action button on thread response rows |
| `ScheduledTask` type | `app/chat/page.tsx` | Extend with `prompt`, `trigger`, updated `status` |
| `ScheduleTrigger` type | `app/chat/page.tsx` | New union type |

---

## Open Questions (from PRD, not resolved in this spec)

1. **Is this a Job task?** The PRD asks whether scheduled Genie Code tasks should be built on the Jobs primitive. This affects backend architecture but not the prototype UI.
2. **Auto Mode read-only v0?** PRD asks whether background runs should default to read-only. Resolved for prototype: surfaced as a non-blocking notice, not enforced.
