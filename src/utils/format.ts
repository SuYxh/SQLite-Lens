export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (value instanceof ArrayBuffer || value instanceof Uint8Array) return '[BLOB]';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
