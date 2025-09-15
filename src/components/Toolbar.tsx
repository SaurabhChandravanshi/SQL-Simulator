"use client";

import { Copy, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

type ToolbarProps = {
  onRun: () => void;
  onClear: () => void;
  onCopy: () => void;
  onNewTab: () => void;
  disabled?: boolean;
  onHistoryBack?: () => void;
  onHistoryForward?: () => void;
  canHistoryBack?: boolean;
  canHistoryForward?: boolean;
};

export function Toolbar({
  onRun,
  onClear,
  onCopy,
  onNewTab,
  disabled,
  onHistoryBack,
  onHistoryForward,
  canHistoryBack,
  canHistoryForward,
}: ToolbarProps) {
  const baseBtn =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors";
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button
          className={clsx(
            baseBtn,
            "bg-white border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 disabled:opacity-50"
          )}
          onClick={onHistoryBack}
          disabled={disabled || !canHistoryBack}
          aria-label="History back"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          className={clsx(
            baseBtn,
            "bg-white border-gray-200 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 disabled:opacity-50"
          )}
          onClick={onHistoryForward}
          disabled={disabled || !canHistoryForward}
          aria-label="History forward"
        >
          <ChevronRight size={16} /> Forward
        </button>
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
      {/* Removed New Tab button here; New Query button lives in header */}
    </div>
  );
}
