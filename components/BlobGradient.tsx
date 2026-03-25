"use client";

import * as React from "react";

export type BlobGradientProps = {
  className?: string;
  topAligned?: boolean;
};

const CONFIG = {
  parallax: { a: 0.1, b: 0.2, c: 0.15, d: 0.12 },
  grain: { frequency: "0.9", octaves: 4, opacity: 0.22 },
} as const;

const PATHS = {
  a: [
    // peanut
    "M 60 140 C 180 20, 380 10, 560 100 C 740 190, 840 40, 1040 30 C 1150 25, 1200 120, 1160 230 C 1110 340, 940 390, 760 350 C 580 310, 460 400, 280 360 C 120 320, 20 350, 15 260 C 10 170, 20 180, 60 140 Z",
    // fat middle
    "M 60 150 C 180 60, 350 50, 520 130 C 690 210, 800 110, 1040 80 C 1150 70, 1200 150, 1160 250 C 1110 340, 960 360, 780 330 C 600 300, 500 350, 300 330 C 140 310, 30 330, 20 260 C 10 190, 25 190, 60 150 Z",
    // skinny
    "M 50 180 C 160 100, 360 90, 560 155 C 760 220, 850 110, 1050 100 C 1150 95, 1200 155, 1170 230 C 1130 300, 950 330, 770 310 C 590 290, 470 340, 290 320 C 130 300, 30 320, 25 270 C 20 210, 25 210, 50 180 Z",
    // peanut variant
    "M 65 145 C 190 22, 390 8, 570 95 C 750 185, 850 42, 1045 32 C 1152 26, 1198 118, 1158 228 C 1108 338, 938 388, 755 348 C 575 312, 455 398, 275 358 C 118 322, 18 352, 14 262 C 9 172, 22 175, 65 145 Z",
  ],
  b: [
    // peanut
    "M 80 180 C 220 30, 480 10, 720 120 C 960 230, 1100 50, 1360 40 C 1500 35, 1580 160, 1540 300 C 1490 430, 1280 480, 1040 440 C 800 400, 640 490, 400 460 C 180 430, 40 470, 30 350 C 20 240, 30 230, 80 180 Z",
    // skinny
    "M 70 210 C 200 120, 460 100, 700 175 C 940 250, 1080 140, 1360 120 C 1500 112, 1580 195, 1550 300 C 1510 390, 1300 420, 1060 400 C 820 380, 660 430, 420 415 C 200 400, 50 420, 40 350 C 30 270, 35 260, 70 210 Z",
    // fat middle
    "M 90 190 C 230 80, 500 60, 740 155 C 980 250, 1120 130, 1370 100 C 1510 90, 1585 190, 1545 310 C 1495 410, 1300 440, 1060 415 C 820 390, 660 450, 410 430 C 190 410, 45 440, 35 350 C 25 260, 40 245, 90 190 Z",
    // peanut variant
    "M 85 175 C 230 28, 490 8, 730 115 C 970 228, 1110 48, 1370 38 C 1508 32, 1582 158, 1542 298 C 1492 428, 1285 478, 1045 438 C 805 398, 645 488, 405 458 C 185 428, 42 468, 32 348 C 22 238, 32 228, 85 175 Z",
  ],
  c: [
    // peanut
    "M 70 160 C 200 25, 420 8, 640 110 C 860 215, 980 45, 1220 35 C 1340 30, 1400 140, 1360 270 C 1310 390, 1120 440, 900 400 C 680 360, 540 450, 340 420 C 160 390, 35 430, 25 320 C 15 210, 25 205, 70 160 Z",
    // fat middle
    "M 75 170 C 210 70, 430 55, 650 145 C 870 235, 990 130, 1230 105 C 1345 98, 1405 175, 1365 280 C 1315 370, 1130 400, 910 380 C 690 360, 550 410, 350 390 C 165 370, 40 400, 30 320 C 20 230, 30 220, 75 170 Z",
    // skinny
    "M 65 195 C 190 110, 410 95, 630 165 C 850 235, 970 130, 1210 115 C 1335 108, 1400 180, 1370 270 C 1330 350, 1130 380, 910 365 C 690 350, 550 395, 340 380 C 160 365, 35 385, 28 315 C 18 240, 28 235, 65 195 Z",
    // peanut variant
    "M 75 155 C 208 22, 425 8, 645 108 C 865 218, 988 42, 1225 35 C 1345 30, 1402 138, 1362 268 C 1312 388, 1125 438, 905 398 C 685 358, 545 448, 345 418 C 165 388, 38 428, 28 318 C 18 208, 28 202, 75 155 Z",
  ],
  d: [
    // peanut
    "M 55 130 C 170 15, 370 5, 550 90 C 730 175, 830 35, 1030 25 C 1140 20, 1190 110, 1150 220 C 1100 330, 930 380, 750 340 C 570 300, 450 390, 270 350 C 110 310, 15 340, 10 250 C 5 160, 15 170, 55 130 Z",
    // fat middle
    "M 70 165 C 200 65, 380 45, 540 140 C 700 225, 810 120, 1050 95 C 1160 85, 1210 165, 1170 265 C 1120 355, 970 375, 790 345 C 610 315, 510 365, 310 345 C 150 325, 40 345, 30 275 C 20 205, 35 205, 70 165 Z",
    // skinny
    "M 45 175 C 150 95, 350 85, 545 150 C 745 215, 840 105, 1040 95 C 1140 90, 1190 150, 1160 225 C 1120 295, 940 325, 760 305 C 580 285, 460 335, 280 315 C 120 295, 25 315, 20 265 C 15 205, 20 205, 45 175 Z",
    // peanut variant
    "M 60 138 C 185 18, 385 5, 565 88 C 745 178, 845 38, 1038 28 C 1148 22, 1195 115, 1155 225 C 1105 335, 935 385, 752 345 C 572 308, 452 395, 272 355 C 115 318, 15 348, 12 258 C 8 168, 18 172, 60 138 Z",
  ],
};

