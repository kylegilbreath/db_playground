"use client";

import * as React from "react";

const BAR_HEIGHTS = [2, 4.5, 7, 9.5, 12];
const BAR_WIDTH = 2;
const BAR_GAP = 1.25;
const BAR_RADIUS = 1;

export type PopularityLevel = 1 | 2 | 3 | 4 | 5;

export type PopularityProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  level?: PopularityLevel;
  size?: number;
};

export function Popularity({
  level = 3,
  size = 16,
  className,
  ...rest
}: PopularityProps) {
  return (
    <div
      {...rest}
      className={className}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Popularity ${level} of 5`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {BAR_HEIGHTS.map((h, i) => {
          const filled = i < level;
          const x = i * (BAR_WIDTH + BAR_GAP) + (16 - 5 * BAR_WIDTH - 4 * BAR_GAP) / 2;
          const y = 14 - h;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={h}
              rx={BAR_RADIUS}
              className={
                filled
                  ? "fill-[var(--text-primary)]"
                  : "fill-[var(--table-background-selected-12)]"
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
