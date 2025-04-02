import React from 'react';
import { DocumentTextIcon, DocumentIcon, FolderIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';
import { ThinkingSection } from './ThinkingSection';
import { FileAttachment, RAGFile } from '../../../types/chat';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  botName: string;
  botAvatarUrl?: string;
  theme: ChatTheme;
  thinkingExpanded: boolean;
  onToggleThinking: () => void;
  fileAttachment?: FileAttachment;
  ragFiles?: RAGFile[];
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  botName,
  botAvatarUrl,
  theme,
  thinkingExpanded,
  onToggleThinking,
  fileAttachment,
  ragFiles
}) => {
  // Process message content to extract thinking tokens
  const processMessageContent = (content: string) => {
    if (content.includes('<think>') && !content.includes('</think>')) {
      const parts = content.split('<think>');
      return {
        regularContent: parts[0] || '',
        thinkingContent: parts[1] || '',
        inProgressThinking: true
      };
    }
    
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
    let match;
    let regularContent = content;
    let thinkingContent = null;
    
    while ((match = thinkingRegex.exec(content)) !== null) {
      thinkingContent = match[1];
      regularContent = regularContent.replace(match[0], '');
    }
    
    return { 
      regularContent: regularContent.trim(),
      thinkingContent,
      inProgressThinking: false
    };
  };

  const { regularContent, thinkingContent, inProgressThinking } = processMessageContent(content);

  return (
    <div
      className={`chat-message ${
        role === 'user' ? 'message-user ml-auto' : 'message-assistant mr-auto'
      }`}
      style={{
        backgroundColor: role === 'user' ? theme.primary : theme.surface,
        color: role === 'user' ? theme.secondary : theme.text,
      }}
    >
      {role === 'assistant' && (
        <div className="flex items-center mb-1">
          {botAvatarUrl ? (
            <img 
              src={botAvatarUrl} 
              alt={botName}
              className="w-5 h-5 rounded-full mr-2"
            />
          ) : (
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mr-2"
              style={{ backgroundColor: theme.primary, color: theme.secondary }}
            >
              {botName.charAt(0)}
            </div>
          )}
          <span className="text-xs font-medium">{botName}</span>
        </div>
      )}
      
      {role === 'user' && (
        <div className="flex items-center justify-end mb-1">
          <span className="text-xs font-medium">You</span>
        </div>
      )}
      
      {(thinkingContent || inProgressThinking) && role === 'assistant' && (
        <ThinkingSection
          content={thinkingContent || ''}
          isExpanded={thinkingExpanded}
          onToggle={onToggleThinking}
          theme={theme}
          inProgress={inProgressThinking}
        />
      )}
      
      <div 
        className={`whitespace-pre-wrap text-sm ${role === 'user' ? 'text-right' : 'text-left'}`}
        data-testid="message-content"
      >
        {regularContent || ' '}
        
        {fileAttachment && role === 'user' && (
          <div className={`file-attachment mt-2 flex ${role === 'user' ? 'justify-end' : 'justify-start'} items-center`}>
            <div 
              className="bg-white rounded-md px-2 py-1 flex items-center gap-1 text-xs"
              style={{
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              <DocumentTextIcon className="h-3 w-3" />
              <span className="font-medium">{fileAttachment.name}</span>
            </div>
          </div>
        )}
        
        {ragFiles && ragFiles.length > 0 && role === 'user' && (
          <div className={`rag-files mt-2 flex flex-wrap ${role === 'user' ? 'justify-end' : 'justify-start'} gap-1`}>
            {ragFiles.map((file) => (
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
        )}
      </div>
    </div>
  );
};