type ShapeConfig = {
  id: string;
  viewBox: string;
  filterWidth: number;
  filterHeight: number;
  pathKey: keyof typeof PATHS;
  morphClass: string;
  defaultColor: string;
  groupOpacity: number;
  fillOpacity: number;
};

const SHAPE_CONFIGS: ShapeConfig[] = [
  { id: "a", viewBox: "0 0 1200 400", filterWidth: 1500, filterHeight: 700, pathKey: "a", morphClass: "animate-morph-a", defaultColor: "#44D67C", groupOpacity: 0.6, fillOpacity: 0.8 },
  { id: "b", viewBox: "0 0 1600 500", filterWidth: 1900, filterHeight: 800, pathKey: "b", morphClass: "animate-morph-b", defaultColor: "#46FF87", groupOpacity: 0.6, fillOpacity: 0.8 },
  { id: "c", viewBox: "0 0 1400 450", filterWidth: 1700, filterHeight: 750, pathKey: "c", morphClass: "animate-morph-c", defaultColor: "#6AE042", groupOpacity: 0.6, fillOpacity: 0.8 },
  { id: "d", viewBox: "0 0 1200 400", filterWidth: 1500, filterHeight: 700, pathKey: "d", morphClass: "animate-morph-d", defaultColor: "#38C96E", groupOpacity: 0.6, fillOpacity: 0.8 },
];

const CSS_VAR_KEYS = ["a", "b", "c", "d"] as const;

function Shape({ config }: { config: ShapeConfig }) {
  const filterId = `blob-blur-${config.id}`;
  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: "block" }}
      viewBox={config.viewBox}
      fill="none"
    >
      <defs>
        <filter
          id={filterId}
          x={-150}
          y={-150}
          width={config.filterWidth}
          height={config.filterHeight}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={49} />
        </filter>
      </defs>
      <g opacity={config.groupOpacity} filter={`url(#${filterId})`}>
        <path
          className={config.morphClass}
          d={PATHS[config.pathKey][0]}
          style={{ fill: `var(--blob-color-${config.id}, ${config.defaultColor})` }}
          fillOpacity={config.fillOpacity}
        />
      </g>
    </svg>
  );
}

