"use client";

import * as React from "react";

import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type TableProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  disableResponsiveHiding?: boolean;
};

export type TableRowState = "Default" | "Header";

const TableResponsiveContext = React.createContext<{ compactActions: boolean } | null>(null);

function useTableResponsiveContext() {
  return React.useContext(TableResponsiveContext);
}

type TableRowLikeElement = React.ReactElement<{ state?: TableRowState; children?: React.ReactNode }>;

function isTableRowElement(node: React.ReactNode): node is TableRowLikeElement {
  if (!React.isValidElement(node)) return false;
  const t = node.type as unknown;
  if (typeof t === "string") return false;
  return (t as { displayName?: string }).displayName === "TableRow";
}

function getTableRowElements(children: React.ReactNode) {
  const all = React.Children.toArray(children);
  const headerRows: TableRowLikeElement[] = [];
  const bodyRows: React.ReactNode[] = [];

  for (const child of all) {
    if (isTableRowElement(child)) {
      const state = child.props.state;
      if (state === "Header") headerRows.push(child);
      else bodyRows.push(child);
    } else {
      bodyRows.push(child);
    }
  }

  return { headerRows, bodyRows };
}

function getPinnedColumnIndices(row: React.ReactElement | undefined) {
  // Left-most column is the primary identifier and must remain visible.
  const pinned = new Set<number>([0]);
  if (!row) return pinned;

  const cells = React.Children.toArray((row.props as { children?: React.ReactNode }).children);
  // Actions column is always the last cell in the row.
  if (cells.length > 0) pinned.add(cells.length - 1);

  return pinned;
}

function getDefaultColumnWidthPx(
  idx: number,
  actionsIdx: number | null,
  compactActions: boolean,
) {
  if (idx === 0) return undefined; // primary identifier column is flexible

  // Actions column: sized to fit 4 small icon buttons + gaps + cell padding.
  // - IconButton small is 24px wide
  // - 4 buttons + 3 gaps (gap-sm = 8px) = 96 + 24 = 120px
  // - Cell inner padding is px-md (16px) on both sides = +32px
  // Total ~152px.
  //
  // In compact mode, the Actions cell only shows the overflow button, so shrink to
  // fit 1 small icon button + padding (24 + 32 = 56px).
  if (actionsIdx !== null && idx === actionsIdx) return compactActions ? 56 : 152;

  // Default fixed columns use the Figma `Cell` width.
  return 234;
}

function getHideOrderFromHeaderRow(row: React.ReactElement | undefined) {
  if (!row) return { colCount: 0, hideOrder: [] as number[] };
  const cells = React.Children.toArray((row.props as { children?: React.ReactNode }).children);
  const colCount = cells.length;
  if (colCount <= 1) return { colCount, hideOrder: [] as number[] };

  // Determine pinned columns (never hidden): Name (index 0) and Actions column (if present).
  const pinned = getPinnedColumnIndices(row);

  const indices = Array.from({ length: colCount }, (_, i) => i).filter((i) => !pinned.has(i));

  // If any header cell specifies a priority, use it. Otherwise default to right-to-left.
  const priorities = indices.map((idx) => {
    const el = cells[idx];
    if (!React.isValidElement(el)) return { idx, prio: null as number | null };
    const raw = (el.props as { "data-collapse-priority"?: unknown })["data-collapse-priority"];
    const parsed =
      raw === undefined || raw === null || raw === "" ? null : Number(raw);
    return { idx, prio: Number.isFinite(parsed) ? (parsed as number) : null };
  });

  const anyPriority = priorities.some((p) => p.prio !== null);
  if (!anyPriority) {
    // Deterministic default: hide from right-most to left-most (excluding pinned cols).
    return { colCount, hideOrder: indices.sort((a, b) => b - a) };
  }

  // Deterministic: larger priority hides earlier; tie-break by column index (right-most first).
  const hideOrder = priorities
    .map((p) => ({ idx: p.idx, prio: p.prio ?? 0 }))
    .sort((a, b) => (b.prio - a.prio) || (b.idx - a.idx))
    .map((p) => p.idx);

  return { colCount, hideOrder };
}

