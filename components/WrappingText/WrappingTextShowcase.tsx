"use client";

import * as React from "react";

import { WrappingText } from "./WrappingText";

const SAMPLE =
  "Brief description of the item, which should be no longer than a sentence but will often wrap to a new line. In the detail layout, we have the screen space to display more text.";

export function WrappingTextShowcase() {
  return (
    <div className="flex flex-col gap-sm">
      <div className="rounded-md border border-border bg-background-primary p-sm">
        <div className="text-hint text-text-secondary">No clamp</div>
        <WrappingText>{SAMPLE}</WrappingText>
      </div>

      <div className="rounded-md border border-border bg-background-primary p-sm">
        <div className="text-hint text-text-secondary">Clamp: 1 line</div>
        <WrappingText lines={1}>{SAMPLE}</WrappingText>
      </div>

      <div className="rounded-md border border-border bg-background-primary p-sm">
        <div className="text-hint text-text-secondary">Clamp: 2 lines</div>
        <WrappingText lines={2}>{SAMPLE}</WrappingText>
      </div>

      <div className="rounded-md border border-border bg-background-primary p-sm">
        <div className="text-hint text-text-secondary">Clamp: 3 lines</div>
        <WrappingText lines={3}>{SAMPLE}</WrappingText>
      </div>
    </div>
  );
}

