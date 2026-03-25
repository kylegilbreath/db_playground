"use client";

import * as React from "react";

import { IconButton } from "@/components/IconButton";
import { TertiaryButton } from "@/components/TertiaryButton";
import { Icon } from "@/components/icons";

import Prism from "prismjs";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type CodeBlockMenuBarProps = {
  label?: string;
  languageLabel?: string;
  showLabel?: boolean;
  showCopy?: boolean;
  showOverflow?: boolean;
  showFullscreen?: boolean;
  onCopy?: () => void;
};

function CodeBlockActions({
  showCopy,
  showOverflow,
  showFullscreen,
  onCopy,
}: {
  showCopy: boolean;
  showOverflow: boolean;
  showFullscreen: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="flex items-center gap-xs">
      {showCopy ? (
        <IconButton
          aria-label="Copy"
          icon={<Icon name="copyIcon" size={16} />}
          size="small"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCopy?.();
          }}
        />
      ) : null}
      {showFullscreen ? (
        <IconButton
          aria-label="Full screen"
          icon={<Icon name="fullscreenIcon" size={16} />}
          size="small"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      ) : null}
      {showOverflow ? (
        <IconButton
          aria-label="More"
          icon={<Icon name="overflowIcon" size={16} />}
          size="small"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      ) : null}
    </div>
  );
}

export function CodeBlockMenuBar({
  label = "Example",
  languageLabel = "Language",
  showLabel = true,
  showCopy = true,
  showOverflow = true,
  showFullscreen = false,
  onCopy,
}: CodeBlockMenuBarProps) {
  return (
    <div
      className={cx(
        "flex w-full items-center",
        "bg-background-secondary",
        "border-b border-border",
        "py-xs pl-mid pr-sm",
      )}
    >
      <div className="flex items-center gap-sm text-paragraph leading-5">
        {showLabel ? (
          <span className="font-semibold text-text-primary">{label}</span>
        ) : null}
        <span className="text-text-secondary">{languageLabel}</span>
      </div>

      <div className="flex flex-1" />

      <CodeBlockActions
        showCopy={showCopy}
        showOverflow={showOverflow}
        showFullscreen={showFullscreen}
        onCopy={onCopy}
      />
    </div>
  );
}

export type CodeBlockExpandFooterProps = {
  label: string;
  expanded: boolean;
  onToggle: () => void;
};

export function CodeBlockExpandFooter({ label, expanded, onToggle }: CodeBlockExpandFooterProps) {
  return (
    <div className={cx("w-full bg-background-secondary px-sm pb-sm")}>
      <TertiaryButton
        size="small"
        leadingIcon={
          expanded ? <Icon name="chevronUpIcon" size={16} /> : undefined
        }
        onClick={onToggle}
      >
        {label}
      </TertiaryButton>
    </div>
  );
}

export type CodeBlockTextContainerProps = {
  code: string;
  wrap?: boolean;
  showLineNumbers?: boolean;
  /** If false, horizontal overflow is clipped (no scrolling). */
  allowHorizontalScroll?: boolean;
  /** Total line count for stable gutter width (uses full code, not the visible slice). */
  lineNumberCount?: number;
  /** Optional actions cluster shown in the top-right of the code container. */
  floatingActions?: React.ReactNode;
  highlightedLines?: number[];
  /** Highlight specific word tokens (exact match). */
  highlightedTokens?: string[];
  /** Optional transform hook (formatting, normalization, etc.). */
  transformCode?: (code: string) => string;
  /** Placeholder for highlighting; implemented in a later step. */
  highlight?: boolean;
  language?: string;
};

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTokenRegex(tokens: string[]) {
  const cleaned = Array.from(
    new Set(tokens.map((t) => t.trim()).filter(Boolean)),
  );
  if (cleaned.length === 0) return null;
  cleaned.sort((a, b) => b.length - a.length);
  const union = cleaned.map(escapeRegExp).join("|");
  return new RegExp(`\\b(?:${union})\\b`, "g");
}

function tokenClassName(token: Prism.Token) {
  const aliases = token.alias
    ? Array.isArray(token.alias)
      ? token.alias
      : [token.alias]
    : [];
  return ["token", token.type, ...aliases].join(" ");
}

