import { Table2, Eye, ListTree } from 'lucide-react';

interface TableListItemProps {
  name: string;
  rowCount?: number;
  isActive: boolean;
  type: 'table' | 'view' | 'index';
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const iconMap = {
  table: Table2,
  view: Eye,
  index: ListTree,
};

export default function TableListItem({
  name,
  rowCount,
  isActive,
  type,
  onClick,
  onContextMenu,
}: TableListItemProps) {
  const Icon = iconMap[type];

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm w-full text-left transition-colors ${
        isActive
          ? 'bg-accent/10 text-accent'
          : 'text-text-primary hover:bg-bg-tertiary'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
      <span className="truncate flex-1">{name}</span>
      {rowCount !== undefined && (
        <span className="text-xs text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded shrink-0">
          {rowCount.toLocaleString()}
        </span>
      )}
    </button>
  );
}
