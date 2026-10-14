import { useSyncExternalStore } from "react";

export type ColorMode = "light" | "dark";

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Tracks the `dark` class on <html> (set by next-themes with attribute="class"). */
export function useColorMode(): ColorMode {
  return useSyncExternalStore(subscribe, getSnapshot, () => "light");
}
