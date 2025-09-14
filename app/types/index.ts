export type SqlTab = {
  id: string;
  title: string;
  query: string;
  createdAt: number;
  updatedAt: number;
};

export type TableColumn = {
  id: string;
  header: string;
  accessorKey: string;
};

export type TableDataRow = Record<string, unknown>;

export type QueryResult = {
  columns: TableColumn[];
  rows: TableDataRow[];
  rowCount: number;
  executionMs: number;
};

export type PredefinedQuery = {
  id: string;
  title: string;
  description?: string;
  sql: string;
  result: QueryResult;
};
