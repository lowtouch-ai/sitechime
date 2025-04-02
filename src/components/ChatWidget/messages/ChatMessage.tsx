import React, { useState } from 'react';
import { DocumentIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';
import { ThinkingSection } from './ThinkingSection';
import { FileAttachment, RAGFile } from '../../../types/chat';
import { useChatContext } from '../ChatContext';

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
  ragFiles
}) => {
  const { config } = useChatContext();
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  
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

  // Function to transform image URLs from relative to absolute
  const transformImageUrls = (html: string): string => {
    if (!config || !config.security.api.host) return html;
    
    const apiHost = config.security.api.host;
    
    // Replace image tags with transformed URLs
    return html.replace(
      /(!\[.*?\]\()(\/?static\/.*?)(\))/g, 
      (match, prefix, url, suffix) => {
        // Remove leading slash if present
        const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
        return `${prefix}${apiHost}/api/openai/${cleanUrl}${suffix}`;
      }
    );
  };

  // Function to render markdown-style images as HTML with click functionality
  const renderContentWithImages = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Transform image URLs first
    const transformedContent = transformImageUrls(content);
    
    // Match markdown image syntax: ![alt text](/path/to/image.png)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    
    let match;
    while ((match = regex.exec(transformedContent)) !== null) {
      // Add the text before the image
      if (match.index > lastIndex) {
        parts.push(transformedContent.slice(lastIndex, match.index));
      }
      
      const [fullMatch, altText, imageUrl] = match;
      
      // Add the image with click handler
      parts.push(
        <img
          key={`img-${match.index}`}
          src={imageUrl}
          alt={altText || 'Image'}
          className="max-w-full rounded-md my-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setEnlargedImage(imageUrl)}
          style={{ maxHeight: '300px' }}
        />
      );
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add the remaining text after the last image
    if (lastIndex < transformedContent.length) {
      parts.push(transformedContent.slice(lastIndex));
    }
    
    return parts;
  };

  const { regularContent, thinkingContent, inProgressThinking } = processMessageContent(content);

  return (
    <>
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
          {role === 'user' ? (
            regularContent || ' '
          ) : (
            renderContentWithImages(regularContent || ' ')
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

      {/* Image modal for enlarged view */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button 
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                setEnlargedImage(null);
              }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img 
              src={enlargedImage} 
              alt="Enlarged view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};