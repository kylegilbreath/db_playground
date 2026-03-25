"use client";

import * as React from "react";

type GenieCodeContextValue = {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

export const GenieCodeContext = React.createContext<GenieCodeContextValue>({
  isOpen: false,
  toggle: () => {},
  open: () => {},
  close: () => {},
});

export function useGenieCode() {
  return React.useContext(GenieCodeContext);
}
