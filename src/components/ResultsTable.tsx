"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { QueryResult, TableDataRow } from "@/types";

type Props = { result: QueryResult };

export function ResultsTable({ result }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

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
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col h-full">
      <div className="text-xs text-gray-600 dark:text-gray-300 px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
        <span>
          {result.rowCount.toLocaleString()} rows • {result.executionMs} ms
        </span>
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
                    className="text-left px-2 sm:px-3 py-2 font-medium whitespace-nowrap min-w-[120px]"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
