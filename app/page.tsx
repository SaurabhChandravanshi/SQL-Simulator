"use client";

import * as React from "react";
import { QuerySidebar } from "@/components/QuerySidebar";
import { Tabs } from "@/components/Tabs";
import { QueryEditor } from "@/components/QueryEditor";
import { ResultsTable } from "@/components/ResultsTable";
import { useQueryStore } from "@/store/queryStore";

export default function Home() {
  const { activeTabId, resultsByTabId, hydrate } = useQueryStore();
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);
  const result = activeTabId ? resultsByTabId[activeTabId] : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="font-semibold">SQL Simulator</div>
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
              {result ? <ResultsTable result={result} /> : null}
            </div>
          ) : (
            <div className="flex-1 p-8 text-sm text-gray-500 flex items-center justify-center">
              Create or select a query to begin.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
