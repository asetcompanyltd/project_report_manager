import { useCallback, useEffect, useRef } from "react";

/** Debounces calls independently per key, so editing two different fields doesn't cancel each other. */
export function useKeyedDebounce(delayMs: number) {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  return useCallback(
    (key: string, fn: () => void) => {
      const existing = timers.current.get(key);
      if (existing) clearTimeout(existing);
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          fn();
        }, delayMs)
      );
    },
    [delayMs]
  );
}
