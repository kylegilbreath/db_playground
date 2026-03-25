"use client";

import * as React from "react";
import { IconButton } from "@/components/IconButton";
import { Icon } from "@/components/icons";

export type HuePickerProps = {
  value: number;
  onChange: (hue: number) => void;
};

function hueLabel(hue: number): string {
  if (hue < 15 || hue >= 345) return "Red";
  if (hue < 45) return "Orange";
  if (hue < 70) return "Yellow";
  if (hue < 160) return "Green";
  if (hue < 200) return "Cyan";
  if (hue < 260) return "Blue";
  if (hue < 300) return "Purple";
  return "Pink";
}

export function hueToColors(hue: number) {
  return {
    colorA: `hsl(${hue - 10}, 65%, 40%)`,
    colorB: `hsl(${hue - 45}, 90%, 60%)`,
    colorC: `hsl(${hue}, 60%, 35%)`,
    colorD: `hsl(${hue + 45}, 75%, 50%)`,
  };
}

function HueInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = React.useState(String(value));
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(String(value));
    }
  }, [value]);

  const commit = () => {
    const n = Number(draft);
    if (!Number.isNaN(n) && draft.trim() !== "") {
      onChange(Math.max(0, Math.min(360, Math.round(n))));
    }
    setDraft(String(Math.max(0, Math.min(360, Math.round(Number(draft) || value)))));
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          const delta = e.key === "ArrowUp" ? step : -step;
          const next = Math.max(0, Math.min(360, value + delta));
          onChange(next);
          setDraft(String(next));
        }
      }}
      onBlur={commit}
      aria-label={`Gradient hue, ${hueLabel(value)}`}
      className="w-12 shrink-0 rounded-sm border border-border bg-background-secondary px-2 py-1 text-xs tabular-nums text-text-primary focus:border-action-default-border-focus focus:outline-none"
    />
  );
}

export function HuePicker({ value, onChange }: HuePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [colorOpen, setColorOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setColorOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setColorOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const hueFromPointer = React.useCallback(
    (clientX: number) => {
      if (!barRef.current) return value;
      const rect = barRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(ratio * 360);
    },
    [value],
  );

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(hueFromPointer(e.clientX));
    },
    [hueFromPointer, onChange],
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onChange(hueFromPointer(e.clientX));
    },
    [hueFromPointer, onChange],
  );

  const onPointerUp = React.useCallback(() => {
    dragging.current = false;
  }, []);

  const thumbPosition = `${(value / 360) * 100}%`;

  return (
    <div ref={containerRef} className="relative">
      <IconButton
        icon={<Icon name="pencilIcon" size={16} />}
        tone="neutral"
        aria-label="Edit home page"
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-[260px] overflow-hidden rounded-md border border-border bg-background-primary shadow-[var(--elevation-shadow-lg)]">
          <button
            type="button"
            className="flex w-full items-center px-3 py-2 text-left text-sm text-text-primary hover:bg-background-tertiary"
            onClick={() => {}}
          >
            Add logo
          </button>
          <button
            type="button"
            className="flex w-full items-center px-3 py-2 text-left text-sm text-text-primary hover:bg-background-tertiary"
            onClick={() => setColorOpen((prev) => !prev)}
          >
            Edit color
          </button>

          {colorOpen && (
            <div className="border-t border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <div
                  ref={barRef}
                  className="relative h-6 min-w-0 flex-1 cursor-pointer rounded-sm"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(0,80%,55%), hsl(60,80%,55%), hsl(120,80%,55%), hsl(180,80%,55%), hsl(240,80%,55%), hsl(300,80%,55%), hsl(360,80%,55%))",
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                >
                  <div
                    className="pointer-events-none absolute top-1/2 h-5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-[#161616] shadow-sm"
                    style={{
                      left: thumbPosition,
                      backgroundColor: `hsl(${value}, 80%, 55%)`,
                    }}
                  />
                </div>
                <HueInput value={value} onChange={onChange} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
