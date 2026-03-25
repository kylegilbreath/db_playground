"use client";

import * as React from "react";

export type ResponsiveState = {
  /** Max-width 639px: mobile-specific tweaks. */
  isSmallScreen: boolean;
  /** Max-width 899px: nav collapse / narrow chrome behavior. */
  isNarrowNav: boolean;
};

const ResponsiveContext = React.createContext<ResponsiveState>({
  isSmallScreen: false,
  isNarrowNav: false,
});

export function useResponsive(): ResponsiveState {
  return React.useContext(ResponsiveContext);
}

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ResponsiveState>({
    isSmallScreen: false,
    isNarrowNav: false,
  });

  React.useEffect(() => {
    const smallMq = window.matchMedia("(max-width: 639px)");
    const narrowNavMq = window.matchMedia("(max-width: 899px)");

    const update = () =>
      setState({
        isSmallScreen: smallMq.matches,
        isNarrowNav: narrowNavMq.matches,
      });

    update();
    smallMq.addEventListener("change", update);
    narrowNavMq.addEventListener("change", update);
    return () => {
      smallMq.removeEventListener("change", update);
      narrowNavMq.removeEventListener("change", update);
    };
  }, []);

  return <ResponsiveContext.Provider value={state}>{children}</ResponsiveContext.Provider>;
}

