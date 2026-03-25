"use client";

import * as React from "react";

import { Table, TableCell, TableCellContent, TableRow } from "./Table";

type DemoRow = {
  id: string;
  name: string;
  reasonSuggested: string;
  type: string;
  owner: {
    label: string;
    avatarColor: "lemon" | "lime" | "teal" | "turquoise" | "indigo" | "purple" | "pink" | "coral";
  };
};

type SortKey = "reasonSuggested" | "type" | "owner";

export function TableShowcase() {
  const [selectedRow, setSelectedRow] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" } | null>(
    { key: "reasonSuggested", dir: "desc" },
  );

  const rows: DemoRow[] = [
    {
      id: "row-1",
      name: "Supply Chain Optimization",
      reasonSuggested: "View frequently",
      type: "Notebook",
      owner: { label: "Jocelyn Hickcox", avatarColor: "teal" },
    },
    {
      id: "row-2",
      name: "Customer Retention Forecasting (Q1–Q4) — Long Name Example",
      reasonSuggested: "You viewed 2d ago",
      type: "Dashboard",
      owner: { label: "Alexandra Montgomery-Smith", avatarColor: "indigo" },
    },
    {
      id: "row-3",
      name: "Unified Browse: Saved Searches",
      reasonSuggested: "Shared with you",
      type: "Genie space",
      owner: { label: "Avery Nguyen", avatarColor: "pink" },
    },
    {
      id: "row-4",
      name: "Incident Review: Data Quality Regression",
      reasonSuggested: "Suggested based on your work",
      type: "Table",
      owner: { label: "Jordan Patel", avatarColor: "lime" },
    },
    {
      id: "row-5",
      name: "Revenue Dashboard (Executive)",
      reasonSuggested: "You viewed yesterday",
      type: "Dashboard",
      owner: { label: "Morgan Lee", avatarColor: "coral" },
    },
  ];

  return (
    <div className="flex flex-col gap-sm">
      <p className="text-paragraph text-text-secondary">
        Selected row:{" "}
        <span className="text-text-primary">{selectedRow ?? "none"}</span>
      </p>
      <p className="text-paragraph text-text-secondary">
        Note: compact row actions (overflow only) activates after 2+ columns are hidden.
      </p>

      <div className="w-full overflow-hidden rounded-md bg-background-primary">
        <Table>
          <TableRow state="Header">
            <TableCell>
              <TableCellContent type="Header">Name</TableCellContent>
            </TableCell>
            <TableCell data-collapse-priority={10}>
              <TableCellContent
                type="Header"
                sortable
                sortDirection={sort?.key === "reasonSuggested" ? sort.dir : undefined}
                onSortChange={(next) => setSort({ key: "reasonSuggested", dir: next })}
              >
                Reason suggested
              </TableCellContent>
            </TableCell>
            <TableCell data-collapse-priority={20}>
              <TableCellContent
                type="Header"
                sortable
                sortDirection={sort?.key === "type" ? sort.dir : undefined}
                onSortChange={(next) => setSort({ key: "type", dir: next })}
              >
                Type
              </TableCellContent>
            </TableCell>
            <TableCell data-collapse-priority={30}>
              <TableCellContent
                type="Header"
                sortable
                sortDirection={sort?.key === "owner" ? sort.dir : undefined}
                onSortChange={(next) => setSort({ key: "owner", dir: next })}
              >
                Owner
              </TableCellContent>
            </TableCell>
            <TableCell data-collapse-priority={0}>
              <TableCellContent type="Actions" />
            </TableCell>
          </TableRow>

          {rows.map((r) => (
            <TableRow
              key={r.id}
              onNavigate={() => setSelectedRow(`${r.id} (navigate)`)}
              onSelect={() => setSelectedRow(r.id)}
            >
              <TableCell>
                <TableCellContent type="Name">{r.name}</TableCellContent>
              </TableCell>
              <TableCell>
                <TableCellContent type="Text">{r.reasonSuggested}</TableCellContent>
              </TableCell>
              <TableCell>
                <TableCellContent type="Text">
                  {r.type}
                </TableCellContent>
              </TableCell>
              <TableCell>
                <TableCellContent type="User" mode="Avatar" avatarColor={r.owner.avatarColor}>
                  {r.owner.label}
                </TableCellContent>
              </TableCell>
              <TableCell>
                <TableCellContent type="Actions" />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </div>
  );
}

