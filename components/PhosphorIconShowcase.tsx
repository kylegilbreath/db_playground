"use client";

import * as React from "react";
import { Pizza } from "@phosphor-icons/react";

import { PhIcon } from "@/components/icons";

const weights = [
  { label: "thin", weight: "thin" },
  { label: "light", weight: "light" },
  { label: "regular", weight: "regular" },
  { label: "bold", weight: "bold" },
  { label: "fill", weight: "fill" },
  { label: "duotone", weight: "duotone" },
] as const;

const accentColors = [
  { label: "lemon", className: "text-lemon" },
  { label: "lime", className: "text-lime" },
  { label: "teal", className: "text-teal" },
  { label: "turquoise", className: "text-turquoise" },
  { label: "indigo", className: "text-indigo" },
  { label: "purple", className: "text-purple" },
  { label: "pink", className: "text-pink" },
  { label: "coral", className: "text-coral" },
] as const;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-sm rounded-md bg-background-secondary p-3"
      title={title}
    >
      {children}
    </div>
  );
}

export function PhosphorIconShowcase() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <h3 className="text-title4 font-semibold tracking-tight">Weights</h3>
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {weights.map((w) => (
            <Card key={w.label} title={`Pizza (${w.label})`}>
              <PhIcon
                icon={Pizza}
                size={24}
                weight={w.weight}
                className="text-action-default-icon-default"
              />
              <div className="w-full truncate text-center text-hint text-text-secondary">
                {w.label}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <h3 className="text-title4 font-semibold tracking-tight">Secondary colors</h3>
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {accentColors.map((c) => (
            <Card key={c.label} title={c.className}>
              <PhIcon icon={Pizza} size={24} weight="regular" className={c.className} />
              <div className="w-full truncate text-center text-hint text-text-secondary">
                {c.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

