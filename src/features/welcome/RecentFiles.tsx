import { Database } from 'lucide-react';
import type { RecentFile } from '@/types/config';
import { formatFileSize, formatDate } from '@/utils/format';

interface RecentFilesProps {
  files: RecentFile[];
  onOpenFile: (path: string) => void;
}

export default function RecentFiles({ files, onOpenFile }: RecentFilesProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted text-sm">没有最近打开的文件</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h3 className="text-text-secondary text-sm font-medium mb-3">最近打开</h3>
      <div className="flex flex-col gap-1">
        {files.map((file) => (
          <button
            key={file.path}
            onClick={() => onOpenFile(file.path)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary transition-colors text-left w-full group"
          >
            <Database className="w-4 h-4 text-text-muted group-hover:text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate">
                {file.name}
              </p>
              <p className="text-text-muted text-xs truncate">{file.path}</p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-text-muted text-xs">
                {formatFileSize(file.size)}
              </span>
              <span className="text-text-muted text-xs">
                {formatDate(file.last_opened)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
