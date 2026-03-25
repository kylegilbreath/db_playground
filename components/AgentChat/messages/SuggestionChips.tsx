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
          className="flex w-fit items-center gap-sm rounded-full border border-border bg-background-primary px-3 py-1.5 text-paragraph text-text-primary hover:bg-background-secondary"
        >
          {/* Gradient arrow */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`arrow-grad-${s.slice(0, 4)}`} x1="0" y1="0" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke={`url(#arrow-grad-${s.slice(0, 4)})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {s}
        </button>
      ))}
    </div>
  );
}
