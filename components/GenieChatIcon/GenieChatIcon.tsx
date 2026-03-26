"use client";

import * as React from "react";

// Lottie web type shim — loaded dynamically at runtime
type LottieInstance = {
  destroy: () => void;
};
type LottieStatic = {
  loadAnimation: (opts: {
    container: HTMLElement;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    path: string;
  }) => LottieInstance;
};

let lottiePromise: Promise<LottieStatic> | null = null;

function loadLottie(): Promise<LottieStatic> {
  if (lottiePromise) return lottiePromise;
  lottiePromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return;
    if ((window as unknown as Record<string, unknown>).lottie) {
      resolve((window as unknown as Record<string, unknown>).lottie as LottieStatic);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
    script.onload = () => resolve((window as unknown as Record<string, unknown>).lottie as LottieStatic);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return lottiePromise;
}

/**
 * Genie icon — plays the Lottie animation once on mount (triggered by `animationKey`).
 * Falls back to the static SVG if Lottie fails to load.
 *
 * Pass a new `animationKey` value to replay the animation (e.g. on new thread or panel open).
 */
export function GenieChatIcon({
  size = 56,
  animationKey,
}: {
  size?: number;
  animationKey?: string | number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const instanceRef = React.useRef<LottieInstance | null>(null);
  const [lottieReady, setLottieReady] = React.useState(false);
  const [lottieError, setLottieError] = React.useState(false);

  // Load lottie-web once
  React.useEffect(() => {
    loadLottie()
      .then(() => setLottieReady(true))
      .catch(() => setLottieError(true));
  }, []);

  // (Re-)play animation whenever lottie is ready or animationKey changes
  React.useEffect(() => {
    if (!lottieReady || !containerRef.current) return;
    const lottie = (window as unknown as Record<string, unknown>).lottie as LottieStatic;

    // Destroy previous instance
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    instanceRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: true,
      path: "/animations/genie-chat-icon.json",
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [lottieReady, animationKey]);

  if (lottieError) {
    return <StaticGenieChatIcon size={size} />;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/**
 * Static fallback SVG — also exported for use where animation isn't needed.
 */
export function StaticGenieChatIcon({ size = 56 }: { size?: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-arm`} x1="0" y1="6" x2="16" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="5" y1="13" x2="11" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
        <linearGradient id={`${id}-sparkle`} x1="4" y1="1" x2="12" y2="9" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M0 8.75L0 8.00586C0.000200565 7.03621 0.786214 6.2502 1.75586 6.25L2.85645 6.25C3.22823 6.25 3.56811 6.46043 3.73438 6.79297L4.3291 7.98145C5.02432 9.3718 6.44551 10.25 8 10.25C9.55449 10.25 10.9757 9.3718 11.6709 7.98145L12.2656 6.79297L12.335 6.67383C12.5165 6.41072 12.8182 6.25 13.1436 6.25L16 6.25V7.75L13.4639 7.75L13.0127 8.65234C12.0634 10.5509 10.1226 11.75 8 11.75C5.87735 11.75 3.93661 10.5509 2.9873 8.65234L2.53613 7.75H1.75586C1.61464 7.7502 1.5002 7.86464 1.5 8.00586V8.75C1.5 9.02614 1.72386 9.25 2 9.25V10.75C0.89543 10.75 0 9.85457 0 8.75Z" fill={`url(#${id}-arm)`} />
      <path d="M10.5 12.75V14.25L5.5 14.25V12.75L10.5 12.75Z" fill={`url(#${id}-base)`} />
      <path d="M8 1.75C8.36452 1.75 8.67665 2.01202 8.73926 2.37109L8.96582 3.67383C9.02006 3.98573 9.26427 4.22994 9.57617 4.28418L10.8789 4.51074C11.238 4.57335 11.5 4.88548 11.5 5.25C11.5 5.61452 11.238 5.92665 10.8789 5.98926L9.57617 6.21582C9.26427 6.27006 9.02006 6.51427 8.96582 6.82617L8.73926 8.12891C8.67665 8.48798 8.36452 8.75 8 8.75C7.63548 8.75 7.32335 8.48798 7.26074 8.12891L7.03418 6.82617C6.97994 6.51427 6.73573 6.27006 6.42383 6.21582L5.12109 5.98926C4.76202 5.92665 4.5 5.61452 4.5 5.25C4.5 4.88548 4.76202 4.57335 5.12109 4.51074L6.42383 4.28418C6.73573 4.22994 6.97994 3.98573 7.03418 3.67383L7.26074 2.37109L7.2959 2.24121C7.40253 1.95057 7.6811 1.75 8 1.75Z" fill={`url(#${id}-sparkle)`} />
    </svg>
  );
}
