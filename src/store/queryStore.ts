"use client";

import { create } from "zustand";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/persistence";
import type { PredefinedQuery, QueryResult, SqlTab } from "@/types";
import { predefinedQueries, resolveNorthwindResult } from "@/data/queries";

type QueryState = {
  tabs: SqlTab[];
  activeTabId: string | null;
  resultsByTabId: Record<string, QueryResult | null>;
  predefined: PredefinedQuery[];
  createTab: (title?: string, query?: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateQuery: (id: string, query: string) => void;
  runQuery: (id: string) => Promise<void>;
  clearResult: (id: string) => void;
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
    set({ tabs, activeTabId: newTab.id });
    saveToLocalStorage(STORAGE_KEY, { tabs, activeTabId: newTab.id });
  },

  closeTab: (id) => {
    const remaining = get().tabs.filter((t) => t.id !== id);
    let active = get().activeTabId;
    if (active === id) {
      active = remaining.length ? remaining[remaining.length - 1].id : null;
    }
    const { [id]: _omit, ...rest } = get().resultsByTabId;
    set({ tabs: remaining, activeTabId: active, resultsByTabId: rest });
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
  },

  clearResult: (id) => {
    const results = { ...get().resultsByTabId, [id]: null };
    set({ resultsByTabId: results });
  },
}));