const WRAPPER_CONFIGS = [
  { driftClass: "animate-drift-a", breatheClass: "animate-breathe-a" },
  { driftClass: "animate-drift-b", breatheClass: "animate-breathe-b" },
  { driftClass: "animate-drift-c", breatheClass: "animate-breathe-c" },
  { driftClass: "animate-drift-d", breatheClass: "animate-breathe-d" },
] as const;

const POSITION_SEEDS = [
  { anchor: "left"  as const, xBase: -5,  xRange: 10, yBase: 6,  yRange: 12, size: "h-[58%] w-[52%]" },
  { anchor: "right" as const, xBase: 0,   xRange: 12, yBase: 2,  yRange: 12, size: "h-[45%] w-[40%]" },
  { anchor: "right" as const, xBase: -12, xRange: 10, yBase: 14, yRange: 12, size: "h-[58%] w-[52%]" },
  { anchor: "left"  as const, xBase: 15,  xRange: 15, yBase: 8,  yRange: 12, size: "h-[42%] w-[38%]" },
];

function randomizePositions() {
  return POSITION_SEEDS.map((seed) => ({
    anchor: seed.anchor,
    x: seed.xBase + Math.random() * seed.xRange,
    y: seed.yBase + Math.random() * seed.yRange,
    size: seed.size,
  }));
}

const KEYFRAMES_CSS = `
  @keyframes drift-a {
    0%, 100% { transform: translate(0, 110px) scale(1) translateY(var(--parallax-y, 0px)); }
    25% { transform: translate(100px, -90px) scale(1.04) translateY(var(--parallax-y, 0px)); }
    50% { transform: translate(-80px, 170px) scale(0.97) translateY(var(--parallax-y, 0px)); }
    75% { transform: translate(-100px, -50px) scale(1.02) translateY(var(--parallax-y, 0px)); }
  }
  @keyframes drift-b {
    0%, 100% { transform: translate(0, -70px) scale(1) translateY(var(--parallax-y, 0px)); }
    25% { transform: translate(-90px, 150px) scale(1.05) translateY(var(--parallax-y, 0px)); }
    50% { transform: translate(100px, -130px) scale(0.96) translateY(var(--parallax-y, 0px)); }
    75% { transform: translate(80px, 90px) scale(1.03) translateY(var(--parallax-y, 0px)); }
  }
  @keyframes drift-c {
    0%, 100% { transform: translate(0, 100px) scale(1) translateY(var(--parallax-y, 0px)); }
    25% { transform: translate(90px, -150px) scale(0.97) translateY(var(--parallax-y, 0px)); }
    50% { transform: translate(-100px, 190px) scale(1.04) translateY(var(--parallax-y, 0px)); }
    75% { transform: translate(80px, -70px) scale(0.98) translateY(var(--parallax-y, 0px)); }
  }
  @keyframes drift-d {
    0%, 100% { transform: translate(0, -50px) scale(1) translateY(var(--parallax-y, 0px)); }
    25% { transform: translate(-70px, 120px) scale(1.03) translateY(var(--parallax-y, 0px)); }
    50% { transform: translate(90px, -110px) scale(0.98) translateY(var(--parallax-y, 0px)); }
    75% { transform: translate(-60px, 80px) scale(1.01) translateY(var(--parallax-y, 0px)); }
  }
  @keyframes morph-a {
    0%, 100% { d: path("${PATHS.a[0]}"); }
    25% { d: path("${PATHS.a[1]}"); }
    50% { d: path("${PATHS.a[2]}"); }
    75% { d: path("${PATHS.a[3]}"); }
  }
  @keyframes morph-b {
    0%, 100% { d: path("${PATHS.b[0]}"); }
    25% { d: path("${PATHS.b[1]}"); }
    50% { d: path("${PATHS.b[2]}"); }
    75% { d: path("${PATHS.b[3]}"); }
  }
  @keyframes morph-c {
    0%, 100% { d: path("${PATHS.c[0]}"); }
    25% { d: path("${PATHS.c[1]}"); }
    50% { d: path("${PATHS.c[2]}"); }
    75% { d: path("${PATHS.c[3]}"); }
  }
  @keyframes morph-d {
    0%, 100% { d: path("${PATHS.d[0]}"); }
    25% { d: path("${PATHS.d[1]}"); }
    50% { d: path("${PATHS.d[2]}"); }
    75% { d: path("${PATHS.d[3]}"); }
  }
  .animate-drift-a { animation: drift-a 76.8s ease-in-out infinite; }
  .animate-drift-b { animation: drift-b 91.2s ease-in-out infinite; }
  .animate-drift-c { animation: drift-c 84.8s ease-in-out infinite; }
  .animate-drift-d { animation: drift-d 80s ease-in-out infinite; }
  .animate-morph-a { animation: morph-a 38.4s ease-in-out infinite; }
  .animate-morph-b { animation: morph-b 46.4s ease-in-out infinite; }
  .animate-morph-c { animation: morph-c 40s ease-in-out infinite; }
  .animate-morph-d { animation: morph-d 43.2s ease-in-out infinite; }
  @keyframes breathe-a {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes breathe-b {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
  @keyframes breathe-c {
    0%, 100% { opacity: 0.85; }
    50% { opacity: 0.55; }
  }
  @keyframes breathe-d {
    0%, 100% { opacity: 0.9; }
    50% { opacity: 0.65; }
  }
  .animate-breathe-a { animation: breathe-a 32s ease-in-out infinite; }
  .animate-breathe-b { animation: breathe-b 41.6s ease-in-out infinite; }
  .animate-breathe-c { animation: breathe-c 35.2s ease-in-out infinite; }
  .animate-breathe-d { animation: breathe-d 37.6s ease-in-out infinite; }
`;

