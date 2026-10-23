import { useSyncExternalStore } from "react";

const STORAGE_KEY = "algoatlas-progress";
const EMPTY: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();
let cache: ReadonlySet<string> | null = null;

function load(): ReadonlySet<string> {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = new Set(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []);
  } catch {
    cache = new Set();
  }
  return cache;
}

function save(next: Set<string>) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // Progress still works in memory when storage is unavailable.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress() {
  const completed = useSyncExternalStore(subscribe, load, () => EMPTY);

  const toggle = (path: string) => {
    const next = new Set(load());
    if (next.has(path)) next.delete(path);
    else next.add(path);
    save(next);
  };

  const reset = () => save(new Set());

  return { completed, toggle, reset, isComplete: (path: string) => completed.has(path) };
}
