import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type UiStyleId = "android" | "ios";

export interface UiStyleOption {
  id: UiStyleId;
  name: string;
  description: string;
}

export const UI_STYLE_OPTIONS: UiStyleOption[] = [
  { id: "android", name: "Android", description: "Material Design" },
  { id: "ios", name: "iOS", description: "Apple HIG" },
];

const STORAGE_KEY = "sai-rolotech-ui-style";
const ALL_UI_STYLE_CLASSES = ["ui-android", "ui-ios"];
const VALID_STYLE_IDS = new Set<string>(["android", "ios"]);

interface UiStyleContextValue {
  uiStyle: UiStyleId;
  setUiStyle: (id: UiStyleId) => void;
  styles: UiStyleOption[];
}

const UiStyleContext = createContext<UiStyleContextValue | null>(null);

function getStoredStyle(): UiStyleId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_STYLE_IDS.has(stored)) return stored as UiStyleId;
  } catch {}
  return "ios";
}

function applyStyle(id: UiStyleId) {
  const root = document.documentElement;
  root.classList.remove(...ALL_UI_STYLE_CLASSES);
  root.classList.add(`ui-${id}`);
}

export function UiStyleProvider({ children }: { children: ReactNode }) {
  const [uiStyle, setStyleState] = useState<UiStyleId>(getStoredStyle);

  useEffect(() => {
    applyStyle(uiStyle);
  }, [uiStyle]);

  const setUiStyle = useCallback((id: UiStyleId) => {
    setStyleState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }, []);

  return (
    <UiStyleContext.Provider value={{ uiStyle, setUiStyle, styles: UI_STYLE_OPTIONS }}>
      {children}
    </UiStyleContext.Provider>
  );
}

export function useUiStyle() {
  const ctx = useContext(UiStyleContext);
  if (!ctx) throw new Error("useUiStyle must be used within a UiStyleProvider");
  return ctx;
}
