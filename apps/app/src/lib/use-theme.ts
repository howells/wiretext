"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "wiretext-theme";

// Subscribers notified when setTheme writes a new preference
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

/** Re-render subscribers when the preference or the OS color scheme changes. */
const subscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  listeners.add(onStoreChange);
  mql.addEventListener("change", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    mql.removeEventListener("change", onStoreChange);
  };
};

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
};

const getResolvedTheme = (): ResolvedTheme => {
  const theme = getStoredTheme();
  return theme === "system" ? getSystemTheme() : theme;
};

// Server snapshots match the blocking script's dark-first render
const getServerTheme = (): Theme => "system";
const getServerResolvedTheme = (): ResolvedTheme => "dark";

const applyTheme = (resolved: ResolvedTheme) => {
  const el = document.documentElement;
  // Suppress transitions so the theme switch is instant
  el.classList.add("no-transitions");
  el.classList.toggle("dark", resolved === "dark");
  // Re-enable after a frame so the browser has painted the new colors
  requestAnimationFrame(() => {
    el.classList.remove("no-transitions");
  });
};

const setTheme = (next: Theme) => {
  localStorage.setItem(STORAGE_KEY, next);
  notify();
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getStoredTheme, getServerTheme);
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    getResolvedTheme,
    getServerResolvedTheme
  );

  // Keep the <html> class in sync with the resolved theme (external system)
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  return { resolvedTheme, setTheme, theme } as const;
};
