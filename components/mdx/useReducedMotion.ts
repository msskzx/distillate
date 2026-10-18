"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  return useSyncExternalStore(
    (change) => {
      const list = matchMedia(query);
      list.addEventListener("change", change);
      return () => list.removeEventListener("change", change);
    },
    () => matchMedia(query).matches,
    () => true,
  );
}
