import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type ThemeId = "light" | "dark" | "steel" | "midnight" | "sunrise";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  previewColors: [string, string];
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "light", name: "Light", previewColors: ["#ffffff", "#0077FF"] },
  { id: "dark", name: "Dark", previewColors: ["#0a0f1e", "#00D4FF"] },
  { id: "steel", name: "Industrial Steel", previewColors: ["#1e2128", "#e87a20"] },
  { id: "midnight", name: "Midnight Purple", previewColors: ["#0d0520", "#8c50ff"] },
  { id: "sunrise", name: "Sunrise Gold", previewColors: ["#faf5e8", "#e5a000"] },
];

const STORAGE_KEY = "sai-rolotech-theme";

const THEME_CLASSES: Record<ThemeId, string[]> = {
  light: [],
  dark: ["dark"],
  steel: ["dark", "theme-steel"],
  midnight: ["dark", "theme-midnight"],
  sunrise: ["theme-sunrise"],
};

const ALL_THEME_CLASSES = ["dark", "theme-steel", "theme-midnight", "theme-sunrise"];

const VALID_THEME_IDS = new Set<string>(Object.keys(THEME_CLASSES));

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEME_IDS.has(stored)) return stored as ThemeId;
  } catch {}
  return "light";
}

function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  const classes = THEME_CLASSES[id];
  if (classes.length) root.classList.add(...classes);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEME_OPTIONS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
