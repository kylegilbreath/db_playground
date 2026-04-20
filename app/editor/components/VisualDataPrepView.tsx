"use client";

import * as React from "react";
import { Icon } from "@/components/icons";
import { IconButton } from "@/components/IconButton";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NodeType = "source" | "filter" | "join" | "select" | "aggregate" | "output";

interface DagNode {
  id: string;
  type: NodeType;
  label: string;
  subtitle?: string;
  x: number;
  y: number;
}

interface DagEdge {
  from: string;
  to: string;
}

// ---------------------------------------------------------------------------
// Static graph data
// ---------------------------------------------------------------------------

const INITIAL_NODES: DagNode[] = [
  { id: "source-1", type: "source", label: "ski_resorts", subtitle: "main.gal_oshri", x: 60, y: 180 },
  { id: "source-2", type: "source", label: "lift_tickets", subtitle: "main.gal_oshri", x: 60, y: 340 },
  { id: "filter-1", type: "filter", label: "Filter", subtitle: "season = 'winter'", x: 280, y: 180 },
  { id: "join-1", type: "join", label: "Join", subtitle: "resort_id = resort_id", x: 500, y: 260 },
  { id: "select-1", type: "select", label: "Select columns", subtitle: "8 columns kept", x: 720, y: 260 },
  { id: "agg-1", type: "aggregate", label: "Aggregate", subtitle: "Group by resort", x: 940, y: 260 },
  { id: "output-1", type: "output", label: "Output table", subtitle: "resort_summary", x: 1160, y: 260 },
];

const EDGES: DagEdge[] = [
  { from: "source-1", to: "filter-1" },
  { from: "filter-1", to: "join-1" },
  { from: "source-2", to: "join-1" },
  { from: "join-1", to: "select-1" },
  { from: "select-1", to: "agg-1" },
  { from: "agg-1", to: "output-1" },
];

// ---------------------------------------------------------------------------
// Node config panels (one per type)
// ---------------------------------------------------------------------------

const NODE_COLORS: Record<NodeType, { bg: string; border: string; icon: string; badge: string }> = {
  source:    { bg: "bg-blue-50",    border: "border-blue-300",   icon: "tableIcon",          badge: "bg-blue-500" },
  filter:    { bg: "bg-yellow-50",  border: "border-yellow-300", icon: "filterIcon",         badge: "bg-yellow-500" },
  join:      { bg: "bg-purple-50",  border: "border-purple-300", icon: "ArrowsConnectIcon",  badge: "bg-purple-500" },
  select:    { bg: "bg-green-50",   border: "border-green-300",  icon: "ColumnsIcon",        badge: "bg-green-500" },
  aggregate: { bg: "bg-orange-50",  border: "border-orange-300", icon: "NumbersIcon",        badge: "bg-orange-500" },
  output:    { bg: "bg-neutral-50", border: "border-neutral-300",icon: "databaseOutlinedIcon",badge: "bg-neutral-500" },
};

const NODE_ICON: Record<NodeType, string> = {
  source:    "tableIcon",
  filter:    "filterIcon",
  join:      "ArrowsConnectIcon",
  select:    "ColumnsIcon",
  aggregate: "NumbersIcon",
  output:    "databaseOutlinedIcon",
};

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;

// ---------------------------------------------------------------------------
// Preview table data
// ---------------------------------------------------------------------------

const PREVIEW_COLUMNS = ["resort_id", "resort_name", "country", "season", "avg_ticket_price", "lift_count", "snowfall_cm", "revenue"];
const PREVIEW_ROWS = [
  ["1", "Alpine Heights", "Switzerland", "winter", "$142.00", "24", "310", "$2.1M"],
  ["2", "Powder Bowl", "USA", "winter", "$118.00", "18", "280", "$1.7M"],
  ["3", "Mont Blanc Express", "France", "winter", "$165.00", "32", "420", "$3.2M"],
  ["4", "Sakura Slopes", "Japan", "winter", "$98.00", "14", "195", "$0.9M"],
  ["5", "Rocky Peak", "Canada", "winter", "$131.00", "21", "355", "$2.4M"],
];

