import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export type IndentedTextSnippetProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * IndentedTextSnippet
 *
 * Small, indented text block used in search results to show matching columns
 * or other contextual info. Matches Figma "Indented text section".
 */
export function IndentedTextSnippet({ className, children, ...rest }: IndentedTextSnippetProps) {
  return (
    <div
      {...rest}
      className={cx(
        "flex items-center border-l border-border pl-md py-sm",
        className,
      )}
    >
      <p className="overflow-hidden text-ellipsis whitespace-pre-line text-hint text-text-primary">
        {children}
      </p>
    </div>
  );
}

export type IndentedTextSnippetHighlightProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Inline highlight for matched snippets.
 */
export function IndentedTextSnippetHighlight({
  className,
  children,
  ...rest
}: IndentedTextSnippetHighlightProps) {
  return (
    <span
      {...rest}
      className={cx(
        // Match `CodeBlock` token highlight styles exactly.
        "rounded-[2px] bg-action-default-background-press px-[1px]",
        "underline decoration-action-default-border-hover decoration-1 underline-offset-[2px]",
        className,
      )}
    >
      {children}
    </span>
  );
}

