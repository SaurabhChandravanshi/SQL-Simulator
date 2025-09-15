"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { QuerySidebar } from "@/components/QuerySidebar";
import { Tabs } from "@/components/Tabs";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { useQueryStore } from "@/store/queryStore";

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
  } = useQueryStore();
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);
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
    </div>
  );
}
