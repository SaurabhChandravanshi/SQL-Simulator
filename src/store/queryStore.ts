"use client";

import { create } from "zustand";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/persistence";
import type { PredefinedQuery, QueryResult, SqlTab } from "@/types";
import { predefinedQueries, resolveNorthwindResult } from "@/data/queries";

type QueryState = {
  tabs: SqlTab[];
  activeTabId: string | null;
  resultsByTabId: Record<string, QueryResult | null>;
  loadingByTabId: Record<string, boolean>;
  historyByTabId: Record<string, string[]>;
  historyIndexByTabId: Record<string, number>;
  savedQueries: { id: string; title: string; sql: string; createdAt: number }[];
  predefined: PredefinedQuery[];
  createTab: (title?: string, query?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateQuery: (id: string, query: string) => void;
  runQuery: (id: string) => Promise<void>;
  clearResult: (id: string) => void;
  historyBack: (id: string) => void;
  historyForward: (id: string) => void;
  historySnapshot: (id: string) => void;
  saveCurrentQuery: (id: string) => void;
  deleteSavedQuery: (id: string) => void;
  hydrate: () => void;
};

const STORAGE_KEY = "atlan-sql-tabs-v1";

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export const useQueryStore = create<QueryState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  resultsByTabId: {},
  loadingByTabId: {},
  historyByTabId: {},
  historyIndexByTabId: {},
  savedQueries: [],
  predefined: predefinedQueries,

  hydrate: () => {
    const saved = loadFromLocalStorage<
      Pick<QueryState, "tabs" | "activeTabId">
    >(STORAGE_KEY, {
      tabs: [],
      activeTabId: null,
    });
    if (saved.tabs.length === 0) {
      const first = {
        id: uid(),
        title: "Query 1",
        query: predefinedQueries[0]?.sql ?? "SELECT 1;",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } satisfies SqlTab;
      set({ tabs: [first], activeTabId: first.id });
      saveToLocalStorage(STORAGE_KEY, { tabs: [first], activeTabId: first.id });
    } else {
      set({ tabs: saved.tabs, activeTabId: saved.activeTabId });
    }
  },

  createTab: (title = "New Query", query = "") => {
    const newTab: SqlTab = {
      id: uid(),
      title,
      query,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const tabs = [...get().tabs, newTab];
    set({
      tabs,
      activeTabId: newTab.id,
      historyByTabId: {
        ...get().historyByTabId,
        [newTab.id]: query ? [query] : [],
      },
      historyIndexByTabId: {
        ...get().historyIndexByTabId,
        [newTab.id]: query ? 0 : -1,
      },
    });
    saveToLocalStorage(STORAGE_KEY, { tabs, activeTabId: newTab.id });
  },

  closeTab: (id) => {
    const remaining = get().tabs.filter((t) => t.id !== id);
    let active = get().activeTabId;
    if (active === id) {
      active = remaining.length ? remaining[remaining.length - 1].id : null;
    }
    const { [id]: _omit, ...rest } = get().resultsByTabId;
    const { [id]: _lOmit, ...restLoading } = get().loadingByTabId;
    const { [id]: _hOmit, ...restHistory } = get().historyByTabId;
    const { [id]: _hiOmit, ...restHistoryIdx } = get().historyIndexByTabId;
    set({
      tabs: remaining,
      activeTabId: active,
      resultsByTabId: rest,
      loadingByTabId: restLoading,
      historyByTabId: restHistory,
      historyIndexByTabId: restHistoryIdx,
    });
    saveToLocalStorage(STORAGE_KEY, { tabs: remaining, activeTabId: active });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateQuery: (id, query) => {
    const tabs = get().tabs.map((t) =>
      t.id === id ? { ...t, query, updatedAt: Date.now() } : t
    );
    set({ tabs });
    saveToLocalStorage(STORAGE_KEY, { tabs, activeTabId: get().activeTabId });
  },

  runQuery: async (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    set({ loadingByTabId: { ...get().loadingByTabId, [id]: true } });
    // push query into history if different from last snapshot
    const history = get().historyByTabId[id] ?? [];
    const last = history.length ? history[history.length - 1] : undefined;
    if (tab.query && tab.query !== last) {
      const nextHistory = [...history, tab.query];
      set({
        historyByTabId: { ...get().historyByTabId, [id]: nextHistory },
        historyIndexByTabId: {
          ...get().historyIndexByTabId,
          [id]: nextHistory.length - 1,
        },
      });
    }
    const match =
      get().predefined.find(
        (p) =>
          tab.query.includes(p.title.split(":")[0]) || tab.query.includes(p.id)
      ) ?? get().predefined[0];
    try {
      const data = await resolveNorthwindResult(match.id);
      const resultsByTabId = { ...get().resultsByTabId, [id]: data };
      set({ resultsByTabId });
    } catch {
      const resultsByTabId = { ...get().resultsByTabId, [id]: match.result };
      set({ resultsByTabId });
    }
    const { [id]: _omit, ...restLoading } = get().loadingByTabId;
    set({ loadingByTabId: restLoading });
  },

  clearResult: (id) => {
    const results = { ...get().resultsByTabId, [id]: null };
    set({ resultsByTabId: results });
  },

  historyBack: (id) => {
    const idx = (get().historyIndexByTabId[id] ?? -1) - 1;
    const items = get().historyByTabId[id] ?? [];
    if (idx >= 0 && items[idx] != null) {
      const tabs = get().tabs.map((t) =>
        t.id === id ? { ...t, query: items[idx], updatedAt: Date.now() } : t
      );
      set({
        tabs,
        historyIndexByTabId: { ...get().historyIndexByTabId, [id]: idx },
      });
      saveToLocalStorage(STORAGE_KEY, { tabs, activeTabId: get().activeTabId });
    }
  },
  historyForward: (id) => {
    const idx = (get().historyIndexByTabId[id] ?? -1) + 1;
    const items = get().historyByTabId[id] ?? [];
    if (idx < items.length && items[idx] != null) {
      const tabs = get().tabs.map((t) =>
        t.id === id ? { ...t, query: items[idx], updatedAt: Date.now() } : t
      );
      set({
        tabs,
        historyIndexByTabId: { ...get().historyIndexByTabId, [id]: idx },
      });
      saveToLocalStorage(STORAGE_KEY, { tabs, activeTabId: get().activeTabId });
    }
  },

  historySnapshot: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    const history = get().historyByTabId[id] ?? [];
    const last = history.length ? history[history.length - 1] : undefined;
    if (tab.query && tab.query !== last) {
      const nextHistory = [...history, tab.query];
      set({
        historyByTabId: { ...get().historyByTabId, [id]: nextHistory },
        historyIndexByTabId: {
          ...get().historyIndexByTabId,
          [id]: nextHistory.length - 1,
        },
      });
    }
  },

  saveCurrentQuery: (id) => {
    const tab = get().tabs.find((t) => t.id === id);
    if (!tab) return;
    const entry = {
      id: uid(),
      title: tab.title || "Saved Query",
      sql: tab.query,
      createdAt: Date.now(),
    };
    set({ savedQueries: [entry, ...get().savedQueries] });
  },
  deleteSavedQuery: (id) => {
    set({ savedQueries: get().savedQueries.filter((q) => q.id !== id) });
  },
}));
