"use client";

import * as React from "react";

import { useGenieCode } from "@/components/GenieCodePanel/GenieCodeContext";
import { GenieCodeSidePanel, GenieCodeRightRail } from "@/components/GenieCodePanel/GenieCodeSidePanel";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import { TabBar, type TabBarTab } from "@/components/PlatformChrome/TabBar";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";
import { Tag } from "@/components/Tag/Tag";
import { DefaultButton } from "@/components/DefaultButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TertiaryButton } from "@/components/TertiaryButton";


// ---------------------------------------------------------------------------
// Notebook toolbar
// ---------------------------------------------------------------------------

const MENU_ITEMS = ["File", "Edit", "View", "Run", "Help"];

function NotebookToolbar({ language = "Python" }: { language?: string }) {
  return (
    <div className="flex shrink-0 items-center border-b border-border bg-background-primary px-4">
      {/* Menu items */}
      <div className="flex items-center">
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className="px-2 py-2 text-paragraph leading-5 text-text-secondary hover:text-text-primary"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Language badge */}
      <button
        type="button"
        className="ml-1 px-2 py-2 text-paragraph leading-5 text-text-secondary hover:text-text-primary"
      >
        {language}
      </button>

      <div className="flex-1" />

      {/* Right-side actions */}
      <div className="flex items-center gap-sm py-1">
        <PrimaryButton size="small" leadingIcon={<Icon name="playIcon" size={14} />}>
          Run all
        </PrimaryButton>
        <DefaultButton size="small" leadingIcon={<span className="inline-block h-2 w-2 rounded-full bg-green-500" />} menu>
          Serverless
        </DefaultButton>
        <DefaultButton size="small">Schedule</DefaultButton>
        <DefaultButton size="small">Share</DefaultButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

const NOTEBOOK_TABS: TabBarTab[] = [
  { id: "tab-eda", label: "Ski Resort EDA" },
  { id: "tab-py", label: "file-name.py" },
];

// ---------------------------------------------------------------------------
// Notebook cells
// ---------------------------------------------------------------------------

const STEP1_SQL = `%sql
-- Use the specified catalog
USE CATALOG \`wanderbricks-bugbash-1\`;

-- Select the top countries and average number of bedrooms
WITH CountryStats AS (
  SELECT
    country,
    COUNT(*) AS property_count,
    AVG(bedrooms) AS avg_bedrooms
  FROM \`wbschema1\`.\`properties\`
  GROUP BY country
  ORDER BY property_count DESC
  LIMIT 10
)

-- Compare these stats to the overall properties list
SELECT
  cs.country,
  cs.property_count,
  cs.avg_bedrooms,
  overall.avg_bedrooms AS overall_avg_bedrooms
FROM CountryStats cs
CROSS JOIN (
  SELECT AVG(bedrooms) AS avg_bedrooms
  FROM \`wbschema1\`.\`properties\`
) overall;`;

type TableRow = { orderId: string; status: string; price: number };

const TABLE_ROWS: TableRow[] = [
  { orderId: "0", status: "completed", price: 8 },
  { orderId: "1", status: "completed", price: 9 },
  { orderId: "2", status: "completed", price: 8 },
];

function ResultTable({ rows }: { rows: TableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full text-paragraph leading-5">
        <thead>
          <tr className="border-b border-border bg-background-secondary">
            <th className="px-3 py-1.5 text-left font-medium text-text-secondary">ORDER_ID</th>
            <th className="px-3 py-1.5 text-left font-medium text-text-secondary">ORDER_STATUS</th>
            <th className="px-3 py-1.5 text-left font-medium text-text-secondary">PRICE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.orderId} className="border-b border-border last:border-0">
              <td className="px-3 py-1.5 text-text-primary">{r.orderId}</td>
              <td className="px-3 py-1.5 text-text-primary">{r.status}</td>
              <td className="px-3 py-1.5 text-text-primary">{r.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-sm border-t border-border px-3 py-1.5">
        <span className="text-paragraph text-text-secondary">Table</span>
        <Icon name="chevronDownIcon" size={12} className="text-text-secondary" />
        <div className="flex-1" />
        <IconButton aria-label="Search" icon={<Icon name="searchIcon" size={14} />} size="small" tone="neutral" />
        <IconButton aria-label="Filter" icon={<Icon name="filterIcon" size={14} />} size="small" tone="neutral" />
        <IconButton aria-label="Layout" icon={<Icon name="gridIcon" size={14} />} size="small" tone="neutral" />
        <IconButton aria-label="Close" icon={<Icon name="closeIcon" size={14} />} size="small" tone="neutral" />
      </div>
    </div>
  );
}

function CellAcceptRejectBar() {
  return (
    <div className="flex items-center justify-between gap-sm border-t border-border px-3 py-1.5">
      <span className="text-paragraph text-text-secondary">1 of 2</span>
      <Icon name="chevronLeftIcon" size={14} className="text-text-secondary" />
      <Icon name="chevronRightIcon" size={14} className="text-text-secondary" />
      <div className="flex-1" />
      <DefaultButton size="small">Reject asset</DefaultButton>
      <PrimaryButton size="small">Accept asset</PrimaryButton>
    </div>
  );
}

function NotebookCell({
  stepNumber,
  stepTitle,
  stepDescription,
  bullets,
  code,
  language,
  showResult,
  runLabel,
  runTime,
  showAcceptReject,
  highlightedLines,
}: {
  stepNumber: number;
  stepTitle: string;
  stepDescription?: string;
  bullets?: string[];
  code: string;
  language: string;
  showResult?: boolean;
  runLabel?: string;
  runTime?: string;
  showAcceptReject?: boolean;
  highlightedLines?: number[];
}) {
  return (
    <div className="flex w-full flex-col gap-sm">
      {/* Step header */}
      <div className="flex flex-col gap-xs rounded-md border border-border bg-background-primary p-4">
        <div className="text-heading-s font-semibold text-text-primary">
          Step {stepNumber} – {stepTitle}
        </div>
        {stepDescription && (
          <p className="text-paragraph leading-5 text-text-secondary">{stepDescription}</p>
        )}
        {bullets && (
          <ul className="ml-4 list-disc text-paragraph leading-5 text-text-secondary">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Code cell */}
      <div className="flex w-full gap-2">
        {/* Cell gutter drag handle */}
        <div className="flex w-5 shrink-0 flex-col items-center pt-2">
          <Icon name="dragIcon" size={14} className="text-text-placeholder" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
          {/* Cell toolbar */}
          <div className="flex items-center gap-xs border-b border-border bg-background-secondary px-2 py-1">
            <PrimaryButton size="small" leadingIcon={<Icon name="playIcon" size={12} />}>
              {runLabel ?? "Just now"}
              {runTime && <span className="text-text-secondary">({runTime})</span>}
            </PrimaryButton>
            <span className="flex-1 text-caption text-text-secondary">
              Analyze and sample ski resort table
            </span>
            <Tag>{language.toUpperCase()}</Tag>
            <IconButton aria-label="Sparkle" icon={<Icon name="SparkleIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Expand" icon={<Icon name="expandMoreIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Delete" icon={<Icon name="closeIcon" size={14} />} size="small" tone="neutral" />
          </div>

          {/* Code */}
          <CodeBlock
            code={code}
            language={language}
            highlight
            showMenu={false}
            showLineNumbers
            maxVisibleLines={null}
            highlightedLines={highlightedLines}
            className="rounded-none border-0"
          />

          {/* Result */}
          {showResult && (
            <div className="flex flex-col gap-0 border-t border-border">
              <ResultTable rows={TABLE_ROWS} />
              {showAcceptReject && <CellAcceptRejectBar />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// File editor view (file-name.py tab)
// ---------------------------------------------------------------------------

const FILE_EDITOR_ROWS = [
  { id: 0, orderId: "0", status: "completed", category: "Sweets", price: "8" },
  { id: 1, orderId: "1", status: "canceled", category: "Quick Bites", price: "9" },
  { id: 2, orderId: "2", status: "completed", category: "Dumplings", price: "8" },
  { id: 3, orderId: "3", status: "completed", category: "Quick Bites", price: "11.3" },
  { id: 4, orderId: "4", status: "canceled", category: "Dumplings", price: "7.5" },
  { id: 5, orderId: "5", status: "completed", category: "Quick Bites", price: "9" },
  { id: 6, orderId: "6", status: "completed", category: "Veggies", price: "7.5" },
  { id: 7, orderId: "7", status: "completed", category: "Veggies", price: "11.3" },
  { id: 8, orderId: "8", status: "completed", category: "Veggies", price: "9" },
];

function FileEditorView() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Run bar */}
      <div className="flex shrink-0 items-center gap-sm border-b border-border bg-background-primary px-3 py-1.5">
        <div className="flex items-center">
          <PrimaryButton size="small" leadingIcon={<Icon name="playIcon" size={14} />} aria-label="Run">{""}</PrimaryButton>
          <DefaultButton size="small" aria-label="Run options">
            <Icon name="chevronDownIcon" size={12} />
          </DefaultButton>
        </div>
        <Icon name="checkIcon" size={14} className="text-green-500" />
        <span className="text-paragraph text-text-secondary">Just now (1s)</span>
        <div className="flex-1" />
        <IconButton aria-label="Sparkle" icon={<Icon name="SparkleIcon" size={14} />} size="small" tone="neutral" />
        <IconButton aria-label="More" icon={<Icon name="overflowIcon" size={14} />} size="small" tone="neutral" />
      </div>

      {/* Code area — fills remaining space above the result panel */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CodeBlock
          code={STEP1_SQL}
          language="sql"
          highlight
          showMenu={false}
          showLineNumbers
          maxVisibleLines={null}
          highlightedLines={[20]}
          className="rounded-none border-0 border-b border-border"
        />
      </div>

      {/* Result panel */}
      <div className="flex shrink-0 flex-col border-t border-border">
        {/* Result toolbar */}
        <div className="flex items-center gap-xs border-b border-border px-3 py-1.5">
          <TertiaryButton size="small" tone="neutral" menu>Table</TertiaryButton>
          <IconButton aria-label="Add" icon={<Icon name="plusIcon" size={14} />} size="small" tone="neutral" />
          <div className="flex-1" />
          <div className="flex items-center gap-xs">
            <IconButton aria-label="Search" icon={<Icon name="searchIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Filter" icon={<Icon name="filterIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Layout" icon={<Icon name="gridIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Expand" icon={<Icon name="expandLessIcon" size={14} />} size="small" tone="neutral" />
            <IconButton aria-label="Close" icon={<Icon name="closeIcon" size={14} />} size="small" tone="neutral" />
          </div>
        </div>

        {/* Result table */}
        <div className="overflow-auto" style={{ maxHeight: 280 }}>
          <table className="w-full text-paragraph leading-5">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                <th className="w-10 px-3 py-2 text-left font-medium text-text-secondary" />
                <th className="px-3 py-2 text-left font-medium text-text-secondary">
                  <span className="flex items-center gap-xs">
                    <Icon name="tableIcon" size={12} className="text-text-secondary" />
                    ORDER_ID
                  </span>
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">
                  <span className="flex items-center gap-xs">
                    <Icon name="tableIcon" size={12} className="text-text-secondary" />
                    ORDER_STATUS
                  </span>
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">
                  <span className="flex items-center gap-xs">
                    <Icon name="tableIcon" size={12} className="text-text-secondary" />
                    CATEGORY
                  </span>
                </th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">
                  <span className="flex items-center gap-xs">
                    <Icon name="tableIcon" size={12} className="text-text-secondary" />
                    PRICE
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {FILE_EDITOR_ROWS.map((r, i) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-text-secondary">{i + 1}</td>
                  <td className="px-3 py-2 text-text-primary">{r.orderId}</td>
                  <td className="px-3 py-2 text-text-primary">{r.status}</td>
                  <td className="px-3 py-2 text-text-primary">{r.category}</td>
                  <td className="px-3 py-2 text-text-primary">{r.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-md border-t border-border bg-background-secondary px-3 py-1.5 text-[11px] leading-4 text-text-secondary">
          <div className="flex items-center gap-xs">
            <IconButton aria-label="Download" icon={<Icon name="arrowDownIcon" size={12} />} size="small" tone="neutral" />
            <IconButton aria-label="Scroll down" icon={<Icon name="chevronDownIcon" size={12} />} size="small" tone="neutral" />
          </div>
          <span>65 rows</span>
          <span>|</span>
          <span>0.75 sec runtime</span>
          <div className="flex-1" />
          <span>7/12/2024 11:58:34 AM by kyle.gilbreath@databricks.com on Shared SQL Warehouse</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
// Note: ChatPanel and RightRail are now in GenieCodeSidePanel component.



// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EditorPage() {
  const genieCode = useGenieCode();
  const [activeTabId, setActiveTabId] = React.useState(NOTEBOOK_TABS[0]!.id);
  const [activePanel, setActivePanel] = React.useState<string | null>(genieCode.isOpen ? "sparkle" : null);
  const [panelWidth, setPanelWidth] = React.useState(360);
  const dragStartX = React.useRef<number | null>(null);
  const dragStartWidth = React.useRef<number>(360);

  // Sync top nav Genie Code button → editor panel
  React.useEffect(() => {
    if (genieCode.isOpen && activePanel === null) {
      setActivePanel("sparkle");
    } else if (!genieCode.isOpen && activePanel !== null) {
      setActivePanel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genieCode.isOpen]);

  const handlePanelToggle = (id: string) => {
    const next = activePanel === id ? null : id;
    setActivePanel(next);
    // Keep top nav active state in sync
    if (next !== null) genieCode.open();
    else genieCode.close();
  };

  const handleResizeStart = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartWidth.current = panelWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (dragStartX.current === null) return;
      const delta = dragStartX.current - ev.clientX;
      const next = Math.max(360, Math.min(700, dragStartWidth.current + delta));
      setPanelWidth(next);
    };
    const onMouseUp = () => {
      dragStartX.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [panelWidth]);

  return (
    <main className="flex h-full min-h-0 w-full overflow-hidden">
      {/* Notebook area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TabBar tabs={NOTEBOOK_TABS} activeId={activeTabId} onSelect={setActiveTabId} />
        <NotebookToolbar />

        {activeTabId === "tab-py" ? (
          <FileEditorView />
        ) : (
          <div className="flex min-h-0 flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto flex w-full max-w-[860px] flex-col gap-lg">
              <NotebookCell
                stepNumber={1}
                stepTitle="Understand Table Structure &amp; Sample the Data"
                stepDescription="In this step we will:"
                bullets={[
                  "Inspect the schema of main.gal_oshri.ski_resorts to confirm available columns.",
                  "Pull a small sample (LIMIT 1000) to preview actual values in title and description, so we can determine how to extract bedrooms, country, price, and any revenue-related information.",
                ]}
                code={STEP1_SQL}
                language="sql"
                showResult
                showAcceptReject
                runLabel="Just now"
                runTime="1s"
                highlightedLines={[20]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Genie Code side panel — only when a panel is active */}
      {activePanel !== null && (
        <GenieCodeSidePanel
          onClose={() => { setActivePanel(null); genieCode.close(); }}
          width={panelWidth}
          onResizeStart={handleResizeStart}
          showRightRail
          activeRailItem={activePanel}
          onRailItemToggle={handlePanelToggle}
        />
      )}

      {/* Right rail — always visible when no panel is open */}
      {activePanel === null && (
        <GenieCodeRightRail activeItem={null} onToggle={handlePanelToggle} />
      )}
    </main>
  );
}