function getColumnWidthsFromHeaderRow(row: React.ReactElement | undefined, colCount: number) {
  const widths: Array<number | undefined> = Array.from({ length: colCount }, () => undefined);
  if (!row) return widths;
  const cells = React.Children.toArray((row.props as { children?: React.ReactNode }).children);
  for (let i = 0; i < Math.min(colCount, cells.length); i += 1) {
    const el = cells[i];
    if (!React.isValidElement(el)) continue;
    const raw = (el.props as { "data-col-width"?: unknown })["data-col-width"];
    const parsed = raw === undefined || raw === null || raw === "" ? NaN : Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) widths[i] = parsed;
  }
  return widths;
}

function filterCells(children: React.ReactNode, hidden: Set<number>) {
  const cells = React.Children.toArray(children);
  return cells.filter((child, idx) => !hidden.has(idx));
}

export function Table({ className, children, disableResponsiveHiding, ...rest }: TableProps) {
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const tableRef = React.useRef<HTMLTableElement | null>(null);

  const { headerRows, bodyRows } = React.useMemo(() => getTableRowElements(children), [children]);
  const firstBodyRow = React.useMemo(() => {
    for (const node of bodyRows) {
      if (!isTableRowElement(node)) continue;
      return node;
    }
    return undefined;
  }, [bodyRows]);

  const { colCount, hideOrder } = React.useMemo(
    () => getHideOrderFromHeaderRow(headerRows[0] ?? firstBodyRow),
    [headerRows, firstBodyRow],
  );

  const actionsIdx = colCount > 0 ? colCount - 1 : null;

  const colWidths = React.useMemo(
    () => getColumnWidthsFromHeaderRow(headerRows[0] ?? firstBodyRow, colCount),
    [headerRows, firstBodyRow, colCount],
  );

  const [hiddenCount, setHiddenCount] = React.useState(0);
  const [needsScroll, setNeedsScroll] = React.useState(false);
  const [resizeTick, setResizeTick] = React.useState(0);

  const compactActions = hiddenCount >= 2;

  // React to container resizes: if width increases, try to restore columns.
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let prevWidth = el.getBoundingClientRect().width;
    const ro = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? prevWidth;
      if (nextWidth > prevWidth + 0.5) {
        // On growth, reset and re-measure from full visibility.
        setHiddenCount(0);
      }
      // Ensure we re-run overflow measurement on shrink (and any meaningful resize).
      if (Math.abs(nextWidth - prevWidth) > 0.5) setResizeTick((t) => t + 1);
      prevWidth = nextWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hidden = React.useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < hiddenCount; i += 1) set.add(hideOrder[i]!);
    return set;
  }, [hiddenCount, hideOrder]);

  const visibleIndices = React.useMemo(() => {
    return Array.from({ length: colCount }, (_, i) => i).filter((i) => !hidden.has(i));
  }, [colCount, hidden]);

  const minTableWidthPx = React.useMemo(() => {
    // Key behavior: without a min-width, the browser will shrink the primary (left) column
    // to avoid overflow, so our overflow detector never triggers and nothing hides.
    // We force overflow once truncation/compression isn't enough by providing a baseline min-width.
    //
    // - Column 0 (primary identifier) gets a small min width (internal constant).
    // - Columns 1..N default to the Figma cell width (234px), overridable via `data-col-width`.
    const primaryMin = 220;
    let sum = primaryMin;
    for (const idx of visibleIndices) {
      if (idx === 0) continue;
      const fallback = getDefaultColumnWidthPx(idx, actionsIdx, compactActions);
      sum += colWidths[idx] ?? fallback ?? 234;
    }
    return sum;
  }, [visibleIndices, colWidths, actionsIdx, compactActions]);

  // Measure overflow and progressively hide columns (deterministic) until it fits.
  React.useLayoutEffect(() => {
    if (disableResponsiveHiding) return;

    const wrapper = wrapperRef.current;
    const table = tableRef.current;
    if (!wrapper || !table) return;

    const overflow = table.scrollWidth > wrapper.clientWidth + 1;
    if (!overflow) {
      if (needsScroll) setNeedsScroll(false);
      return;
    }

    if (hiddenCount < hideOrder.length) {
      setHiddenCount((c) => c + 1);
      return;
    }

    // Last resort: allow horizontal scrolling.
    if (!needsScroll) setNeedsScroll(true);
  }, [hiddenCount, hideOrder.length, needsScroll, resizeTick]);

  const filteredHeaderRows = React.useMemo(() => {
    return headerRows.map((row) => {
      return React.cloneElement(row, undefined, filterCells(row.props.children, hidden));
    });
  }, [headerRows, hidden]);

  const filteredBodyRows = React.useMemo(() => {
    return bodyRows.map((row) => {
      if (!isTableRowElement(row)) return row;
      return React.cloneElement(row, undefined, filterCells(row.props.children, hidden));
    });
  }, [bodyRows, hidden]);

  return (
    <TableResponsiveContext.Provider value={{ compactActions }}>
      <div
        {...rest}
        ref={wrapperRef}
        className={cx(
          "w-full",
          // Only allow horizontal scrolling as a last resort.
          needsScroll && "overflow-x-auto",
          className,
        )}
      >
        <table
          ref={tableRef}
          className={cx(
            "w-full table-fixed border-collapse",
            // Row separators: every row gets a bottom border, except the last body row.
            "[&_tr]:border-b [&_tr]:border-border [&_tbody_tr:last-child]:border-b-0",
          )}
          style={{ minWidth: `${minTableWidthPx}px` }}
        >
          {colCount > 0 ? (
            <colgroup>
              {visibleIndices.map((originalIdx) => {
                if (originalIdx === 0) return <col key={originalIdx} />;
                const fallback = getDefaultColumnWidthPx(originalIdx, actionsIdx, compactActions);
                const px = colWidths[originalIdx] ?? fallback ?? 234;
                return <col key={originalIdx} style={{ width: `${px}px` }} />;
              })}
            </colgroup>
          ) : null}
          <thead>{filteredHeaderRows}</thead>
          <tbody>{filteredBodyRows}</tbody>
        </table>
      </div>
    </TableResponsiveContext.Provider>
  );
}

