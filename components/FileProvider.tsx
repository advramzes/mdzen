import React, { createContext, useCallback, useState } from 'react';

interface OpenFile {
  name: string;
  uri: string;
  content: string;
}

interface FileContextValue {
  openFile: OpenFile | null;
  setOpenFile: (file: OpenFile | null) => void;
}

export const FileContext = createContext<FileContextValue>({
  openFile: null,
  setOpenFile: () => {},
});

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [openFile, setOpenFileState] = useState<OpenFile | null>(null);

  const setOpenFile = useCallback((file: OpenFile | null) => {
    setOpenFileState(file);
  }, []);

  return (
    <FileContext.Provider value={{ openFile, setOpenFile }}>
      {children}
    </FileContext.Provider>
  );
}
