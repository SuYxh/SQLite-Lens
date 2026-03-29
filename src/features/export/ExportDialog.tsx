import { useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { FileSpreadsheet, FileJson, FileText, CheckCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDatabaseStore } from '@/stores/databaseStore';
import * as exportService from '@/services/export';
import ExportFormatCard from './ExportFormatCard';

type ExportFormat = 'csv' | 'json' | 'excel';
type ExportSource = 'current' | 'query' | 'all';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  defaultQuery?: string;
}

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: 'csv',
  json: 'json',
  excel: 'xlsx',
};

export default function ExportDialog({
  open,
  onClose,
  defaultQuery,
}: ExportDialogProps) {
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [source, setSource] = useState<ExportSource>('current');
  const [customQuery, setCustomQuery] = useState(defaultQuery ?? '');
  const [savePath, setSavePath] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);

  const [csvDelimiter, setCsvDelimiter] = useState(',');
  const [csvHeader, setCsvHeader] = useState(true);
  const [jsonFormat, setJsonFormat] = useState<'array' | 'records'>('records');
  const [jsonPretty, setJsonPretty] = useState(true);
  const [excelSheet, setExcelSheet] = useState('Sheet1');

  const handleChoosePath = async () => {
    const path = await save({
      filters: [
        {
          name: format.toUpperCase(),
          extensions: [FORMAT_EXTENSIONS[format]],
        },
      ],
    });
    if (path) setSavePath(path);
  };

  const getExportQuery = (): string => {
    if (source === 'query') return customQuery;
    if (source === 'all' && defaultQuery) {
      const match = defaultQuery.match(/FROM\s+(\S+)/i);
      if (match) return `SELECT * FROM ${match[1]}`;
    }
    return defaultQuery ?? '';
  };

  const handleExport = async () => {
    if (!activeDbId || !savePath) return;
    setIsExporting(true);
    setResultCount(null);
    try {
      const query = getExportQuery();
      let count = 0;
      if (format === 'csv') {
        count = await exportService.exportCsv(activeDbId, query, savePath, csvDelimiter);
      } else if (format === 'json') {
        count = await exportService.exportJson(activeDbId, query, savePath, jsonFormat);
      } else {
        count = await exportService.exportExcel(activeDbId, query, savePath);
      }
      setResultCount(count);
    } catch {
      setResultCount(-1);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setResultCount(null);
    setSavePath('');
    setIsExporting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Export Data" className="max-w-lg">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Format</span>
          <div className="grid grid-cols-3 gap-2">
            <ExportFormatCard
              format="csv"
              label="CSV"
              icon={<FileText className="h-6 w-6" />}
              description="Comma-separated values"
              selected={format === 'csv'}
              onClick={() => setFormat('csv')}
            />
            <ExportFormatCard
              format="json"
              label="JSON"
              icon={<FileJson className="h-6 w-6" />}
              description="JavaScript Object Notation"
              selected={format === 'json'}
              onClick={() => setFormat('json')}
            />
            <ExportFormatCard
              format="excel"
              label="Excel"
              icon={<FileSpreadsheet className="h-6 w-6" />}
              description="XLSX spreadsheet"
              selected={format === 'excel'}
              onClick={() => setFormat('excel')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Options</span>
          {format === 'csv' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-primary)]">Delimiter</span>
                <select
                  value={csvDelimiter}
                  onChange={(e) => setCsvDelimiter(e.target.value)}
                  className="h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 text-sm text-[var(--color-text-primary)] outline-none"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={csvHeader}
                  onChange={(e) => setCsvHeader(e.target.checked)}
                  className="rounded"
                />
                Include header row
              </label>
            </div>
          )}
          {format === 'json' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-primary)]">Format</span>
                <select
                  value={jsonFormat}
                  onChange={(e) => setJsonFormat(e.target.value as 'array' | 'records')}
                  className="h-7 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 text-sm text-[var(--color-text-primary)] outline-none"
                >
                  <option value="records">Array of Objects</option>
                  <option value="array">Array of Arrays</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={jsonPretty}
                  onChange={(e) => setJsonPretty(e.target.checked)}
                  className="rounded"
                />
                Pretty print
              </label>
            </div>
          )}
          {format === 'excel' && (
            <Input
              label="Sheet name"
              value={excelSheet}
              onChange={(e) => setExcelSheet(e.target.value)}
              className="h-7 text-sm"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Data Source</span>
          <div className="flex flex-col gap-1">
            {(['current', 'query', 'all'] as ExportSource[]).map((src) => (
              <label
                key={src}
                className="flex items-center gap-2 rounded px-2 py-1 text-sm text-[var(--color-text-primary)] cursor-pointer hover:bg-[var(--color-bg-secondary)]"
              >
                <input
                  type="radio"
                  name="exportSource"
                  checked={source === src}
                  onChange={() => setSource(src)}
                />
                {src === 'current' && 'Current table data (with filters)'}
                {src === 'query' && 'Custom SQL query'}
                {src === 'all' && 'All data (no filters)'}
              </label>
            ))}
          </div>
          {source === 'query' && (
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="SELECT * FROM ..."
              rows={3}
              className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleChoosePath}>
            Choose Save Location
          </Button>
          {savePath && (
            <span className="truncate text-xs text-[var(--color-text-muted)]">
              {savePath}
            </span>
          )}
        </div>

        {isExporting && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-accent)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            Exporting...
          </div>
        )}

        {resultCount !== null && resultCount >= 0 && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
            <CheckCircle className="h-4 w-4" />
            Exported {resultCount} rows successfully
          </div>
        )}

        {resultCount === -1 && (
          <div className="text-sm text-[var(--color-error)]">
            Export failed. Please check your query and try again.
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={!savePath || !activeDbId}
          >
            Export
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