export type TableRowProps = Omit<
  React.HTMLAttributes<HTMLTableRowElement>,
  "children" | "onClick" | "onDoubleClick"
> & {
  /** Matches Figma `Row/State`. Hover is an interaction state; header is explicit. */
  state?: TableRowState;
  children: React.ReactNode;
  /** Single click selection callback. */
  onSelect?: () => void;
  /** Double click navigation callback. */
  onNavigate?: () => void;
};

const TableRowContext = React.createContext<{ isHeader: boolean } | null>(null);

function useTableRowContext() {
  return React.useContext(TableRowContext);
}

export function TableRow({
  state = "Default",
  children,
  onSelect,
  onNavigate,
  className,
  ...rest
}: TableRowProps) {
  const clickTimer = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
    };
  }, []);

  const interactive = state === "Default" && (onSelect || onNavigate);

  return (
    <TableRowContext.Provider value={{ isHeader: state === "Header" }}>
      <tr
        {...rest}
        className={cx(
          "group",
          state === "Default" && "hover:bg-background-secondary",
          interactive && "cursor-pointer select-none",
          className,
        )}
        onClick={(e) => {
          // If the event was prevented by a child control (e.g. action buttons), do nothing.
          if (e.defaultPrevented) return;
          if (state !== "Default") return;
          if (!onSelect) return;

          // Defer single-click so a double-click can cancel it.
          if (clickTimer.current !== null) window.clearTimeout(clickTimer.current);
          clickTimer.current = window.setTimeout(() => {
            clickTimer.current = null;
            onSelect();
          }, 200);
        }}
        onDoubleClick={(e) => {
          if (e.defaultPrevented) return;
          if (state !== "Default") return;
          if (!onNavigate) return;

          if (clickTimer.current !== null) {
            window.clearTimeout(clickTimer.current);
            clickTimer.current = null;
          }
          onNavigate();
        }}
      >
        {children}
      </tr>
    </TableRowContext.Provider>
  );
}

export type TableCellProps = React.HTMLAttributes<HTMLTableCellElement> & {
  children: React.ReactNode;
};

