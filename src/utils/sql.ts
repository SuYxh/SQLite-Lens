export function isSelectQuery(sql: string): boolean {
  const trimmed = sql.trim().toLowerCase();
  return trimmed.startsWith('select') || trimmed.startsWith('pragma') || trimmed.startsWith('explain');
}

export function extractStatements(sql: string): string[] {
  return sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function getKeywordAtPosition(sql: string, position: number): string | null {
  if (position < 0 || position > sql.length) return null;

  let start = position;
  while (start > 0 && /\w/.test(sql[start - 1])) {
    start--;
  }

  let end = position;
  while (end < sql.length && /\w/.test(sql[end])) {
    end++;
  }

  const word = sql.slice(start, end);
  return word.length > 0 ? word : null;
}
