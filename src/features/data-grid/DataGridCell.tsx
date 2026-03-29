interface DataGridCellProps {
  value: unknown;
  columnType: string;
}

export default function DataGridCell({ value, columnType }: DataGridCellProps) {
  if (value === null || value === undefined) {
    return (
      <span className="italic text-null">NULL</span>
    );
  }

  if (
    value instanceof ArrayBuffer ||
    value instanceof Uint8Array ||
    columnType.toLowerCase().includes('blob')
  ) {
    return <span className="text-text-muted">[BLOB]</span>;
  }

  const isNumeric =
    typeof value === 'number' ||
    columnType.toLowerCase().includes('int') ||
    columnType.toLowerCase().includes('real') ||
    columnType.toLowerCase().includes('float') ||
    columnType.toLowerCase().includes('double') ||
    columnType.toLowerCase().includes('numeric');

  const strValue = String(value);

  if (strValue.length > 200) {
    return (
      <span className={isNumeric ? 'text-right block' : ''} title={strValue}>
        {strValue.slice(0, 200)}…
      </span>
    );
  }

  return (
    <span className={isNumeric ? 'text-right block' : ''}>
      {strValue}
    </span>
  );
}
