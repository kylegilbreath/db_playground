"use client";

import * as React from "react";

import { DefaultButton } from "@/components/DefaultButton";
import {
  ASSISTANT_INSTRUCTIONS_FILE,
  ASSISTANT_INSTRUCTIONS_LABEL,
  ASSISTANT_INSTRUCTIONS_MARKDOWN,
} from "@/lib/assistant-instructions";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/** Markdown rendering aligned with the Genie Code skill preview dialog (frontmatter + headings + lists). */
export function RenderSkillDialogMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  let frontmatterCount = 0;
  return (
    <>
      {lines.map((line, i) => {
        if (line === "---") {
          frontmatterCount++;
          return (
            <div key={i} className="font-mono text-hint leading-5 text-text-secondary">
              {line}
            </div>
          );
        }
        if (frontmatterCount === 1) {
          return (
            <div key={i} className="font-mono text-hint leading-5 text-text-secondary">
              {line || " "}
            </div>
          );
        }
        if (line.startsWith("# ")) return <h1 key={i} className="mb-xs mt-md text-title3 font-semibold text-text-primary">{line.slice(2)}</h1>;
        if (line.startsWith("## ")) return <h2 key={i} className="mb-xs mt-md text-paragraph font-semibold text-text-primary">{line.slice(3)}</h2>;
        if (line.startsWith("### ")) return <h3 key={i} className="mb-xs mt-sm text-paragraph font-medium text-text-primary">{line.slice(4)}</h3>;
        if (line.trimStart().startsWith("- ")) {
          return (
            <div key={i} className="ml-md flex gap-xs leading-5 text-paragraph text-text-primary">
              <span className="shrink-0 text-text-secondary">•</span>
              <span>{line.trimStart().slice(2)}</span>
            </div>
          );
        }
        if (/^\d+\./.test(line.trimStart())) return <div key={i} className="ml-md leading-5 text-paragraph text-text-primary">{line.trimStart()}</div>;
        if (line === "") return <div key={i} className="h-2" />;
        return <div key={i} className="leading-5 text-paragraph text-text-primary">{line}</div>;
      })}
    </>
  );
}

export type AssistantInstructionsCardProps = {
  onOpenFile: () => void;
  /** Defaults to shared prototype copy from \`lib/assistant-instructions\`. */
  content?: string;
  className?: string;
  /** When false, body scroll area uses a shorter max height (e.g. settings drawer). */
  compact?: boolean;
};

export function AssistantInstructionsCard({
  onOpenFile,
  content = ASSISTANT_INSTRUCTIONS_MARKDOWN,
  className,
  compact = false,
}: AssistantInstructionsCardProps) {
  return (
    <div className={cx("overflow-hidden rounded-md border border-border bg-background-primary", className)}>
      <div className="flex shrink-0 items-center justify-between gap-sm border-b border-border bg-background-secondary px-mid py-sm">
        <span className="min-w-0 truncate font-mono text-paragraph font-medium text-text-primary">{ASSISTANT_INSTRUCTIONS_LABEL}</span>
        <DefaultButton size="small" onClick={onOpenFile}>
          Open file
        </DefaultButton>
      </div>
      <div
        className={cx(
          "overflow-y-auto px-mid py-mid",
          compact ? "max-h-64" : "max-h-[min(420px,55vh)]",
        )}
      >
        <RenderSkillDialogMarkdown text={content} />
      </div>
    </div>
  );
}

export { ASSISTANT_INSTRUCTIONS_FILE, ASSISTANT_INSTRUCTIONS_LABEL, ASSISTANT_INSTRUCTIONS_MARKDOWN };
