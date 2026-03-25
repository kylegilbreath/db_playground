import * as React from "react";
import type { ThinkingMessage } from "../types";

export function ThinkingBlock({ step }: { step: ThinkingMessage }) {
  return (
    <p className="border-l-2 border-border pl-sm text-paragraph italic leading-5 text-text-secondary">
      <span className="not-italic font-medium">Thoughts:</span> {step.text}
    </p>
  );
}