function renderTokenNode(
  node: Prism.TokenStream,
  key: string,
  tokenRegex: RegExp | null,
): React.ReactNode {
  if (Array.isArray(node)) {
    return node.map((n, i) => renderTokenNode(n, `${key}-${i}`, tokenRegex));
  }

  if (typeof node === "string") {
    if (!tokenRegex) return node;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    for (const match of node.matchAll(tokenRegex)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      if (start > lastIndex) parts.push(node.slice(lastIndex, start));
      parts.push(
        <span
          key={`${key}-m-${start}`}
          className={cx(
            // Higher-contrast token highlight. Use text-decoration (not border) so we don't
            // introduce layout shift in monospace line boxes.
            "rounded-[2px] bg-action-default-background-press px-[1px]",
            // Darker underline matching the highlight/brand blue.
            "underline decoration-action-default-border-hover decoration-1 underline-offset-[2px]",
          )}
        >
          {match[0]}
        </span>,
      );
      lastIndex = end;
    }
    if (lastIndex < node.length) parts.push(node.slice(lastIndex));
    return parts.length === 0 ? node : parts;
  }

  const children = renderTokenNode(node.content, `${key}-c`, tokenRegex);

  return (
    <span key={key} className={tokenClassName(node)}>
      {children}
    </span>
  );
}

