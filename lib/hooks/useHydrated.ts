"use client";

import { useSyncExternalStore } from "react";

// Nothing ever changes; useSyncExternalStore just needs a stable subscribe fn.
const subscribe = () => () => {};

/**
 * `false` during server rendering and on the very first client render, then
 * `true` for every render after hydration.
 *
 * Use it to gate anything that reads browser-only APIs (localStorage, window,
 * document). Reading those during render produces different markup on the
 * server than on the client, which React reports as a hydration mismatch.
 *
 * Unlike the usual `useState` + `useEffect` mount flag, this does not set state
 * inside an effect, so it does not trigger an extra render pass.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot (also used for the hydration render)
  );
}