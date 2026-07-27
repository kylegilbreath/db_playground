"use client";
import * as React from "react";
import type { SuggestionChipsMessage } from "../types";

export function SuggestionChips({
  step,
  onSelect,
}: {
  step: SuggestionChipsMessage;
  onSelect?: (text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-xs">
      {step.suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onSelect?.(s)}
          className="flex w-fit items-center gap-sm rounded-full bg-background-secondary px-3 py-1.5 text-paragraph text-text-primary hover:bg-background-tertiary"
        >
          {/* Gradient turn arrow (↳) */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <defs>
              <linearGradient id={`arrow-grad-${s.slice(0, 4)}`} x1="2" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path d="M3 3V6.5C3 7.60457 3.89543 8.5 5 8.5H11M11 8.5L8 5.5M11 8.5L8 11.5" stroke={`url(#arrow-grad-${s.slice(0, 4)})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {s}
        </button>
      ))}
    </div>
  );
}
