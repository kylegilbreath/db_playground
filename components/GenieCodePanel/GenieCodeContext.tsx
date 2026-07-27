"use client";

import * as React from "react";

type GenieCodeContextValue = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  /** Whether the app top nav is hidden (controlled from within Genie Code). */
  topNavHidden: boolean;
  toggleTopNav: () => void;
};

export const GenieCodeContext = React.createContext<GenieCodeContextValue>({
  isOpen: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
  topNavHidden: false,
  toggleTopNav: () => {},
});

export function useGenieCode() {
  return React.useContext(GenieCodeContext);
}
