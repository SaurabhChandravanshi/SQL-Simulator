"use client";

import { useEffect, useMemo, useRef } from "react";
import { Toolbar } from "@/components/Toolbar";
import { useQueryStore } from "@/store/queryStore";

type Props = { tabId: string };

export function QueryEditor({ tabId }: Props) {
  const {
    tabs,
    updateQuery,
    runQuery,
    clearResult,
    resultsByTabId,
    historyBack,
    historyForward,
    historyByTabId,
    historyIndexByTabId,
    historySnapshot,
  } = useQueryStore();
  const tab = useMemo(() => tabs.find((t) => t.id === tabId), [tabs, tabId]);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textRef.current && tab) {
      textRef.current.value = tab.query;
    }
  }, [tabId, tab]);

  // Debounced history snapshot after 3s idle (must be before any early returns)
  useEffect(() => {
    if (!tab) return;
    const handle = setTimeout(() => historySnapshot(tabId), 3000);
    return () => clearTimeout(handle);
  }, [tab?.query, tabId, historySnapshot, tab]);

  if (!tab) return null;

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateQuery(tabId, e.target.value);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(tab.query);
    } catch {}
  };

  const onClear = () => {
    clearResult(tabId);
    updateQuery(tabId, "");
    if (textRef.current) {
      textRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Toolbar
        onRun={() => runQuery(tabId)}
        onClear={onClear}
        onCopy={onCopy}
        onHistoryBack={() => historyBack(tabId)}
        onHistoryForward={() => historyForward(tabId)}
        canHistoryBack={(historyIndexByTabId[tabId] ?? -1) > 0}
        canHistoryForward={
          (historyIndexByTabId[tabId] ?? -1) + 1 <
          (historyByTabId[tabId]?.length ?? 0)
        }
      />
      <textarea
        ref={textRef}
        onChange={onInput}
        spellCheck={false}
        className="w-full h-48 md:h-56 lg:h-64 resize-y rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write SQL here..."
        defaultValue={tab.query}
      />
      {resultsByTabId[tabId] == null ? (
        <p className="text-xs text-gray-500">
          No results yet. Run a query to see results.
        </p>
      ) : null}
    </div>
  );
}
