"use client";

import * as React from "react";
import { useQueryStore } from "@/store/queryStore";

export function QuerySidebar() {
  const { predefined, createTab, savedQueries, deleteSavedQuery } =
    useQueryStore();
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return predefined;
    return predefined.filter(
      (q) =>
        q.title.toLowerCase().includes(s) ||
        q.description?.toLowerCase().includes(s) ||
        q.sql.toLowerCase().includes(s)
    );
  }, [search, predefined]);

  return (
    <aside className="w-full md:w-72 lg:w-80 border-r border-gray-200 dark:border-gray-800 p-3 md:p-4 flex flex-col gap-3 bg-gray-50/40 dark:bg-transparent">
      <input
        className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search queries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="text-xs text-gray-600 dark:text-gray-300">
        Predefined queries
      </div>
      <div className="flex-1 overflow-auto">
        <ul className="space-y-2">
          {filtered.map((q) => (
            <li key={q.id}>
              <button
                className="w-full text-left p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                onClick={() => createTab(q.title, q.sql)}
              >
                <div className="text-sm font-medium">{q.title}</div>
                {q.description ? (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {q.description}
                  </div>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {savedQueries.length ? (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Saved
          </div>
          <ul className="space-y-2">
            {savedQueries.map((s) => (
              <li
                key={s.id}
                className="group flex items-center justify-between gap-2"
              >
                <button
                  className="flex-1 text-left p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 transition truncate"
                  onClick={() => createTab(s.title, s.sql)}
                  title={s.title}
                >
                  <div className="text-sm font-medium truncate">{s.title}</div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 text-xs text-red-500 px-2 py-1"
                  onClick={() => deleteSavedQuery(s.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
