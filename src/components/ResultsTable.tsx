"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { QueryResult, TableDataRow } from "@/types";

type Props = { result: QueryResult };

export function ResultsTable({ result }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo(() => {
    const helper = createColumnHelper<TableDataRow>();
    return result.columns.map((c) =>
      helper.accessor(c.accessorKey as string, {
        id: c.id,
        header: c.header,
        cell: (info) => {
          const value = info.getValue();
          return typeof value === "number" ? value : String(value ?? "");
        },
      })
    );
  }, [result.columns]);

  const table = useReactTable({
    data: result.rows as TableDataRow[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();

  function exportCsv() {
    const columnOrder = table.getAllColumns().filter((c) => c.getIsVisible());
    const headers = columnOrder.map((c) => c.id);
    const rows = table.getRowModel().rows.map((r) =>
      columnOrder.map((c) => {
        const val = r.getValue(c.id);
        if (val == null) return "";
        const str = String(val);
        return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col h-full">
      <div className="text-xs text-gray-600 dark:text-gray-300 px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
        <span>
          {result.rowCount.toLocaleString()} rows • {result.executionMs} ms
        </span>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Export results as CSV"
        >
          Export CSV
        </button>
      </div>
      <div
        className="overflow-auto scrollbar-thin flex-1 min-h-0"
        ref={containerRef}
      >
        <table className="min-w-full text-sm" style={{ minWidth: "600px" }}>
          <thead className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-2 sm:px-3 py-2 font-medium whitespace-nowrap min-w-[120px] select-none cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : "none"
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <span>▲</span>
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <span>▼</span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ position: "relative" }}>
            <tr>
              <td
                style={{
                  height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0,
                }}
                colSpan={columns.length}
              />
            </tr>
            {virtualItems.map((vi) => {
              const row = table.getRowModel().rows[vi.index];
              return (
                <tr
                  key={row.id}
                  className="border-b border-gray-50 dark:border-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-2 sm:px-3 py-2 whitespace-nowrap min-w-[120px]"
                    >
                      <div className="truncate max-w-[200px] sm:max-w-none">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <td
                style={{
                  height: Math.max(
                    0,
                    totalSize - (virtualItems.at(-1)?.end ?? 0)
                  ),
                }}
                colSpan={columns.length}
              />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
