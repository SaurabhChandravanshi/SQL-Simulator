"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import type { QueryResult, TableDataRow } from "@/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type Props = { result: QueryResult };

export function ResultsTable({ result }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [showColumnsMenu, setShowColumnsMenu] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"table" | "chart">("table");
  const [chartType, setChartType] = React.useState<"bar" | "line">("bar");
  const [xKey, setXKey] = React.useState<string>("");
  const [yKeys, setYKeys] = React.useState<string[]>([]);

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

  // Derive default x/y options when result changes
  React.useEffect(() => {
    const firstString = result.columns.find((c) => {
      const v = (result.rows?.[0] ?? {})[c.accessorKey as string];
      return typeof v === "string";
    });
    const firstNumeric = result.columns.find((c) => {
      const v = (result.rows?.[0] ?? {})[c.accessorKey as string];
      return typeof v === "number";
    });
    setXKey((prev) => prev || (firstString?.accessorKey as string) || "");
    setYKeys((prev) =>
      prev.length
        ? prev
        : firstNumeric
        ? [firstNumeric.accessorKey as string]
        : []
    );
  }, [result.columns, result.rows]);

  // Aggregate data for chart if duplicate X values
  type ChartRow = Record<string, string | number>;
  const chartData = React.useMemo<ChartRow[]>(() => {
    if (!xKey || yKeys.length === 0) return [];
    const map = new Map<string, ChartRow>();
    for (const row of result.rows as TableDataRow[]) {
      const rawX = (row as Record<string, unknown>)[xKey];
      const key = String(rawX ?? "");
      if (!map.has(key)) map.set(key, { [xKey]: key });
      const agg = map.get(key)!;
      for (const y of yKeys) {
        const val = (row as Record<string, unknown>)[y];
        if (typeof val === "number") {
          const prev = typeof agg[y] === "number" ? (agg[y] as number) : 0;
          agg[y] = prev + val;
        }
      }
    }
    return Array.from(map.values());
  }, [result.rows, xKey, yKeys]);

  const table = useReactTable({
    data: result.rows as TableDataRow[],
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      columnOrder
        .map((c) => {
          const val = r.getValue(c.id);
          if (val == null) return "";
          const str = String(val);
          return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
        })
        .join(",")
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
      <div className="relative text-xs text-gray-600 dark:text-gray-300 px-3 py-2 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
        <span>
          {result.rowCount.toLocaleString()} rows • {result.executionMs} ms
        </span>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-xs">
            <button
              className={`px-2 py-1 rounded border ${
                viewMode === "table"
                  ? "bg-gray-200 dark:bg-gray-800"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => setViewMode("table")}
            >
              Table
            </button>
            <button
              className={`px-2 py-1 rounded border ${
                viewMode === "chart"
                  ? "bg-gray-200 dark:bg-gray-800"
                  : "border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => setViewMode("chart")}
            >
              Chart
            </button>
          </div>
          {viewMode === "chart" ? (
            <div className="flex items-center gap-2">
              <select
                className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-transparent"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                aria-label="Chart type"
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
              <select
                className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-transparent"
                value={xKey}
                onChange={(e) => setXKey(e.target.value)}
                aria-label="X axis"
              >
                {result.columns.map((c) => (
                  <option key={c.id} value={String(c.accessorKey)}>
                    {c.header}
                  </option>
                ))}
              </select>
              <select
                multiple
                className="border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-transparent"
                value={yKeys}
                onChange={(e) =>
                  setYKeys(
                    Array.from(e.target.selectedOptions).map((o) => o.value)
                  )
                }
                aria-label="Y axis"
              >
                {result.columns.map((c) => (
                  <option key={c.id} value={String(c.accessorKey)}>
                    {c.header}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu((v) => !v)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-haspopup="menu"
              aria-expanded={showColumnsMenu}
            >
              Columns
            </button>
            {showColumnsMenu ? (
              <div
                role="menu"
                className="absolute right-0 mt-1 z-20 w-56 max-h-64 overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md p-2 space-y-1"
              >
                {table.getAllLeafColumns().map((col) => (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={col.getIsVisible()}
                      onChange={col.getToggleVisibilityHandler()}
                    />
                    <span className="capitalize truncate">{col.id}</span>
                  </label>
                ))}
                <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => {
                      table.resetColumnVisibility();
                      setShowColumnsMenu(false);
                    }}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                  >
                    Reset columns
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Export results as CSV"
          >
            Export CSV
          </button>
        </div>
      </div>
      {/* Quick aggregations bar */}
      <div className="text-[11px] text-gray-600 dark:text-gray-300 px-3 py-1 bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 flex flex-wrap gap-3">
        {table
          .getAllLeafColumns()
          .filter((c) => c.getIsVisible())
          .map((col) => {
            // Try to compute aggregates if column has numeric values
            const colName = String(
              (col.columnDef.header as string) ?? col.id
            ).toLowerCase();
            const looksLikeIdentifier = /(id|code|postal|zip|phone|fax)/i.test(
              colName
            );
            if (looksLikeIdentifier) return null;
            const values = table
              .getRowModel()
              .rows.map((r) => r.getValue(col.id))
              .filter((v) => typeof v === "number") as number[];
            if (values.length < 2) return null;
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            return (
              <div key={col.id} className="flex items-center gap-2">
                <span className="font-medium capitalize">{col.id}</span>
                <span>sum: {sum}</span>
                <span>avg: {avg.toFixed(2)}</span>
                <span>min: {min}</span>
                <span>max: {max}</span>
              </div>
            );
          })}
      </div>
      {viewMode === "chart" ? (
        <div className="flex-1 min-h-0 p-3">
          <div className="w-full h-80 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <XAxis dataKey={xKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {yKeys.map((k, idx) => (
                    <Bar
                      key={k}
                      dataKey={k}
                      fill={
                        ["#60A5FA", "#34D399", "#F59E0B", "#F472B6"][idx % 4]
                      }
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <XAxis dataKey={xKey} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {yKeys.map((k, idx) => (
                    <Line
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stroke={
                        ["#60A5FA", "#34D399", "#F59E0B", "#F472B6"][idx % 4]
                      }
                      dot={false}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div
          className="overflow-auto scrollbar-thin flex-1 min-h-0"
          ref={containerRef}
        >
          <table className="min-w-full text-sm" style={{ minWidth: "600px" }}>
            <thead className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
              {table.getHeaderGroups().map((hg) => (
                <React.Fragment key={hg.id}>
                  <tr>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-2 sm:px-3 py-2 font-medium whitespace-nowrap min-w-[120px] select-none cursor-pointer align-bottom"
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
                  <tr>
                    {hg.headers.map((header) => (
                      <th key={header.id} className="px-2 sm:px-3 pb-2">
                        {header.column.getCanFilter() ? (
                          <input
                            className="w-full bg-transparent border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-xs"
                            placeholder={`Filter ${String(header.column.id)}`}
                            value={
                              (header.column.getFilterValue() as string) ?? ""
                            }
                            onChange={(e) =>
                              header.column.setFilterValue(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : null}
                      </th>
                    ))}
                  </tr>
                </React.Fragment>
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
      )}
    </div>
  );
}