export function CodeBlockTextContainer({
  code,
  wrap = false,
  showLineNumbers = true,
  allowHorizontalScroll = true,
  lineNumberCount,
  floatingActions,
  highlightedLines,
  highlightedTokens,
  transformCode,
  highlight,
  language,
}: CodeBlockTextContainerProps) {
  const rendered = transformCode ? transformCode(code) : code;
  const lines = React.useMemo(() => rendered.split("\n"), [rendered]);
  const doHighlight = highlight ?? Boolean(language);
  const highlighted = React.useMemo(() => new Set(highlightedLines ?? []), [highlightedLines]);
  const tokenRegex = React.useMemo(
    () => buildTokenRegex(highlightedTokens ?? []),
    [highlightedTokens],
  );
  const gutterDigits = React.useMemo(
    () => String(lineNumberCount ?? lines.length).length,
    [lineNumberCount, lines.length],
  );

  const grammar = React.useMemo(() => {
    if (!doHighlight) return null;
    if (!language) return null;
    return (Prism.languages as Record<string, Prism.Grammar | undefined>)[language] ?? null;
  }, [doHighlight, language]);

  return (
    <div className={cx("flex w-full items-stretch bg-background-secondary pt-[6px] pb-xs")}>
      {showLineNumbers ? (
        <div
          className={cx(
            "shrink-0 self-stretch",
            "pl-md pr-sm",
          )}
          style={{
            // Keep gutter width stable when expanding/collapsing (e.g. 9 -> 10 lines).
            // Padding is applied via classes; we reserve enough room for the digits with `ch`.
            width: `calc(${gutterDigits}ch + 24px)`,
          }}
        >
          <pre className={cx("select-none font-mono text-paragraph leading-5 text-text-placeholder")}>
            {lines.map((_, i) => (
              <div key={i} className="text-right">
                {i + 1}
              </div>
            ))}
          </pre>
        </div>
      ) : null}

      <div
        className={cx(
          "relative min-w-0 flex-1 self-stretch px-md",
          allowHorizontalScroll ? (wrap ? "overflow-x-hidden" : "overflow-x-auto") : "overflow-x-hidden",
          "overflow-y-clip",
        )}
      >
        {floatingActions ? (
          <div className="pointer-events-auto absolute right-sm top-xs z-10">
            {floatingActions}
          </div>
        ) : null}
        <pre
          className={cx(
            "font-mono text-paragraph leading-5",
            // Base code color.
            // - light: slightly softened dark text
            // - dark: primary text token (high contrast on bg-secondary)
            "text-grey-700 dark:text-text-primary",
            wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
            Boolean(floatingActions) && "pr-12",
            // Prism token colors.
            // Important: provide explicit `dark:` overrides so token colors remain readable
            // when the app theme flips.
            "[&_.token.comment]:text-grey-500 dark:[&_.token.comment]:text-grey-400 [&_.token.comment]:italic",
            "[&_.token.keyword]:text-blue-600 dark:[&_.token.keyword]:text-blue-300",
            "[&_.token.string]:text-green-700 dark:[&_.token.string]:text-green-300",
            "[&_.token.boolean]:text-amber-600 dark:[&_.token.boolean]:text-amber-300",
            "[&_.token.number]:text-amber-600 dark:[&_.token.number]:text-amber-300",
            "[&_.token.function]:text-blue-600 dark:[&_.token.function]:text-blue-300",
            "[&_.token.class-name]:text-purple-700 dark:[&_.token.class-name]:text-purple-300",
            "[&_.token.builtin]:text-purple-700 dark:[&_.token.builtin]:text-purple-300",
            "[&_.token.property]:text-teal-700 dark:[&_.token.property]:text-teal-300",
            "[&_.token.constant]:text-teal-700 dark:[&_.token.constant]:text-teal-300",
          )}
        >
          <code className="block">
            {lines.map((line, i) => {
              const lineNo = i + 1;
              const isHighlighted = highlighted.has(lineNo);
              const tokenized: Array<string | Prism.Token> = grammar ? Prism.tokenize(line, grammar) : [line];
              return (
                <div
                  key={i}
                  className={cx(
                    "min-w-0",
                    isHighlighted && "bg-action-default-background-hover",
                  )}
                >
                  {tokenized.map((t, idx) => renderTokenNode(t, `${i}-${idx}`, tokenRegex))}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

export type CodeBlockProps = React.HTMLAttributes<HTMLDivElement> & {
  code: string;
  label?: string;
  languageLabel?: string;
  showMenu?: boolean;
  showCopy?: boolean;
  showOverflow?: boolean;
  showFullscreen?: boolean;
  /**
   * Where actions are rendered.
   * - `menu`: actions appear in the MenuBar (default)
   * - `floating`: actions appear in the top-right of the text container (even if MenuBar hidden)
   * - `none`: no actions rendered
   */
  actionsPlacement?: "menu" | "floating" | "none";
  wrap?: boolean;
  showLineNumbers?: boolean;
  /** If false, horizontal overflow is clipped (no scrolling). */
  allowHorizontalScroll?: boolean;
  /** Highlight specific line numbers (1-indexed). */
  highlightedLines?: number[];
  /** Highlight specific word tokens (exact match). */
  highlightedTokens?: string[];
  transformCode?: (code: string) => string;
  highlight?: boolean;
  language?: string;
  /**
   * Collapsed snippet behavior:
   * - defaults to showing 5 lines (with footer toggle if there are more)
   * - pass `null` to show all lines (no footer)
   */
  maxVisibleLines?: number | null;
  /** Controlled expanded state (optional). */
  expanded?: boolean;
  /** Default expanded state when uncontrolled. */
  defaultExpanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
};

export function CodeBlock({
  code,
  label,
  languageLabel,
  showMenu = true,
  showCopy = true,
  showOverflow = true,
  showFullscreen = false,
  actionsPlacement = "menu",
  wrap = false,
  showLineNumbers = true,
  allowHorizontalScroll = true,
  highlightedLines,
  highlightedTokens,
  transformCode,
  highlight,
  language,
  maxVisibleLines = 5,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  className,
  ...rest
}: CodeBlockProps) {
  const rendered = transformCode ? transformCode(code) : code;
  const allLines = React.useMemo(() => rendered.split("\n"), [rendered]);
  const canCollapse =
    maxVisibleLines !== null && allLines.length > maxVisibleLines;

  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState(defaultExpanded);
  const isExpanded = expanded ?? uncontrolledExpanded;

  const visibleLines = React.useMemo(() => {
    if (!canCollapse) return allLines;
    if (isExpanded) return allLines;
    return allLines.slice(0, maxVisibleLines as number);
  }, [allLines, canCollapse, isExpanded, maxVisibleLines]);

  const remaining = canCollapse ? allLines.length - (maxVisibleLines as number) : 0;
  const footerLabel = canCollapse
    ? isExpanded
      ? "Show less"
      : `... ${remaining} more lines`
    : "";

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Ignore; clipboard can fail in non-secure contexts.
    }
  }, [code]);

  const actionsNode =
    actionsPlacement === "none" ? null : (
      <CodeBlockActions
        showCopy={showCopy}
        showOverflow={showOverflow}
        showFullscreen={showFullscreen}
        onCopy={handleCopy}
      />
    );

  return (
    <div
      {...rest}
      className={cx("flex w-full flex-col overflow-hidden rounded-md border border-border", className)}
    >
      {showMenu ? (
        <CodeBlockMenuBar
          label={label}
          languageLabel={languageLabel}
          showCopy={actionsPlacement === "menu" ? showCopy : false}
          showOverflow={actionsPlacement === "menu" ? showOverflow : false}
          showFullscreen={actionsPlacement === "menu" ? showFullscreen : false}
          onCopy={actionsPlacement === "menu" ? handleCopy : undefined}
        />
      ) : null}

      <CodeBlockTextContainer
        code={visibleLines.join("\n")}
        wrap={wrap}
        showLineNumbers={showLineNumbers}
        allowHorizontalScroll={allowHorizontalScroll}
        lineNumberCount={allLines.length}
        floatingActions={actionsPlacement === "floating" ? actionsNode : null}
        highlightedLines={highlightedLines}
        highlightedTokens={highlightedTokens}
        highlight={highlight}
        language={language}
      />

      {canCollapse ? (
        <CodeBlockExpandFooter
          label={footerLabel}
          expanded={isExpanded}
          onToggle={() => {
            const next = !isExpanded;
            onExpandedChange?.(next);
            if (expanded === undefined) setUncontrolledExpanded(next);
          }}
        />
      ) : null}
    </div>
  );
}

