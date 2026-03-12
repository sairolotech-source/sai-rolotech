import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./use-auth";

const STORAGE_KEY = "sai_tool_usage";

type UsageCounts = Record<string, number>;

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}_${userId}` : `${STORAGE_KEY}_guest`;
}

function loadCounts(key: string): UsageCounts {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const sanitized: UsageCounts = {};
        for (const [k, v] of Object.entries(parsed)) {
          const num = Number(v);
          if (num > 0 && Number.isFinite(num)) {
            sanitized[k] = Math.floor(num);
          }
        }
        return sanitized;
      }
    }
  } catch {}
  return {};
}

function saveCounts(key: string, counts: UsageCounts) {
  try {
    localStorage.setItem(key, JSON.stringify(counts));
  } catch {}
}

export function useToolUsage() {
  const { user } = useAuth();
  const storageKey = getStorageKey(user?.id);
  const [counts, setCounts] = useState<UsageCounts>(() => loadCounts(storageKey));

  useEffect(() => {
    setCounts(loadCounts(storageKey));
  }, [storageKey]);

  const recordUsage = useCallback(
    (toolPath: string) => {
      setCounts((prev) => {
        const updated = { ...prev, [toolPath]: (prev[toolPath] || 0) + 1 };
        saveCounts(storageKey, updated);
        return updated;
      });
    },
    [storageKey],
  );

  const getCount = useCallback(
    (toolPath: string): number => counts[toolPath] || 0,
    [counts],
  );

  const sortByUsage = useCallback(
    <T extends { path: string }>(tools: T[]): T[] => {
      return [...tools].sort((a, b) => {
        const ca = counts[a.path] || 0;
        const cb = counts[b.path] || 0;
        return cb - ca;
      });
    },
    [counts],
  );

  const getTopTools = useCallback(
    <T extends { path: string }>(tools: T[], n: number): T[] => {
      const used = tools.filter((t) => (counts[t.path] || 0) > 0);
      return used
        .sort((a, b) => (counts[b.path] || 0) - (counts[a.path] || 0))
        .slice(0, n);
    },
    [counts],
  );

  const isTopPick = useCallback(
    <T extends { path: string }>(tool: T, allTools: T[], topN = 3): boolean => {
      const used = allTools.filter((t) => (counts[t.path] || 0) > 0);
      if (used.length === 0) return false;
      const sorted = used.sort(
        (a, b) => (counts[b.path] || 0) - (counts[a.path] || 0),
      );
      const topPaths = sorted.slice(0, topN).map((t) => t.path);
      return topPaths.includes(tool.path);
    },
    [counts],
  );

  const resetUsage = useCallback(() => {
    setCounts({});
    saveCounts(storageKey, {});
  }, [storageKey]);

  const hasAnyUsage = Object.values(counts).some((c) => c > 0);

  return { recordUsage, getCount, sortByUsage, getTopTools, isTopPick, resetUsage, hasAnyUsage, counts };
}
