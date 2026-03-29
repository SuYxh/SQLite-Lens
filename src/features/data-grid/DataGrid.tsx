import { useState, useMemo, useRef, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { useTableStore } from '@/stores/tableStore';
import { useEditStore } from '@/stores/editStore';
import { useDatabaseStore } from '@/stores/databaseStore';
import type { Value } from '@/types/query';
import DataGridCell from './DataGridCell';
import DataGridToolbar from './DataGridToolbar';
import DataGridPagination from './DataGridPagination';
import FilterPanel from './FilterPanel';
import CellDetailDialog from './CellDetailDialog';
import CellEditor from './CellEditor';

const columnHelper = createColumnHelper<Value[]>();

export default function DataGrid() {
  const data = useTableStore((s) => s.data);
  const columns = useTableStore((s) => s.columns);
  const isLoading = useTableStore((s) => s.isLoading);
  const activeTable = useTableStore((s) => s.activeTable);
  const fetchData = useTableStore((s) => s.fetchData);
  const [filterOpen, setFilterOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedRows = useEditStore((s) => s.selectedRows);
  const pendingEdits = useEditStore((s) => s.pendingEdits);
  const toggleRowSelection = useEditStore((s) => s.toggleRowSelection);
  const selectAllRows = useEditStore((s) => s.selectAllRows);
  const clearSelection = useEditStore((s) => s.clearSelection);

  const [detailCell, setDetailCell] = useState<{
    value: unknown;
    columnName: string;
    columnType: string;
  } | null>(null);

  const [editingCell, setEditingCell] = useState<{
    rowIdx: number;
    colName: string;
    value: unknown;
    columnType: string;
  } | null>(null);

  const activeDbId = useDatabaseStore((s) => s.activeDbId);
  const databases = useDatabaseStore((s) => s.databases);
  const activeDb = databases.find((db) => db.id === activeDbId);
  const tableInfo = activeDb?.schema?.tables.find((t) => t.name === activeTable);
  const pkColumn = tableInfo?.columns.find((c) => c.is_primary_key);

  const getColumnType = useCallback(
    (colName: string) => {
      const col = tableInfo?.columns.find((c) => c.name === colName);
      return col?.data_type ?? '';
    },
    [tableInfo]
  );

  const tableColumns = useMemo(
    () =>
      columns.map((colName, idx) =>
        columnHelper.accessor((row) => row[idx], {
          id: colName,
          header: colName,
        })
      ),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 36,
    overscan: 20,
  });

  const handleCellClick = (value: unknown, colName: string) => {
    setDetailCell({
      value,
      columnName: colName,
      columnType: getColumnType(colName),
    });
  };

  const handleCellDoubleClick = (rowIdx: number, colName: string, value: unknown) => {
    setEditingCell({
      rowIdx,
      colName,
      value,
      columnType: getColumnType(colName),
    });
    useEditStore.getState().startEdit(rowIdx, colName, value);
  };

  const handleCellSave = async (newValue: unknown) => {
    if (!editingCell || !activeDbId || !activeTable || !pkColumn) return;
    const { rowIdx, colName } = editingCell;
    const colIdx = columns.indexOf(pkColumn.name);
    const pkValue = data[rowIdx]?.[colIdx];
    await useEditStore
      .getState()
      .commitEdit(activeDbId, activeTable, pkColumn.name, pkValue, colName, newValue);
    setEditingCell(null);
    fetchData();
  };

  const handleCellCancel = () => {
    if (editingCell) {
      useEditStore.getState().cancelEdit(editingCell.rowIdx, editingCell.colName);
    }
    setEditingCell(null);
  };

  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  const handleToggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllRows(rows.length);
    }
  };

  if (!activeTable) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Select a table to view data
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <DataGridToolbar
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen(!filterOpen)}
      />
      {filterOpen && <FilterPanel />}

      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        {isLoading && (
          <div className="absolute inset-0 bg-bg-primary/50 flex items-center justify-center z-20">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10 px-2 py-2 text-center text-xs font-semibold text-text-secondary bg-bg-secondary border-b border-r border-border">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                  className="rounded"
                />
              </th>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={() => useTableStore.getState().toggleSort(header.column.id)}
                    className="px-3 py-2 text-left text-xs font-semibold text-text-secondary bg-bg-secondary border-b border-r border-border cursor-pointer select-none hover:bg-bg-tertiary transition-colors whitespace-nowrap"
                    style={{ minWidth: 100 }}
                  >
                    {typeof header.column.columnDef.header === 'string'
                      ? header.column.columnDef.header
                      : header.column.id}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0, padding: 0, border: 'none' }}
                />
              </tr>
            )}
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              const rowIdx = virtualRow.index;
              const isSelected = selectedRows.has(rowIdx);
              return (
                <tr
                  key={row.id}
                  className={clsx(
                    'border-b border-border transition-colors',
                    isSelected ? 'bg-accent/10' : 'hover:bg-bg-secondary'
                  )}
                  style={{ height: 36 }}
                >
                  <td className="w-10 px-2 py-1.5 text-center border-r border-border">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelection(rowIdx)}
                      className="rounded"
                    />
                  </td>
                  {row.getVisibleCells().map((cell) => {
                    const colName = cell.column.id;
                    const cellKey = `${rowIdx}:${colName}`;
                    const pendingEdit = pendingEdits.get(cellKey);
                    const isEditingThis =
                      editingCell?.rowIdx === rowIdx && editingCell?.colName === colName;
                    const hasPendingChange =
                      pendingEdit && pendingEdit.original !== pendingEdit.current;

                    return (
                      <td
                        key={cell.id}
                        onClick={() => handleCellClick(cell.getValue(), colName)}
                        onDoubleClick={() =>
                          handleCellDoubleClick(rowIdx, colName, cell.getValue())
                        }
                        className={clsx(
                          'px-3 py-1.5 border-r border-border text-text-primary whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px] cursor-pointer',
                          hasPendingChange && 'bg-warning/10'
                        )}
                      >
                        {isEditingThis ? (
                          <CellEditor
                            value={editingCell.value}
                            columnType={editingCell.columnType}
                            onSave={handleCellSave}
                            onCancel={handleCellCancel}
                          />
                        ) : (
                          <DataGridCell
                            value={pendingEdit ? pendingEdit.current : cell.getValue()}
                            columnType={getColumnType(colName)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    height: (() => {
                      const items = virtualizer.getVirtualItems();
                      const lastItem = items[items.length - 1];
                      return virtualizer.getTotalSize() - (lastItem?.end ?? 0);
                    })(),
                    padding: 0,
                    border: 'none',
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <div className="flex items-center justify-center py-12 text-text-muted text-sm">
            No data
          </div>
        )}
      </div>

      <DataGridPagination />

      {detailCell && (
        <CellDetailDialog
          open
          onClose={() => setDetailCell(null)}
          value={detailCell.value}
          columnName={detailCell.columnName}
          columnType={detailCell.columnType}
        />
      )}
    </div>
  );
}
