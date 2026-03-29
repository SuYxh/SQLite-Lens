import { useEffect, useState } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useDatabaseStore } from '@/stores/databaseStore';
import { isSupportedFile } from '@/utils/file';

export function useDragDrop() {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();

    const unlisten = appWindow.onDragDropEvent((event) => {
      if (event.payload.type === 'over') {
        setIsDragging(true);
      } else if (event.payload.type === 'drop') {
        setIsDragging(false);
        const paths = event.payload.paths;
        if (paths.length > 0) {
          const filePath = paths[0];
          if (isSupportedFile(filePath)) {
            useDatabaseStore.getState().openDatabase(filePath);
          }
        }
      } else if (event.payload.type === 'leave') {
        setIsDragging(false);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return { isDragging };
}