export function TableCell({ className, children, ...rest }: TableCellProps) {
  // Figma `Cell`: 40px height, 16px horizontal padding.
  const rowCtx = useTableRowContext();
  const isHeader = rowCtx?.isHeader ?? false;

  const cellClassName = cx(
    // Semantic table: allow columns to compress (truncate) before hiding.
    // Note: browsers default `th { text-align: center; }`, so force left alignment for headers.
    "p-0 align-middle text-left",
    className,
  );

  const inner =
    // Important: use `items-stretch` so child content spans the full cell width;
    // otherwise children size to content and `truncate` never gets a constrained width.
    "flex h-10 min-w-0 flex-col items-stretch justify-center px-md";

  if (isHeader) {
    const headerChildren = React.Children.toArray(children);
    const headerContentNode = headerChildren.find((c) => {
      if (!React.isValidElement(c)) return false;
      if (c.type !== TableCellContent) return false;
      return (c.props as TableCellContentProps).type === "Header";
    });

    const headerContent = React.isValidElement(headerContentNode)
      ? (headerContentNode as React.ReactElement<Extract<TableCellContentProps, { type: "Header" }>>)
      : undefined;

    const ariaSort =
      headerContent?.props?.sortDirection === "asc"
        ? ("ascending" as const)
        : headerContent?.props?.sortDirection === "desc"
          ? ("descending" as const)
          : undefined;

    return (
      <th
        {...(rest as Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "children">)}
        className={cellClassName}
        scope="col"
        aria-sort={ariaSort}
      >
        <div className={inner}>{children}</div>
      </th>
    );
  }

  return (
    <td
      {...(rest as Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "children">)}
      className={cellClassName}
    >
      <div className={inner}>{children}</div>
    </td>
  );
}

export type TableCellContentType = "Name" | "User" | "Text" | "Actions" | "Header";
export type UserCellContentMode = "Avatar" | "User" | "Principal" | "Group";
export type AvatarSecondaryColor =
  | "lemon"
  | "lime"
  | "teal"
  | "turquoise"
  | "indigo"
  | "purple"
  | "pink"
  | "coral";

export type TableCellContentProps =
  | {
      type: "Name";
      children: React.ReactNode;
    }
  | {
      type: "Text";
      children: React.ReactNode;
      icon?: boolean;
    }
  | {
      type: "User";
      children: React.ReactNode;
      mode?: UserCellContentMode;
      /** Optional accent color for Avatar mode (used by the demo). */
      avatarColor?: AvatarSecondaryColor;
    }
  | {
      type: "Header";
      children: React.ReactNode;
      /**
       * If true, the column header is interactive and can trigger sorting.
       * Note: sorting state is controlled by the parent; the table only emits actions.
       */
      sortable?: boolean;
      /**
       * Active sort direction for this column.
       * - When undefined, the column is not currently the active sort column (no icon shown).
       */
      sortDirection?: "asc" | "desc";
      /**
       * Called when user clicks the header to sort. Two-state toggle:
       * - undefined -> "asc"
       * - "asc" -> "desc"
       * - "desc" -> "asc"
       */
      onSortChange?: (next: "asc" | "desc") => void;
    }
  | {
      type: "Actions";
    };

