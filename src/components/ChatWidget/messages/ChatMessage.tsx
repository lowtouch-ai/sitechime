import React, { useState } from 'react';
import { ChatTheme } from '../types';
import { ThinkingSection } from './ThinkingSection';
import { FileAttachment, RAGFile } from '../../../types/chat';
import { ImageModal } from './ImageModal';
import { MessageAuthor } from './MessageAuthor';
import { RagFilesList } from './RagFilesList';
import { MessageContent } from './MessageContent';

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
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>('Image');
  
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

  // Handler for image clicks
  const handleImageClick = (url: string, title?: string) => {
    setEnlargedImage(url);
    setImageTitle(title || 'Image');
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
        <MessageAuthor 
          role={role} 
          botName={botName} 
          botAvatarUrl={botAvatarUrl} 
          theme={theme} 
        />
        
        {(thinkingContent || inProgressThinking) && role === 'assistant' && (
          <ThinkingSection
            content={thinkingContent || ''}
            isExpanded={thinkingExpanded}
            onToggle={onToggleThinking}
            theme={theme}
            inProgress={inProgressThinking}
          />
        )}
        
        <MessageContent 
          content={regularContent || ' '} 
          role={role} 
          theme={theme}
          onImageClick={handleImageClick}
        />
        
        {ragFiles && ragFiles.length > 0 && role === 'user' && (
          <RagFilesList 
            files={ragFiles} 
            role={role} 
            theme={theme} 
          />
        )}
      </div>

      {/* Image modal for enlarged view */}
      {enlargedImage && (
        <ImageModal 
          imageUrl={enlargedImage} 
          imageTitle={imageTitle}
          onClose={() => setEnlargedImage(null)} 
        />
      )}
    </>
  );
};