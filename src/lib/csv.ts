import Papa from "papaparse";
import type { TableColumn, TableDataRow, QueryResult } from "@/types";

export async function loadCsvAsQueryResult(
  url: string,
  limit?: number
): Promise<QueryResult> {
  const csvText = await fetch(url, { cache: "force-cache" }).then((r) =>
    r.text()
  );
  const parsed = Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  const rows = (parsed.data as unknown as TableDataRow[]).filter(Boolean);
  const sample = rows[0] ?? {};
  const columns: TableColumn[] = Object.keys(sample).map((key) => ({
    id: key,
    header: key.replace(/_/g, " ").toUpperCase(),
    accessorKey: key,
  }));
  const sliced = typeof limit === "number" ? rows.slice(0, limit) : rows;
  return {
    columns,
    rows: sliced,
    rowCount: sliced.length,
    executionMs: Math.floor(Math.random() * 20) + 5,
  };
}
