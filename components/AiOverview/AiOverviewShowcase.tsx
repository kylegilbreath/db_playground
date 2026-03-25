"use client";

import * as React from "react";

import { AiFollowUp } from "./AiFollowUp";
import { AiOverview } from "./AiOverview";

function ExampleContent({ expanded }: { expanded: boolean }) {
  return (
    <div className="space-y-sm">
      <p>
        Your campaign pipeline combines data from <span className="font-semibold">Salesforce</span>,{" "}
        <span className="font-semibold">Marketo</span>, and{" "}
        <span className="font-semibold">Snowflake</span> to track marketing-sourced opportunities
        across channels.
      </p>
      <p className="font-semibold">Current summary:</p>
      <ul className="list-disc pl-lg">
        <li>Total active campaigns: 126</li>
        <li>Quarter-to-date pipeline value: $8.4M</li>
        <li>Avg. conversion rate: 4.2%</li>
        <li>Top channel: Paid Search (32% of pipeline)</li>
        <li>Largest segment: SMB (41% of influenced pipeline)</li>
        <li>Attribution window: 30 days (default)</li>
      </ul>
      <p>
        A few campaigns are currently over-indexing on impressions but underperforming on
        opportunity creation. The biggest deltas appear in EMEA, where form completion rates are
        down week-over-week.
      </p>
      <p>
        Recommended next step: validate tracking for the Q3 launch landing pages and re-check UTM
        consistency across paid social and partner syndication.
      </p>
      {expanded ? (
        <>
          <p className="font-semibold">Recent trend:</p>
          <p>
            Pipeline grew <span className="font-semibold">+11% MoM</span>, led by Q3 product launch
            campaigns in North America.
          </p>
          <p className="font-semibold">Key drivers:</p>
          <ul className="list-disc pl-lg">
            <li>Branded search CPC decreased 7% while volume held steady</li>
            <li>Webinar re-engagement emails improved click-through by 1.3pp</li>
            <li>Partner referrals increased, but lead quality varies by source</li>
          </ul>
        </>
      ) : null}
    </div>
  );
}

export function AiOverviewShowcase() {
  const refs = [
    { id: "campaigns", label: "campaigns" },
    { id: "opportunities", label: "opportunities" },
    { id: "roi_summary", label: "roi_summary" },
  ];

  const [expandedInput, setExpandedInput] = React.useState(false);
  const [expandedButton, setExpandedButton] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-lg">
      <AiOverview
        expanded={expandedInput}
        onExpandedChange={setExpandedInput}
        refs={refs}
        showCollapseButton
        followUp={
          <AiFollowUp
            mode="input"
            suggestions={[
              {
                id: "q1",
                label: "How many leads were generated from paid search campaigns this month?",
              },
              { id: "q2", label: "Which campaigns are driving the highest ROI?" },
              { id: "q3", label: "Show me pipeline growth by region." },
            ]}
          />
        }
      >
        <ExampleContent expanded={expandedInput} />
      </AiOverview>

      <AiOverview
        expanded={expandedButton}
        onExpandedChange={setExpandedButton}
        refs={refs}
        followUp={<AiFollowUp mode="button" buttonLabel="Ask a follow-up" />}
      >
        <ExampleContent expanded={expandedButton} />
      </AiOverview>
    </div>
  );
}

