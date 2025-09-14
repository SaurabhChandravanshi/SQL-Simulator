import type {
  PredefinedQuery,
  QueryResult,
  TableColumn,
  TableDataRow,
} from "@/types";
import { loadCsvAsQueryResult } from "@/lib/csv";

function makeColumns(keys: string[]): TableColumn[] {
  return keys.map((k) => ({
    id: k,
    header: k.replace(/_/g, " ").toUpperCase(),
    accessorKey: k,
  }));
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

const usersColumns = makeColumns(["id", "name", "email", "age", "country"]);
const usersRows = range(1000).map((i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 18 + ((i * 7) % 50),
  country: ["US", "UK", "DE", "IN", "SG"][i % 5],
}));

const salesColumns = makeColumns([
  "order_id",
  "sku",
  "region",
  "quantity",
  "price_usd",
]);
const salesRows = range(5000).map((i) => ({
  order_id: 100000 + i,
  sku: `SKU-${(i % 250).toString().padStart(4, "0")}`,
  region: ["NA", "EMEA", "APAC"][i % 3],
  quantity: 1 + (i % 20),
  price_usd: Number((10 + (i % 50) * 0.75).toFixed(2)),
}));

const teamsColumns = makeColumns(["team", "members", "active_projects"]);
const teamsRows = [
  { team: "Analytics", members: 8, active_projects: 3 },
  { team: "Data Platform", members: 12, active_projects: 5 },
  { team: "Security", members: 6, active_projects: 2 },
  { team: "Governance", members: 9, active_projects: 4 },
];

function buildResult(
  columns: typeof usersColumns,
  rows: TableDataRow[]
): QueryResult {
  return {
    columns,
    rows,
    rowCount: rows.length,
    executionMs: Math.floor(Math.random() * 20) + 5,
  };
}

const NORTHWIND_BASE =
  "https://raw.githubusercontent.com/graphql-compose/graphql-compose-examples/master/examples/northwind/data/csv";

export const predefinedQueries: PredefinedQuery[] = [
  {
    id: "nw_customers",
    title: "Customers",
    description: "First 200 customers",
    sql: "SELECT * FROM Customers LIMIT 200;",
    result: buildResult(
      [
        {
          id: "placeholder",
          header: "PLACEHOLDER",
          accessorKey: "placeholder",
        },
      ],
      []
    ),
  },
  {
    id: "nw_orders",
    title: "Orders",
    description: "Orders sample (virtualized)",
    sql: "SELECT * FROM Orders;",
    result: buildResult(
      [
        {
          id: "placeholder",
          header: "PLACEHOLDER",
          accessorKey: "placeholder",
        },
      ],
      []
    ),
  },
  {
    id: "nw_products",
    title: "Products",
    description: "Products sample",
    sql: "SELECT * FROM Products;",
    result: buildResult(
      [
        {
          id: "placeholder",
          header: "PLACEHOLDER",
          accessorKey: "placeholder",
        },
      ],
      []
    ),
  },
];

export async function resolveNorthwindResult(id: string): Promise<QueryResult> {
  switch (id) {
    case "nw_customers":
      return loadCsvAsQueryResult(`${NORTHWIND_BASE}/customers.csv`, 200);
    case "nw_orders":
      return loadCsvAsQueryResult(`${NORTHWIND_BASE}/orders.csv`);
    case "nw_products":
      return loadCsvAsQueryResult(`${NORTHWIND_BASE}/products.csv`);
    default:
      return loadCsvAsQueryResult(`${NORTHWIND_BASE}/customers.csv`, 100);
  }
}
