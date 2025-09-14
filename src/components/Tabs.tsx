"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useQueryStore } from "@/store/queryStore";

export function Tabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useQueryStore();
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-0">
        <div className="flex items-center gap-2 min-w-max px-2">
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-t-md cursor-pointer flex-shrink-0 ${
                activeTabId === t.id
                  ? "bg-white dark:bg-gray-900 border-x border-t border-gray-200 dark:border-gray-800"
                  : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
              onClick={() => setActiveTab(t.id)}
            >
              <div className="text-sm whitespace-nowrap max-w-[150px] truncate">
                {t.title}
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(t.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
