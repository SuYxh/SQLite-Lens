const SUPPORTED_EXTENSIONS = ['.db', '.sqlite', '.sqlite3', '.s3db'];

export function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return '';
  return path.slice(lastDot).toLowerCase();
}

export function isSupportedFile(path: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getFileExtension(path));
}

export function getFileName(path: string): string {
  const separator = path.includes('\\') ? '\\' : '/';
  const parts = path.split(separator);
  return parts[parts.length - 1] || '';
}
