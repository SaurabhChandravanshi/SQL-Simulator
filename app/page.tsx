"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { QuerySidebar } from "@/components/QuerySidebar";
import { Tabs } from "@/components/Tabs";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { useQueryStore } from "@/store/queryStore";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const {
    activeTabId,
    resultsByTabId,
    loadingByTabId,
    hydrate,
    createTab,
    runQuery,
    closeTab,
    clearResult,
    updateQuery,
    tabs,
    setActiveTab,
  } = useQueryStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);
  // Initialize from URL: tab and query
  React.useEffect(() => {
    const tabParam = searchParams.get("tab");
    const qParam = searchParams.get("q");
    if (tabParam && tabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
      if (qParam != null) {
        updateQuery(tabParam, qParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when active tab or its query changes
  React.useEffect(() => {
    if (!activeTabId) return;
    const tab = tabs.find((t) => t.id === activeTabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTabId);
    if (tab?.query) params.set("q", tab.query);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTabId, tabs, router, searchParams]);
  const result = activeTabId ? resultsByTabId[activeTabId] : null;
  const isLoading = activeTabId ? !!loadingByTabId[activeTabId] : false;

  // Keyboard shortcuts: Run (Cmd/Ctrl+Enter), New (Cmd/Ctrl+N), Close (Cmd/Ctrl+W), Clear (Cmd/Ctrl+L)
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;
      if (e.key === "Enter") {
        if (activeTabId) {
          e.preventDefault();
          void runQuery(activeTabId);
        }
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        createTab("New Query");
      } else if (e.key.toLowerCase() === "w") {
        if (activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
      } else if (e.key.toLowerCase() === "l") {
        if (activeTabId) {
          e.preventDefault();
          clearResult(activeTabId);
          updateQuery(activeTabId, "");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeTabId, runQuery, createTab, closeTab, clearResult, updateQuery]);

  // Command palette (Ctrl/Cmd+K)
  const [showPalette, setShowPalette] = React.useState(false);
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="font-semibold">SQL Simulator</div>
        <button
          className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          onClick={() => createTab("New Query")}
        >
          <Plus size={16} />
          New Query
        </button>
      </header>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-0 overflow-hidden">
        <QuerySidebar />
        <main className="min-h-0 flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <Tabs />
          </div>
          {activeTabId ? (
            <div className="flex-1 p-4 space-y-4 overflow-auto min-h-0">
              <QueryEditor tabId={activeTabId} />
              {isLoading ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 animate-pulse">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                  <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                </div>
              ) : result ? (
                <ResultsTable result={result} />
              ) : null}
            </div>
          ) : (
            <div className="flex-1 p-8 flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-gray-500">
                Create or select a query to begin.
              </p>
              <button
                className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => createTab("New Query")}
              >
                <Plus size={16} />
                New Query
              </button>
            </div>
          )}
        </main>
      </div>
      {showPalette ? (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 p-4"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="w-full max-w-md rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 dark:border-gray-800 p-2">
              <input
                autoFocus
                placeholder="Type a command… (run, new, close, clear, export)"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="p-2 text-sm">
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                <li
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3"
                  onClick={() => {
                    if (activeTabId) void runQuery(activeTabId);
                    setShowPalette(false);
                  }}
                >
                  Run query
                </li>
                <li
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3"
                  onClick={() => {
                    createTab("New Query");
                    setShowPalette(false);
                  }}
                >
                  New query
                </li>
                <li
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3"
                  onClick={() => {
                    if (activeTabId) {
                      clearResult(activeTabId);
                      updateQuery(activeTabId, "");
                    }
                    setShowPalette(false);
                  }}
                >
                  Clear
                </li>
                <li
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-3"
                  onClick={() => {
                    if (activeTabId) closeTab(activeTabId);
                    setShowPalette(false);
                  }}
                >
                  Close tab
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
