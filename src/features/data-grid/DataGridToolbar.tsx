import { useState } from 'react';
import { RefreshCw, Filter, Plus, Trash2, Download } from 'lucide-react';
import { useTableStore } from '@/stores/tableStore';
import { useEditStore } from '@/stores/editStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import type { ColumnInfo } from '@/types/database';
import * as editService from '@/services/edit';
import AddRowDialog from './AddRowDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ExportDialog from '@/features/export/ExportDialog';

interface DataGridToolbarProps {
  onToggleFilter: () => void;
  filterOpen: boolean;
}

export default function DataGridToolbar({
  onToggleFilter,
  filterOpen,
}: DataGridToolbarProps) {
  const activeTable = useTableStore((s) => s.activeTable);
  const fetchData = useTableStore((s) => s.fetchData);
  const filters = useTableStore((s) => s.filters);
  const selectedRows = useEditStore((s) => s.selectedRows);
  const clearSelection = useEditStore((s) => s.clearSelection);
  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const databases = useDatabaseStore((s) => s.databases);

  const [addRowOpen, setAddRowOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const activeDb = databases.find((db) => db.id === activeDbId);
  const tableInfo = activeDb?.schema?.tables.find((t) => t.name === activeTable);
  const tableColumns: ColumnInfo[] = tableInfo?.columns ?? [];
  const pkColumn = tableColumns.find((c) => c.is_primary_key);

  const handleInsert = async (values: Record<string, unknown>) => {
    if (!activeDbId || !activeTable) return;
    await editService.insertRow(activeDbId, activeTable, values);
    fetchData();
  };

  const handleDelete = async () => {
    if (!activeDbId || !activeTable || !pkColumn) return;
    const data = useTableStore.getState().data;
    const colIdx = useTableStore.getState().columns.indexOf(pkColumn.name);
    const pkValues = Array.from(selectedRows).map((rowIdx) => data[rowIdx]?.[colIdx]);
    await editService.deleteRows(activeDbId, activeTable, pkColumn.name, pkValues);
    clearSelection();
    setDeleteOpen(false);
    fetchData();
  };

  const defaultQuery = activeTable ? `SELECT * FROM ${activeTable}` : '';

  return (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-secondary">
        <span className="text-sm font-medium text-text-primary">
          {activeTable}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAddRowOpen(true)}
            className="p-1.5 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors"
            title="Add Row"
          >
            <Plus className="w-4 h-4" />
          </button>
          {selectedRows.size > 0 && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-1.5 rounded-md text-error hover:bg-error/10 transition-colors"
              title="Delete selected rows"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setExportOpen(true)}
            className="p-1.5 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleFilter}
            className={`relative p-1.5 rounded-md transition-colors ${
              filterOpen ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-bg-tertiary'
            }`}
          >
            <Filter className="w-4 h-4" />
            {filters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                {filters.length}
              </span>
            )}
          </button>
          <button
            onClick={() => fetchData()}
            className="p-1.5 rounded-md text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AddRowDialog
        open={addRowOpen}
        onClose={() => setAddRowOpen(false)}
        columns={tableColumns}
        onInsert={handleInsert}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        count={selectedRows.size}
        onConfirm={handleDelete}
        tableName={activeTable ?? undefined}
        pkColumn={pkColumn?.name}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        defaultQuery={defaultQuery}
      />
    </>
  );
}