export function TableCellContent(props: TableCellContentProps) {
  // These contexts are used only by `type="Actions"`, but hooks must be unconditional.
  const rowCtx = useTableRowContext();
  const responsive = useTableResponsiveContext();
  const isHeader = rowCtx?.isHeader ?? false;
  const compactActions = responsive?.compactActions ?? false;

  const preventRowInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (props.type === "Name") {
    return (
      <div className="flex w-full min-w-0 items-center gap-sm">
        <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
          <Icon name="dashboardIcon" size={16} />
        </span>
        <span className="min-w-0 flex-1 truncate text-paragraph font-medium leading-5 text-text-primary">
          {props.children}
        </span>
      </div>
    );
  }

  if (props.type === "Text") {
    return (
      <div className="flex w-full min-w-0 items-center gap-sm">
        {props.icon ? (
          <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
            <Icon name="databaseOutlinedIcon" size={16} className="text-text-secondary" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-paragraph leading-5 text-text-secondary">
          {props.children}
        </span>
      </div>
    );
  }

  if (props.type === "User") {
    const mode = props.mode ?? "Avatar";
    const label = typeof props.children === "string" ? props.children : "";
    const initial = label.trim().slice(0, 1).toUpperCase() || "U";

    const avatarColorClasses: Record<AvatarSecondaryColor, { bg: string; text: string }> = {
      lemon: { bg: "bg-lemon", text: "text-neutral-800" },
      lime: { bg: "bg-lime", text: "text-white" },
      teal: { bg: "bg-teal", text: "text-white" },
      turquoise: { bg: "bg-turquoise", text: "text-white" },
      indigo: { bg: "bg-indigo", text: "text-white" },
      purple: { bg: "bg-purple", text: "text-white" },
      pink: { bg: "bg-pink", text: "text-white" },
      coral: { bg: "bg-coral", text: "text-white" },
    };

    const avatarClasses =
      mode === "Avatar"
        ? avatarColorClasses[props.avatarColor ?? "purple"]
        : null;

    return (
      <div className="flex w-full min-w-0 items-center gap-sm">
        <span className="inline-flex size-5 items-center justify-center" aria-hidden="true">
          {mode === "Avatar" ? (
            <span
              className={cx(
                "inline-flex size-4 items-center justify-center rounded-full",
                avatarClasses?.bg,
                avatarClasses?.text,
              )}
            >
              <span className="text-[11px] font-semibold leading-none">{initial}</span>
            </span>
          ) : mode === "User" ? (
            <Icon name="userOutlineIcon" size={16} className="text-text-secondary" />
          ) : mode === "Principal" ? (
            <Icon name="gridDashIcon" size={16} className="text-text-secondary" />
          ) : (
            <Icon name="userGroupIcon" size={16} className="text-text-secondary" />
          )}
        </span>
        <div className="min-w-0 flex-1 truncate text-paragraph leading-5 text-text-secondary">
          {props.children}
        </div>
      </div>
    );
  }

  if (props.type === "Header") {
    const isActive = props.sortDirection !== undefined;
    const isInteractive = Boolean(props.sortable && props.onSortChange);
    const SortIconName =
      props.sortDirection === "asc"
        ? "SortAscendingIcon"
        : props.sortDirection === "desc"
          ? "SortDescendingIcon"
          : null;

    return (
      <button
        className={cx(
          "group/header inline-flex w-full min-w-0 items-center gap-xs text-left",
          isInteractive ? "cursor-pointer select-none" : "cursor-default",
          // Keep focus visible for keyboard usage.
          isInteractive &&
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-default-border-focus",
        )}
        onClick={(e) => {
          if (!isInteractive) return;
          e.preventDefault();
          e.stopPropagation();
          const next =
            props.sortDirection === "asc" ? "desc" : "asc";
          props.onSortChange?.(next);
        }}
        type="button"
      >
        <span
          className={cx(
            // Don't make the label grow to fill the cell; let it shrink/truncate as needed so the
            // sort icon stays immediately to its right (with remaining space after the icon).
            "min-w-0 truncate text-paragraph font-semibold leading-5",
            // Only show hover/press affordance if sortable.
            isInteractive
              ? "text-text-primary group-hover/header:text-action-tertiary-text-hover group-active/header:text-action-tertiary-text-press"
              : "text-text-primary",
          )}
        >
          {props.children}
        </span>

        {isActive && SortIconName ? (
          <span
            className="inline-flex size-5 items-center justify-center text-text-secondary"
            aria-hidden="true"
          >
            <Icon name={SortIconName} size={16} />
          </span>
        ) : null}
      </button>
    );
  }

  if (isHeader) {
    return (
      <div className="flex w-full items-center justify-end">
        <IconButton
          aria-label="Columns"
          icon={<Icon name="ColumnsIcon" size={16} />}
          onMouseDown={(e) => e.preventDefault()}
          onClick={preventRowInteraction}
          onDoubleClick={preventRowInteraction}
          size="small"
        />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-end gap-sm">
      {!compactActions ? (
        <>
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <IconButton
              aria-label="Favorite"
              icon={<Icon name="starIcon" size={16} />}
              onMouseDown={(e) => e.preventDefault()}
              onClick={preventRowInteraction}
              onDoubleClick={preventRowInteraction}
              size="small"
            />
          </span>
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <IconButton
              aria-label="Share"
              icon={<Icon name="userGroupIcon" size={16} />}
              onMouseDown={(e) => e.preventDefault()}
              onClick={preventRowInteraction}
              onDoubleClick={preventRowInteraction}
              size="small"
            />
          </span>
          <span className="opacity-0 transition-opacity group-hover:opacity-100">
            <IconButton
              aria-label="Open in new window"
              icon={<Icon name="newWindowIcon" size={16} />}
              onMouseDown={(e) => e.preventDefault()}
              onClick={preventRowInteraction}
              onDoubleClick={preventRowInteraction}
              size="small"
            />
          </span>
        </>
      ) : null}
      <IconButton
        aria-label="More"
        icon={<Icon name="overflowIcon" size={16} />}
        onMouseDown={(e) => {
          // Prevent stealing focus/click from the row.
          e.preventDefault();
        }}
        onClick={preventRowInteraction}
        onDoubleClick={preventRowInteraction}
        size="small"
      />
    </div>
  );
}

TableRow.displayName = "TableRow";

