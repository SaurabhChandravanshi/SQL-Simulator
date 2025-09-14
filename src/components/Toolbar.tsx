"use client";

import { Copy, Play, RotateCcw, Plus } from "lucide-react";
import { clsx } from "clsx";

type ToolbarProps = {
  onRun: () => void;
  onClear: () => void;
  onCopy: () => void;
  onNewTab: () => void;
  disabled?: boolean;
};

export function Toolbar({
  onRun,
  onClear,
  onCopy,
  onNewTab,
  disabled,
}: ToolbarProps) {
  const baseBtn =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors";
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button
          className={clsx(
            baseBtn,
            "bg-black text-white border-transparent hover:opacity-90 disabled:opacity-50"
          )}
          onClick={onRun}
          disabled={disabled}
          aria-label="Run query"
        >
          <Play size={16} /> Run
        </button>
        <button
          className={clsx(
            baseBtn,
            "bg-white border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700"
          )}
          onClick={onClear}
          disabled={disabled}
          aria-label="Clear results"
        >
          <RotateCcw size={16} /> Clear
        </button>
        <button
          className={clsx(
            baseBtn,
            "bg-white border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700"
          )}
          onClick={onCopy}
          aria-label="Copy SQL to clipboard"
        >
          <Copy size={16} /> Copy
        </button>
      </div>
      <button
        className={clsx(
          baseBtn,
          "bg-white border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700"
        )}
        onClick={onNewTab}
        aria-label="Open new tab"
      >
        <Plus size={16} /> New Tab
      </button>
    </div>
  );
}
