import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true once the client has taken
 * over. Lets a component render a server-safe first frame (zeroed counters,
 * no stored-theme selection) and then move to browser-only state without a
 * setState-in-effect round trip.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
