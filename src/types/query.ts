export type Value = string | number | boolean | null;

export type FilterOperator =
  | 'Equals'
  | 'NotEquals'
  | 'Contains'
  | 'StartsWith'
  | 'EndsWith'
  | 'GreaterThan'
  | 'LessThan'
  | 'GreaterThanOrEqual'
  | 'LessThanOrEqual'
  | 'IsNull'
  | 'IsNotNull';

export interface SortColumn {
  column: string;
  direction: 'Asc' | 'Desc';
}

export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface QueryResult {
  columns: string[];
  rows: Value[][];
  affected_rows: number;
  execution_time_ms: number;
  is_select: boolean;
}

export interface TableDataParams {
  table_name: string;
  page: number;
  page_size: number;
  sort_columns: SortColumn[];
  filters: FilterCondition[];
}

export interface TableDataResult {
  columns: string[];
  rows: Value[][];
  total_rows: number;
  page: number;
  page_size: number;
}

export interface SqlTab {
  id: string;
  title: string;
  content: string;
  result: QueryResult | null;
  isExecuting: boolean;
  error: string | null;
  executionTime: number | null;
}
