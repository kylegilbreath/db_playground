export type CustomTextWidgetMarkdownPayload = {
  id: string;
  markdown: string;
};

/**
 * Backend-like registry of swappable Markdown payloads for the `/one` custom text widget.
 *
 * Note: Treat these strings as trusted, repo-owned demo content. Keep payloads limited to
 * basic Markdown (headings, paragraphs, lists, links) and avoid scripts/styles.
 */
export const ONE_CUSTOM_TEXT_WIDGET_MARKDOWN: Record<string, CustomTextWidgetMarkdownPayload> = {
  welcome_v1: {
    id: "welcome_v1",
    markdown: [
      "### 👋 Welcome to the Nike Analytics Workspace",
      "",
      "This workspace is the shared home for analytics, reporting, and business insights across Nike. It brings together trusted metrics, curated dashboards, and guided insights to support day-to-day decision-making.",
      "",
      "#### Get started",
      "",
      "- 📂 [Browse dashboards and reports](#)",
      "- [View certified metrics and definitions](#)",
      "- [Read the onboarding guide for business users](#)",
      "",
      "#### What’s important",
      "",
      "- Use certified metrics for leadership reporting and recurring reviews",
      "- Dashboards in this workspace reflect standardized, agreed-upon definitions",
      "- Some legacy reports may be phased out as metrics are consolidated",
      "",
      "#### Need help?",
      "",
      "- 💬 **#nike-analytics-help** on Slack",
      "- Office hours: Wednesdays 1–2pm",
      "- Workspace owners: Analytics Platform Team",
      "",
      "#### Standards",
      "",
      "- New dashboards should include an owner and clear description",
      "- Prefer shared metric definitions whenever available",
      "- Avoid duplicating reports that already exist in this workspace",
    ].join("\n"),
  },
  welcome_v2: {
    id: "welcome_v2",
    markdown: [
      "### Welcome to the One home",
      "",
      "Use this space for announcements, onboarding, and standards.",
      "",
      "#### Popular links",
      "",
      "- [Read the onboarding guide](#)",
      "- [Request access](#)",
      "- [Ask for help](#)",
    ].join("\n"),
  },
};

