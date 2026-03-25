import * as React from "react";
import type { AssistantTextMessage } from "../types";

export function AssistantText({ step }: { step: AssistantTextMessage }) {
  // Render newline-delimited text as paragraphs
  const paragraphs = step.text.split("\n").filter((l) => l.trim().length > 0);
  return (
    <div className="flex flex-col gap-xs text-paragraph leading-5 text-text-primary">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