const PARALLAX_RATES = [CONFIG.parallax.a, CONFIG.parallax.b, CONFIG.parallax.c, CONFIG.parallax.d];

export function BlobGradient({
  className,
  topAligned,
}: BlobGradientProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const delays = React.useRef({
    a: `${-Math.random() * 76.8}s`,
    b: `${-Math.random() * 91.2}s`,
    c: `${-Math.random() * 84.8}s`,
    d: `${-Math.random() * 80}s`,
  });

  const positions = React.useRef(randomizePositions());

  const shapeRefs = [
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
  ];

  React.useEffect(() => {
    const scrollEl = document.querySelector(".app-scroll");
    if (!scrollEl) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const st = scrollEl.scrollTop;
          shapeRefs.forEach((ref, i) => {
            if (ref.current) {
              ref.current.style.setProperty("--parallax-y", `${-st * PARALLAX_RATES[i]}px`);
            }
          });
          ticking = false;
        });
      }
    };
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{KEYFRAMES_CSS}</style>
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none fixed left-1/2 h-[1375px] w-[3200px] -translate-x-[calc(50%+40px)] opacity-[0.34] transition-[top] ease-[cubic-bezier(0.22,1,0.36,1)] dark:opacity-[0.29]",
          "[mask-image:radial-gradient(ellipse_60%_65%_at_50%_40%,black_20%,transparent_90%)]",
          topAligned ? "top-[-800px] duration-[1200ms]" : "top-[-460px] duration-[1800ms]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {SHAPE_CONFIGS.map((config, i) => {
          const pos = positions.current[i];
          return (
            <div
              key={config.id}
              ref={shapeRefs[i]}
              className={`${WRAPPER_CONFIGS[i].driftClass} ${WRAPPER_CONFIGS[i].breatheClass} absolute ${pos.size} blur-[30px]`}
              style={{
                [pos.anchor]: `${pos.x}%`,
                top: `${pos.y}%`,
                animationDelay: delays.current[CSS_VAR_KEYS[i]],
              }}
            >
              <Shape config={config} />
            </div>
          );
        })}

        {/* Film grain overlay */}
        <svg className="absolute inset-0 h-full w-full mix-blend-overlay" preserveAspectRatio="none">
          <filter id="blob-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={CONFIG.grain.frequency}
              numOctaves={CONFIG.grain.octaves}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#blob-noise)"
            opacity={CONFIG.grain.opacity}
          />
        </svg>
      </div>
    </>
  );
}