// ---------------------------------------------------------------------------
// Config panel content per node type
// ---------------------------------------------------------------------------

function SourceConfig({ node }: { node: DagNode }) {
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Table">
        <ConfigField label="Catalog" value="main" />
        <ConfigField label="Schema" value="gal_oshri" />
        <ConfigField label="Table" value={node.label} />
      </ConfigSection>
      <ConfigSection title="Options">
        <ConfigToggle label="Include all columns" checked />
        <ConfigToggle label="Infer schema" checked />
        <ConfigField label="Row limit" value="10,000" />
      </ConfigSection>
    </div>
  );
}

function FilterConfig() {
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Conditions">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-xs rounded-sm border border-border bg-background-secondary px-sm py-xs text-hint">
            <span className="font-medium text-text-primary">season</span>
            <span className="text-text-secondary">=</span>
            <span className="text-blue-600">&apos;winter&apos;</span>
            <div className="flex-1" />
            <button type="button" className="text-text-placeholder hover:text-text-secondary">
              <Icon name="closeSmall" size={12} />
            </button>
          </div>
          <button type="button" className="flex items-center gap-xs text-hint text-action-tertiary-text-default hover:underline">
            <Icon name="plusIcon" size={12} />
            Add condition
          </button>
        </div>
      </ConfigSection>
      <ConfigSection title="Logic">
        <div className="flex gap-xs">
          {["AND", "OR"].map((op) => (
            <button
              key={op}
              type="button"
              className={cx(
                "rounded-sm border px-sm py-xs text-hint font-medium",
                op === "AND"
                  ? "border-action-default-border-focus bg-action-default-background-press text-text-primary"
                  : "border-border bg-background-primary text-text-secondary hover:bg-background-secondary",
              )}
            >
              {op}
            </button>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

function JoinConfig() {
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Join type">
        <div className="grid grid-cols-2 gap-xs">
          {["Inner", "Left", "Right", "Full outer"].map((t) => (
            <button
              key={t}
              type="button"
              className={cx(
                "rounded-sm border px-sm py-xs text-hint text-left",
                t === "Inner"
                  ? "border-action-default-border-focus bg-action-default-background-press text-text-primary font-medium"
                  : "border-border text-text-secondary hover:bg-background-secondary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </ConfigSection>
      <ConfigSection title="Join keys">
        <div className="flex items-center gap-xs">
          <div className="flex-1 rounded-sm border border-border bg-background-secondary px-sm py-xs text-hint text-text-primary">resort_id</div>
          <Icon name="arrowRightIcon" size={12} className="shrink-0 text-text-secondary" />
          <div className="flex-1 rounded-sm border border-border bg-background-secondary px-sm py-xs text-hint text-text-primary">resort_id</div>
        </div>
        <button type="button" className="flex items-center gap-xs text-hint text-action-tertiary-text-default hover:underline">
          <Icon name="plusIcon" size={12} />
          Add key pair
        </button>
      </ConfigSection>
    </div>
  );
}

function SelectConfig() {
  const cols = ["resort_id", "resort_name", "country", "season", "avg_ticket_price", "lift_count", "snowfall_cm", "revenue"];
  const [checked, setChecked] = React.useState<Set<string>>(new Set(cols));
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Columns">
        <div className="flex flex-col gap-xs">
          {cols.map((col) => (
            <label key={col} className="flex cursor-pointer items-center gap-xs">
              <input
                type="checkbox"
                checked={checked.has(col)}
                onChange={() => {
                  const next = new Set(checked);
                  if (next.has(col)) next.delete(col);
                  else next.add(col);
                  setChecked(next);
                }}
                className="accent-blue-600"
              />
              <span className="text-hint text-text-primary">{col}</span>
            </label>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

function AggregateConfig() {
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Group by">
        <div className="flex flex-wrap gap-xs">
          {["resort_id", "resort_name", "country"].map((col) => (
            <span key={col} className="flex items-center gap-xs rounded-full border border-border bg-background-secondary px-sm py-0.5 text-hint text-text-primary">
              {col}
              <button type="button" className="text-text-placeholder hover:text-text-secondary"><Icon name="closeSmall" size={10} /></button>
            </span>
          ))}
        </div>
      </ConfigSection>
      <ConfigSection title="Aggregations">
        <div className="flex flex-col gap-xs">
          {[
            { col: "avg_ticket_price", fn: "AVG" },
            { col: "revenue", fn: "SUM" },
            { col: "lift_count", fn: "MAX" },
          ].map((agg) => (
            <div key={agg.col} className="flex items-center gap-xs">
              <span className="w-10 rounded-sm bg-blue-50 px-xs py-0.5 text-center text-hint font-medium text-blue-700">{agg.fn}</span>
              <span className="text-hint text-text-primary">{agg.col}</span>
            </div>
          ))}
          <button type="button" className="flex items-center gap-xs text-hint text-action-tertiary-text-default hover:underline">
            <Icon name="plusIcon" size={12} />
            Add aggregation
          </button>
        </div>
      </ConfigSection>
    </div>
  );
}

function OutputConfig({ node }: { node: DagNode }) {
  return (
    <div className="flex flex-col gap-md">
      <ConfigSection title="Destination">
        <ConfigField label="Catalog" value="main" />
        <ConfigField label="Schema" value="gal_oshri" />
        <ConfigField label="Table name" value={node.subtitle ?? "output_table"} editable />
      </ConfigSection>
      <ConfigSection title="Write mode">
        <div className="flex flex-col gap-xs">
          {["Overwrite", "Append", "Merge (upsert)"].map((mode) => (
            <label key={mode} className="flex cursor-pointer items-center gap-xs">
              <input type="radio" name="write-mode" defaultChecked={mode === "Overwrite"} className="accent-blue-600" />
              <span className="text-hint text-text-primary">{mode}</span>
            </label>
          ))}
        </div>
      </ConfigSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Config panel primitives
// ---------------------------------------------------------------------------

function ConfigSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-hint font-semibold uppercase tracking-wide text-text-secondary">{title}</span>
      {children}
    </div>
  );
}

function ConfigField({ label, value, editable }: { label: string; value: string; editable?: boolean }) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-hint text-text-secondary">{label}</span>
      {editable ? (
        <input
          type="text"
          defaultValue={value}
          className="rounded-sm border border-border bg-background-primary px-sm py-xs text-hint text-text-primary focus:border-action-default-border-focus focus:outline-none"
        />
      ) : (
        <span className="rounded-sm border border-border bg-background-secondary px-sm py-xs text-hint text-text-primary">{value}</span>
      )}
    </div>
  );
}

function ConfigToggle({ label, checked }: { label: string; checked?: boolean }) {
  const [on, setOn] = React.useState(checked ?? false);
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-hint text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => setOn(!on)}
        className={cx(
          "relative inline-flex h-4 w-7 rounded-full transition-colors",
          on ? "bg-blue-600" : "bg-neutral-300",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform",
            on ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Node component
// ---------------------------------------------------------------------------

function DagNodeCard({
  node,
  selected,
  onClick,
}: {
  node: DagNode;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = NODE_COLORS[node.type];
  const icon = NODE_ICON[node.type];

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      {/* Shadow */}
      <rect
        x={2}
        y={3}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={6}
        fill="rgba(0,0,0,0.06)"
      />
      {/* Card bg */}
      <rect
        x={0}
        y={0}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={6}
        className={cx(
          selected ? "fill-white stroke-blue-500" : "fill-white stroke-neutral-200",
        )}
        strokeWidth={selected ? 2 : 1}
      />
      {/* Left accent bar */}
      <rect
        x={0}
        y={0}
        width={4}
        height={NODE_HEIGHT}
        rx={4}
        className={cx(
          node.type === "source"    ? "fill-blue-500" :
          node.type === "filter"    ? "fill-yellow-500" :
          node.type === "join"      ? "fill-purple-500" :
          node.type === "select"    ? "fill-green-500" :
          node.type === "aggregate" ? "fill-orange-500" :
          "fill-neutral-400",
        )}
      />
      {/* Icon area (foreignObject for React Icon) */}
      <foreignObject x={12} y={12} width={24} height={24}>
        <div
          // @ts-expect-error xmlns needed for SVG foreignObject
          xmlns="http://www.w3.org/1999/xhtml"
          className={cx(
            "flex h-6 w-6 items-center justify-center rounded-sm text-white",
            node.type === "source"    ? "bg-blue-500" :
            node.type === "filter"    ? "bg-yellow-500" :
            node.type === "join"      ? "bg-purple-500" :
            node.type === "select"    ? "bg-green-500" :
            node.type === "aggregate" ? "bg-orange-500" :
            "bg-neutral-400",
          )}
        >
          <Icon name={icon} size={12} />
        </div>
      </foreignObject>
      {/* Text */}
      <text x={44} y={24} fontSize={12} fontWeight={600} fill="#1a1a1a" dominantBaseline="middle">{node.label}</text>
      <text x={44} y={40} fontSize={11} fill="#6f6f6f" dominantBaseline="middle">{node.subtitle}</text>
      {/* Connection port — right */}
      <circle cx={NODE_WIDTH} cy={NODE_HEIGHT / 2} r={4} fill="white" stroke="#bbb" strokeWidth={1} />
      {/* Connection port — left */}
      <circle cx={0} cy={NODE_HEIGHT / 2} r={4} fill="white" stroke="#bbb" strokeWidth={1} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Edge (curved connector)
// ---------------------------------------------------------------------------

function DagEdgePath({ nodes, edge }: { nodes: DagNode[]; edge: DagEdge }) {
  const from = nodes.find((n) => n.id === edge.from);
  const to = nodes.find((n) => n.id === edge.to);
  if (!from || !to) return null;

  const x1 = from.x + NODE_WIDTH;
  const y1 = from.y + NODE_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + NODE_HEIGHT / 2;
  const cx1 = x1 + (x2 - x1) * 0.5;
  const cy1 = y1;
  const cx2 = x1 + (x2 - x1) * 0.5;
  const cy2 = y2;

  return (
    <path
      d={`M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
      fill="none"
      stroke="#d1d5db"
      strokeWidth={2}
      strokeLinecap="round"
    />
  );
}

// ---------------------------------------------------------------------------
// Config panel (right side)
// ---------------------------------------------------------------------------

function NodeConfigPanel({ node, onClose }: { node: DagNode; onClose: () => void }) {
  const typeLabel: Record<NodeType, string> = {
    source:    "Data source",
    filter:    "Filter rows",
    join:      "Join",
    select:    "Select columns",
    aggregate: "Aggregate",
    output:    "Output",
  };

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-background-primary">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-xs border-b border-border px-md py-sm">
        <div
          className={cx(
            "flex h-6 w-6 items-center justify-center rounded-sm text-white",
            node.type === "source"    ? "bg-blue-500" :
            node.type === "filter"    ? "bg-yellow-500" :
            node.type === "join"      ? "bg-purple-500" :
            node.type === "select"    ? "bg-green-500" :
            node.type === "aggregate" ? "bg-orange-500" :
            "bg-neutral-400",
          )}
        >
          <Icon name={NODE_ICON[node.type]} size={12} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-hint font-semibold text-text-primary">{node.label}</span>
          <span className="text-hint text-text-secondary">{typeLabel[node.type]}</span>
        </div>
        <IconButton icon={<Icon name="closeSmall" size={14} />} aria-label="Close" size="small" onClick={onClose} />
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-md">
        {node.type === "source"    && <SourceConfig node={node} />}
        {node.type === "filter"    && <FilterConfig />}
        {node.type === "join"      && <JoinConfig />}
        {node.type === "select"    && <SelectConfig />}
        {node.type === "aggregate" && <AggregateConfig />}
        {node.type === "output"    && <OutputConfig node={node} />}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center gap-xs border-t border-border px-md py-sm">
        <button
          type="button"
          className="flex-1 rounded-sm border border-border bg-background-primary px-sm py-xs text-hint font-medium text-text-primary hover:bg-background-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          className="flex-1 rounded-sm bg-action-primary-background-default px-sm py-xs text-hint font-medium text-action-primary-text-default hover:bg-action-primary-background-hover"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table preview
// ---------------------------------------------------------------------------

function PreviewPanel({ node, onClose }: { node: DagNode; onClose: () => void }) {
  return (
    <div className="flex h-[220px] shrink-0 flex-col border-t border-border bg-background-primary">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-sm border-b border-border px-md py-xs">
        <span className="text-hint font-semibold text-text-primary">Preview — {node.label}</span>
        <span className="rounded-full bg-background-secondary px-xs text-hint text-text-secondary">
          {PREVIEW_ROWS.length} rows
        </span>
        <div className="flex-1" />
        <IconButton icon={<Icon name="closeSmall" size={14} />} aria-label="Close preview" size="small" onClick={onClose} />
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-hint">
          <thead className="sticky top-0 bg-background-secondary">
            <tr>
              {PREVIEW_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="border-b border-border px-sm py-xs text-left font-medium text-text-secondary whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PREVIEW_ROWS.map((row, i) => (
              <tr key={i} className="hover:bg-background-secondary">
                {row.map((cell, j) => (
                  <td key={j} className="border-b border-border px-sm py-xs text-text-primary whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

const NODE_TYPES_PALETTE: { type: NodeType; label: string }[] = [
  { type: "source",    label: "Source" },
  { type: "filter",    label: "Filter" },
  { type: "join",      label: "Join" },
  { type: "select",    label: "Select" },
  { type: "aggregate", label: "Aggregate" },
  { type: "output",    label: "Output" },
];

function DagToolbar() {
  return (
    <div className="flex shrink-0 items-center gap-sm border-b border-border bg-background-primary px-md py-xs">
      {/* Add node palette */}
      <span className="text-hint text-text-secondary">Add step:</span>
      <div className="flex items-center gap-xs">
        {NODE_TYPES_PALETTE.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            className={cx(
              "flex items-center gap-xs rounded-sm border px-sm py-0.5 text-hint font-medium hover:bg-background-secondary",
              type === "source"    ? "border-blue-200 text-blue-700 hover:bg-blue-50" :
              type === "filter"    ? "border-yellow-200 text-yellow-700 hover:bg-yellow-50" :
              type === "join"      ? "border-purple-200 text-purple-700 hover:bg-purple-50" :
              type === "select"    ? "border-green-200 text-green-700 hover:bg-green-50" :
              type === "aggregate" ? "border-orange-200 text-orange-700 hover:bg-orange-50" :
              "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
            )}
          >
            <Icon name={NODE_ICON[type]} size={11} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Zoom / run controls */}
      <div className="flex items-center gap-xs">
        <IconButton icon={<Icon name="zoomOutIcon" size={14} />} aria-label="Zoom out" size="small" />
        <span className="text-hint text-text-secondary">100%</span>
        <IconButton icon={<Icon name="zoomInIcon" size={14} />} aria-label="Zoom in" size="small" />
      </div>
      <div className="h-4 w-px bg-border" />
      <button
        type="button"
        className="flex items-center gap-xs rounded-sm bg-action-primary-background-default px-sm py-xs text-hint font-medium text-action-primary-text-default hover:bg-action-primary-background-hover"
      >
        <Icon name="playIcon" size={12} />
        Run pipeline
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 520;

export function VisualDataPrepView() {
  const [nodes] = React.useState<DagNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = React.useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
  const previewNode = nodes.find((n) => n.id === previewNodeId) ?? null;

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setPreviewNodeId(id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Canvas + config panel row */}
      <div className="flex min-h-0 flex-1">
        {/* Canvas */}
        <div className="relative min-h-0 flex-1 overflow-auto bg-[#f9f9fb]"
          style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        >
          <svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute top-0 left-0"
          >
            {/* Edges */}
            <g>
              {EDGES.map((edge) => (
                <DagEdgePath key={`${edge.from}-${edge.to}`} nodes={nodes} edge={edge} />
              ))}
            </g>
            {/* Nodes */}
            <g>
              {nodes.map((node) => (
                <DagNodeCard
                  key={node.id}
                  node={node}
                  selected={selectedNodeId === node.id}
                  onClick={() => handleNodeClick(node.id)}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Config panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Bottom preview panel */}
      {previewNode && (
        <PreviewPanel
          node={previewNode}
          onClose={() => setPreviewNodeId(null)}
        />
      )}
    </div>
  );
}
