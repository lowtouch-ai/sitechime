import React from 'react';
import { DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';
import { RAGFile } from '../../../types/chat';

interface RagFilesListProps {
  files: RAGFile[];
  role: 'user' | 'assistant';
  theme: ChatTheme;
}

export const RagFilesList: React.FC<RagFilesListProps> = ({ files, role, theme }) => {
  return (
    <div className={`rag-files mt-2 flex flex-wrap ${role === 'user' ? 'justify-end' : 'justify-start'} gap-1`}>
      {files.map((file) => (
        <div 
          key={file.id}
          className="bg-white rounded-md px-2 py-1 flex items-center gap-1 text-xs"
          style={{
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        >
          {file.type === 'file' ? (
            <DocumentIcon className="h-3 w-3" />
          ) : (
            <FolderIcon className="h-3 w-3" />
          )}
          <span className="font-medium">{file.name || `${file.type} (${file.id.substring(0, 8)})`}</span>
        </div>
      ))}
    </div>
  );
};