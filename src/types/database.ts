export interface ColumnInfo {
  name: string;
  data_type: string;
  is_primary_key: boolean;
  is_nullable: boolean;
  default_value: string | null;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  row_count: number;
  create_sql: string | null;
}

export interface ViewInfo {
  name: string;
  create_sql: string | null;
}

export interface IndexInfo {
  name: string;
  table_name: string;
  columns: string[];
  is_unique: boolean;
}

export interface DatabaseInfo {
  id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  tables: number;
  views: number;
  indexes: number;
  opened_at: string;
  schema?: SchemaInfo;
}

export interface SchemaInfo {
  tables: TableInfo[];
  views: ViewInfo[];
  indexes: IndexInfo[];
}

export type { SortColumn, FilterCondition } from './query';
