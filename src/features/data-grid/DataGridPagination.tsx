import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTableStore } from '@/stores/tableStore';
import { formatNumber } from '@/utils/format';

export default function DataGridPagination() {
  const totalRows = useTableStore((s) => s.totalRows);
  const page = useTableStore((s) => s.page);
  const pageSize = useTableStore((s) => s.pageSize);
  const setPage = useTableStore((s) => s.setPage);
  const setPageSize = useTableStore((s) => s.setPageSize);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = page + 1;

  const goFirst = () => setPage(0);
  const goPrev = () => setPage(Math.max(0, page - 1));
  const goNext = () => setPage(Math.min(totalPages - 1, page + 1));
  const goLast = () => setPage(totalPages - 1);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setPage(val - 1);
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-bg-secondary text-sm">
      <span className="text-text-secondary text-xs">
        {formatNumber(totalRows)} rows
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={goFirst}
          disabled={page === 0}
          className="p-1 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goPrev}
          disabled={page === 0}
          className="p-1 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <input
            type="text"
            defaultValue={currentPage}
            key={currentPage}
            onKeyDown={handlePageInput}
            className="w-10 text-center bg-bg-primary border border-border rounded px-1 py-0.5 text-text-primary text-xs focus:outline-none focus:border-accent"
          />
          <span>/ {totalPages}</span>
        </div>

        <button
          onClick={goNext}
          disabled={page >= totalPages - 1}
          className="p-1 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goLast}
          disabled={page >= totalPages - 1}
          className="p-1 rounded hover:bg-bg-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-text-secondary transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        className="text-xs bg-bg-primary border border-border rounded px-2 py-1 text-text-primary focus:outline-none focus:border-accent"
      >
        {[50, 100, 200, 500, 1000].map((size) => (
          <option key={size} value={size}>
            {size} / page
          </option>
        ))}
      </select>
    </div>
  );
}
